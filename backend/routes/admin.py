from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, timedelta
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.user import User
from models.appointment import Appointment
from models.incident import Incident
from models.notification import Notification

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to check if user has admin privileges."""
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_admin():
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Validation schemas
class AppointmentStatusUpdateSchema(Schema):
    status = fields.Str(required=True)
    admin_notes = fields.Str()
    actual_completion = fields.DateTime()
    cost = fields.Decimal()

class IncidentStatusUpdateSchema(Schema):
    status = fields.Str(required=True)
    admin_notes = fields.Str()
    resolution_details = fields.Str()

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_dashboard():
    """Get admin dashboard statistics."""
    try:
        # Get various statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        
        total_appointments = Appointment.query.count()
        pending_appointments = Appointment.query.filter_by(status='scheduled').count()
        today_appointments = Appointment.query.filter(
            Appointment.appointment_date >= datetime.utcnow().date(),
            Appointment.appointment_date < datetime.utcnow().date() + timedelta(days=1)
        ).count()
        
        total_incidents = Incident.query.count()
        pending_incidents = Incident.query.filter_by(status='pending').count()
        under_investigation = Incident.query.filter_by(status='under_investigation').count()
        
        # Recent activities
        recent_appointments = Appointment.query.order_by(
            Appointment.created_at.desc()
        ).limit(5).all()
        
        recent_incidents = Incident.query.order_by(
            Incident.reported_date.desc()
        ).limit(5).all()
        
        return jsonify({
            'statistics': {
                'users': {
                    'total': total_users,
                    'active': active_users
                },
                'appointments': {
                    'total': total_appointments,
                    'pending': pending_appointments,
                    'today': today_appointments
                },
                'incidents': {
                    'total': total_incidents,
                    'pending': pending_incidents,
                    'under_investigation': under_investigation
                }
            },
            'recent_activities': {
                'appointments': [appointment.to_dict() for appointment in recent_appointments],
                'incidents': [incident.to_dict() for incident in recent_incidents]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get dashboard data', 'details': str(e)}), 500

@admin_bp.route('/appointments', methods=['GET'])
@jwt_required()
@admin_required
def get_all_appointments():
    """Get all appointments (admin view)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        priority = request.args.get('priority')
        
        query = Appointment.query
        
        if status:
            query = query.filter_by(status=status)
        if priority:
            query = query.filter_by(priority=priority)
        
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

@admin_bp.route('/appointments/<int:appointment_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_appointment_status(appointment_id):
    """Update appointment status (admin only)."""
    try:
        appointment = Appointment.query.get(appointment_id)
        
        if not appointment:
            return jsonify({'error': 'Appointment not found'}), 404
        
        # Validate input data
        schema = AppointmentStatusUpdateSchema()
        data = schema.load(request.get_json())
        
        old_status = appointment.status
        
        # Update appointment
        appointment.status = data['status']
        if data.get('admin_notes'):
            appointment.admin_notes = data['admin_notes']
        if data.get('actual_completion'):
            appointment.actual_completion = data['actual_completion']
        if data.get('cost'):
            appointment.cost = data['cost']
        
        # Set completion time for completed appointments
        if data['status'] == 'completed' and not appointment.actual_completion:
            appointment.actual_completion = datetime.utcnow()
        
        db.session.commit()
        
        # Send notification to user if status changed
        if old_status != data['status']:
            notification = Notification(
                user_id=appointment.user_id,
                title=f'Appointment Status Updated',
                message=f'Your appointment for {appointment.service.name} has been {data["status"]}.',
                notification_type='email',
                category='appointment',
                reference_type='appointment',
                reference_id=appointment.id
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify({
            'message': 'Appointment status updated successfully',
            'appointment': appointment.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update appointment status', 'details': str(e)}), 500

@admin_bp.route('/incidents', methods=['GET'])
@jwt_required()
@admin_required
def get_all_incidents():
    """Get all incidents (admin view)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        incident_type = request.args.get('incident_type')
        severity = request.args.get('severity')
        
        query = Incident.query
        
        if status:
            query = query.filter_by(status=status)
        if incident_type:
            query = query.filter_by(incident_type=incident_type)
        if severity:
            query = query.filter_by(severity=severity)
        
        incidents = query.order_by(Incident.reported_date.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'incidents': [incident.to_dict() for incident in incidents.items],
            'pagination': {
                'page': page,
                'pages': incidents.pages,
                'per_page': per_page,
                'total': incidents.total,
                'has_next': incidents.has_next,
                'has_prev': incidents.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get incidents', 'details': str(e)}), 500

@admin_bp.route('/incidents/<int:incident_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def update_incident_status(incident_id):
    """Update incident status (admin only)."""
    try:
        incident = Incident.query.get(incident_id)
        
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        # Validate input data
        schema = IncidentStatusUpdateSchema()
        data = schema.load(request.get_json())
        
        old_status = incident.status
        
        # Update incident
        incident.status = data['status']
        if data.get('admin_notes'):
            incident.admin_notes = data['admin_notes']
        if data.get('resolution_details'):
            incident.resolution_details = data['resolution_details']
        
        # Set resolved date for resolved incidents
        if data['status'] == 'resolved' and not incident.resolved_date:
            incident.resolved_date = datetime.utcnow()
        
        db.session.commit()
        
        # Send notification to user if status changed
        if old_status != data['status']:
            notification = Notification(
                user_id=incident.user_id,
                title=f'Incident Status Updated',
                message=f'Your incident "{incident.title}" has been {data["status"]}.',
                notification_type='email',
                category='incident',
                reference_type='incident',
                reference_id=incident.id
            )
            db.session.add(notification)
            db.session.commit()
        
        return jsonify({
            'message': 'Incident status updated successfully',
            'incident': incident.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update incident status', 'details': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Get all users (admin view)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        active_only = request.args.get('active_only', 'false').lower() == 'true'
        
        query = User.query
        
        if active_only:
            query = query.filter_by(is_active=True)
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'pagination': {
                'page': page,
                'pages': users.pages,
                'per_page': per_page,
                'total': users.total,
                'has_next': users.has_next,
                'has_prev': users.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get users', 'details': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    """Toggle user active status (admin only)."""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Don't allow deactivating the last admin
        if user.is_admin() and user.is_active:
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot deactivate the last admin user'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        status = 'activated' if user.is_active else 'deactivated'
        
        return jsonify({
            'message': f'User {status} successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to toggle user status', 'details': str(e)}), 500