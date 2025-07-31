from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.user import User
from models.vehicle import Vehicle
from models.appointment import Appointment
from models.incident import Incident
from datetime import datetime

users_bp = Blueprint('users', __name__)

@users_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_user_dashboard():
    """Get user dashboard with summary statistics."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_vehicles = Vehicle.query.filter_by(user_id=user_id).count()
        vehicles_due_service = Vehicle.query.filter_by(user_id=user_id).filter(
            Vehicle.next_service_due <= datetime.now().date()
        ).count() if Vehicle.query.filter_by(user_id=user_id).first() else 0
        
        total_appointments = Appointment.query.filter_by(user_id=user_id).count()
        upcoming_appointments = Appointment.query.filter_by(user_id=user_id).filter(
            Appointment.appointment_date >= datetime.utcnow(),
            Appointment.status.in_(['scheduled', 'confirmed'])
        ).count()
        
        total_incidents = Incident.query.filter_by(user_id=user_id).count()
        pending_incidents = Incident.query.filter_by(user_id=user_id, status='pending').count()
        
        # Get recent activities
        recent_appointments = Appointment.query.filter_by(user_id=user_id).order_by(
            Appointment.created_at.desc()
        ).limit(3).all()
        
        recent_incidents = Incident.query.filter_by(user_id=user_id).order_by(
            Incident.reported_date.desc()
        ).limit(3).all()
        
        return jsonify({
            'user': user.to_dict(),
            'statistics': {
                'vehicles': {
                    'total': total_vehicles,
                    'due_service': vehicles_due_service
                },
                'appointments': {
                    'total': total_appointments,
                    'upcoming': upcoming_appointments
                },
                'incidents': {
                    'total': total_incidents,
                    'pending': pending_incidents
                }
            },
            'recent_activities': {
                'appointments': [appointment.to_dict() for appointment in recent_appointments],
                'incidents': [incident.to_dict() for incident in recent_incidents]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get dashboard data', 'details': str(e)}), 500

@users_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_user_statistics():
    """Get detailed user statistics."""
    try:
        user_id = get_jwt_identity()
        
        # Vehicle statistics
        vehicles = Vehicle.query.filter_by(user_id=user_id).all()
        vehicle_stats = {
            'total': len(vehicles),
            'by_status': {},
            'by_fuel_type': {},
            'average_age': 0,
            'total_mileage': 0
        }
        
        if vehicles:
            from collections import Counter
            current_year = datetime.now().year
            
            # Count by status and fuel type
            vehicle_stats['by_status'] = Counter([v.status for v in vehicles])
            vehicle_stats['by_fuel_type'] = Counter([v.fuel_type for v in vehicles if v.fuel_type])
            
            # Calculate averages
            ages = [current_year - v.year for v in vehicles]
            vehicle_stats['average_age'] = sum(ages) / len(ages) if ages else 0
            vehicle_stats['total_mileage'] = sum([v.mileage for v in vehicles if v.mileage])
        
        # Appointment statistics
        appointments = Appointment.query.filter_by(user_id=user_id).all()
        appointment_stats = {
            'total': len(appointments),
            'by_status': {},
            'total_cost': 0,
            'average_cost': 0
        }
        
        if appointments:
            from collections import Counter
            appointment_stats['by_status'] = Counter([a.status for a in appointments])
            costs = [float(a.cost) for a in appointments if a.cost]
            appointment_stats['total_cost'] = sum(costs)
            appointment_stats['average_cost'] = sum(costs) / len(costs) if costs else 0
        
        # Incident statistics
        incidents = Incident.query.filter_by(user_id=user_id).all()
        incident_stats = {
            'total': len(incidents),
            'by_status': {},
            'by_type': {},
            'by_severity': {}
        }
        
        if incidents:
            from collections import Counter
            incident_stats['by_status'] = Counter([i.status for i in incidents])
            incident_stats['by_type'] = Counter([i.incident_type for i in incidents])
            incident_stats['by_severity'] = Counter([i.severity for i in incidents])
        
        return jsonify({
            'vehicles': vehicle_stats,
            'appointments': appointment_stats,
            'incidents': incident_stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get statistics', 'details': str(e)}), 500

@users_bp.route('/activity-history', methods=['GET'])
@jwt_required()
def get_activity_history():
    """Get user's activity history."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        activity_type = request.args.get('type')  # 'appointments', 'incidents', 'all'
        
        activities = []
        
        if not activity_type or activity_type in ['appointments', 'all']:
            appointments = Appointment.query.filter_by(user_id=user_id).all()
            for appointment in appointments:
                activities.append({
                    'type': 'appointment',
                    'id': appointment.id,
                    'title': f'Service Appointment - {appointment.service.name}',
                    'description': f'Appointment for {appointment.vehicle.make} {appointment.vehicle.model}',
                    'status': appointment.status,
                    'date': appointment.appointment_date.isoformat(),
                    'created_at': appointment.created_at.isoformat(),
                    'data': appointment.to_dict()
                })
        
        if not activity_type or activity_type in ['incidents', 'all']:
            incidents = Incident.query.filter_by(user_id=user_id).all()
            for incident in incidents:
                activities.append({
                    'type': 'incident',
                    'id': incident.id,
                    'title': incident.title,
                    'description': incident.description[:100] + '...' if len(incident.description) > 100 else incident.description,
                    'status': incident.status,
                    'date': incident.incident_date.isoformat(),
                    'created_at': incident.created_at.isoformat(),
                    'data': incident.to_dict()
                })
        
        # Sort by creation date (newest first)
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Paginate results
        start = (page - 1) * per_page
        end = start + per_page
        paginated_activities = activities[start:end]
        
        total = len(activities)
        pages = (total + per_page - 1) // per_page
        
        return jsonify({
            'activities': paginated_activities,
            'pagination': {
                'page': page,
                'pages': pages,
                'per_page': per_page,
                'total': total,
                'has_next': page < pages,
                'has_prev': page > 1
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get activity history', 'details': str(e)}), 500