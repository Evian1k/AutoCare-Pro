from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.user import User
from models.vehicle import Vehicle
from models.service import Service
from models.appointment import Appointment

appointments_bp = Blueprint('appointments', __name__)

# Validation schemas
class AppointmentSchema(Schema):
    vehicle_id = fields.Int(required=True)
    service_id = fields.Int(required=True)
    appointment_date = fields.DateTime(required=True)
    priority = fields.Str(missing='normal')
    current_mileage = fields.Int()
    notes = fields.Str()

class AppointmentUpdateSchema(Schema):
    appointment_date = fields.DateTime()
    priority = fields.Str()
    current_mileage = fields.Int()
    notes = fields.Str()
    status = fields.Str()

@appointments_bp.route('/', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create a new service appointment."""
    try:
        user_id = get_jwt_identity()
        
        # Validate input data
        schema = AppointmentSchema()
        data = schema.load(request.get_json())
        
        # Validate vehicle ownership
        vehicle = Vehicle.query.filter_by(id=data['vehicle_id'], user_id=user_id).first()
        if not vehicle:
            return jsonify({'error': 'Vehicle not found or not owned by user'}), 404
        
        # Validate service exists and is active
        service = Service.query.filter_by(id=data['service_id'], is_active=True).first()
        if not service:
            return jsonify({'error': 'Service not found or not available'}), 404
        
        # Check if appointment date is in the future
        if data['appointment_date'] <= datetime.utcnow():
            return jsonify({'error': 'Appointment date must be in the future'}), 400
        
        # Calculate estimated completion time
        estimated_completion = data['appointment_date']
        if service.duration_hours:
            estimated_completion += timedelta(hours=service.duration_hours)
        
        # Create new appointment
        appointment = Appointment(
            user_id=user_id,
            vehicle_id=data['vehicle_id'],
            service_id=data['service_id'],
            appointment_date=data['appointment_date'],
            priority=data.get('priority', 'normal'),
            current_mileage=data.get('current_mileage'),
            notes=data.get('notes'),
            estimated_completion=estimated_completion,
            cost=service.price
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment created successfully',
            'appointment': appointment.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create appointment', 'details': str(e)}), 500

@appointments_bp.route('/', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get all appointments for the current user."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        upcoming_only = request.args.get('upcoming_only', 'false').lower() == 'true'
        
        query = Appointment.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        if upcoming_only:
            query = query.filter(Appointment.appointment_date >= datetime.utcnow())
        
        appointments = query.order_by(Appointment.appointment_date.asc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'appointments': [appointment.to_dict() for appointment in appointments.items],
            'pagination': {
                'page': page,
                'pages': appointments.pages,
                'per_page': per_page,
                'total': appointments.total,
                'has_next': appointments.has_next,
                'has_prev': appointments.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get appointments', 'details': str(e)}), 500

@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    """Get a specific appointment."""
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        return jsonify({'appointment': appointment.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get appointment', 'details': str(e)}), 500

@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update an appointment."""
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Check if appointment can be edited
        if appointment.status in ['completed', 'cancelled']:
            return jsonify({'error': 'Cannot edit completed or cancelled appointments'}), 400
        
        # Validate input data
        schema = AppointmentUpdateSchema()
        data = schema.load(request.get_json())
        
        # Check if new appointment date is in the future (if provided)
        if data.get('appointment_date') and data['appointment_date'] <= datetime.utcnow():
            return jsonify({'error': 'Appointment date must be in the future'}), 400
        
        # Update appointment data
        for key, value in data.items():
            if hasattr(appointment, key):
                setattr(appointment, key, value)
        
        # Update estimated completion if appointment date changed
        if data.get('appointment_date') and appointment.service.duration_hours:
            appointment.estimated_completion = appointment.appointment_date + timedelta(
                hours=appointment.service.duration_hours
            )
        
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update appointment', 'details': str(e)}), 500

@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    """Cancel an appointment."""
    try:
        user_id = get_jwt_identity()
        appointment = Appointment.query.filter_by(id=appointment_id, user_id=user_id).first()
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Check if appointment can be cancelled
        if appointment.status in ['completed', 'cancelled']:
            return jsonify({'error': 'Cannot cancel completed or already cancelled appointments'}), 400
        
        # Check if appointment is not too close (less than 24 hours)
        time_until_appointment = appointment.appointment_date - datetime.utcnow()
        if time_until_appointment.total_seconds() < 24 * 3600:  # 24 hours
            return jsonify({'error': 'Cannot cancel appointments less than 24 hours in advance'}), 400
        
        appointment.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'message': 'Appointment cancelled successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to cancel appointment', 'details': str(e)}), 500

@appointments_bp.route('/upcoming', methods=['GET'])
@jwt_required()
def get_upcoming_appointments():
    """Get upcoming appointments for the current user."""
    try:
        user_id = get_jwt_identity()
        hours = request.args.get('hours', 72, type=int)  # Default to 72 hours
        
        upcoming_date = datetime.utcnow() + timedelta(hours=hours)
        
        appointments = Appointment.query.filter_by(user_id=user_id).filter(
            Appointment.appointment_date >= datetime.utcnow(),
            Appointment.appointment_date <= upcoming_date,
            Appointment.status.in_(['scheduled', 'confirmed'])
        ).order_by(Appointment.appointment_date.asc()).all()
        
        return jsonify({
            'appointments': [appointment.to_dict() for appointment in appointments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get upcoming appointments', 'details': str(e)}), 500

@appointments_bp.route('/due-reminders', methods=['GET'])
@jwt_required()
def get_due_service_reminders():
    """Get vehicles that are due for service based on mileage or time."""
    try:
        user_id = get_jwt_identity()
        
        # Get user's vehicles that are due for service
        vehicles = Vehicle.query.filter_by(user_id=user_id).all()
        due_vehicles = []
        
        for vehicle in vehicles:
            if vehicle.is_service_due():
                # Check if there's already a scheduled appointment
                existing_appointment = Appointment.query.filter_by(
                    vehicle_id=vehicle.id,
                    status='scheduled'
                ).filter(
                    Appointment.appointment_date >= datetime.utcnow()
                ).first()
                
                if not existing_appointment:
                    due_vehicles.append({
                        'vehicle': vehicle.to_dict(),
                        'days_overdue': (datetime.now().date() - vehicle.next_service_due).days if vehicle.next_service_due else 0,
                        'recommended_services': [
                            service.to_dict() for service in Service.query.filter_by(
                                category='maintenance',
                                is_active=True
                            ).all()
                        ]
                    })
        
        return jsonify({'due_vehicles': due_vehicles}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get service reminders', 'details': str(e)}), 500