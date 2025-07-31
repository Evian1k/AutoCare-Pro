from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.user import User
from models.service import Service, ServicePart

services_bp = Blueprint('services', __name__)

# Validation schemas
class ServiceSchema(Schema):
    name = fields.Str(required=True)
    description = fields.Str()
    category = fields.Str()
    duration_hours = fields.Float()
    price = fields.Decimal()
    service_interval_km = fields.Int()
    requires_appointment = fields.Bool()

class ServicePartSchema(Schema):
    part_name = fields.Str(required=True)
    part_number = fields.Str()
    quantity = fields.Int()
    unit_price = fields.Decimal()
    supplier = fields.Str()
    is_required = fields.Bool()
    description = fields.Str()

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

@services_bp.route('/', methods=['GET'])
def get_services():
    """Get all available services."""
    try:
        category = request.args.get('category')
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        
        query = Service.query
        
        if active_only:
            query = query.filter_by(is_active=True)
        if category:
            query = query.filter_by(category=category)
        
        services = query.order_by(Service.name).all()
        
        return jsonify({
            'services': [service.to_dict() for service in services]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get services', 'details': str(e)}), 500

@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    """Get a specific service with its parts."""
    try:
        service = Service.query.get(service_id)
        
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        return jsonify({'service': service.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get service', 'details': str(e)}), 500

@services_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_service():
    """Create a new service (admin only)."""
    try:
        # Validate input data
        schema = ServiceSchema()
        data = schema.load(request.get_json())
        
        # Create new service
        service = Service(**data)
        
        db.session.add(service)
        db.session.commit()
        
        return jsonify({
            'message': 'Service created successfully',
            'service': service.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create service', 'details': str(e)}), 500

@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_service(service_id):
    """Update a service (admin only)."""
    try:
        service = Service.query.get(service_id)
        
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        # Validate input data
        schema = ServiceSchema()
        data = schema.load(request.get_json())
        
        # Update service data
        for key, value in data.items():
            if hasattr(service, key):
                setattr(service, key, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Service updated successfully',
            'service': service.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update service', 'details': str(e)}), 500

@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_service(service_id):
    """Delete a service (admin only)."""
    try:
        service = Service.query.get(service_id)
        
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        db.session.delete(service)
        db.session.commit()
        
        return jsonify({'message': 'Service deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete service', 'details': str(e)}), 500

@services_bp.route('/<int:service_id>/parts', methods=['POST'])
@jwt_required()
@admin_required
def add_service_part(service_id):
    """Add a part to a service (admin only)."""
    try:
        service = Service.query.get(service_id)
        
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        # Validate input data
        schema = ServicePartSchema()
        data = schema.load(request.get_json())
        
        # Create new service part
        part = ServicePart(
            service_id=service_id,
            **data
        )
        
        db.session.add(part)
        db.session.commit()
        
        return jsonify({
            'message': 'Service part added successfully',
            'part': part.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add service part', 'details': str(e)}), 500

@services_bp.route('/parts/<int:part_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_service_part(part_id):
    """Update a service part (admin only)."""
    try:
        part = ServicePart.query.get(part_id)
        
        if not part:
            return jsonify({'error': 'Service part not found'}), 404
        
        # Validate input data
        schema = ServicePartSchema()
        data = schema.load(request.get_json())
        
        # Update part data
        for key, value in data.items():
            if hasattr(part, key):
                setattr(part, key, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Service part updated successfully',
            'part': part.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update service part', 'details': str(e)}), 500

@services_bp.route('/parts/<int:part_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_service_part(part_id):
    """Delete a service part (admin only)."""
    try:
        part = ServicePart.query.get(part_id)
        
        if not part:
            return jsonify({'error': 'Service part not found'}), 404
        
        db.session.delete(part)
        db.session.commit()
        
        return jsonify({'message': 'Service part deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete service part', 'details': str(e)}), 500

@services_bp.route('/categories', methods=['GET'])
def get_service_categories():
    """Get all service categories."""
    try:
        categories = db.session.query(Service.category).distinct().filter(
            Service.category.isnot(None),
            Service.is_active == True
        ).all()
        
        return jsonify({
            'categories': [cat[0] for cat in categories if cat[0]]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get service categories', 'details': str(e)}), 500