from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from datetime import datetime, date
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.user import User
from models.vehicle import Vehicle

vehicles_bp = Blueprint('vehicles', __name__)

# Validation schemas
class VehicleSchema(Schema):
    make = fields.Str(required=True)
    model = fields.Str(required=True)
    year = fields.Int(required=True)
    vin = fields.Str()
    license_plate = fields.Str()
    color = fields.Str()
    mileage = fields.Int()
    fuel_type = fields.Str()
    transmission = fields.Str()
    engine_size = fields.Str()
    purchase_date = fields.Date()
    insurance_expiry = fields.Date()
    registration_expiry = fields.Date()
    notes = fields.Str()

@vehicles_bp.route('/', methods=['POST'])
@jwt_required()
def create_vehicle():
    """Create a new vehicle for the user."""
    try:
        user_id = get_jwt_identity()
        
        # Validate input data
        schema = VehicleSchema()
        data = schema.load(request.get_json())
        
        # Check for duplicate VIN or license plate
        if data.get('vin'):
            existing_vin = Vehicle.query.filter_by(vin=data['vin']).first()
            if existing_vin:
                return jsonify({'error': 'Vehicle with this VIN already exists'}), 400
        
        if data.get('license_plate'):
            existing_plate = Vehicle.query.filter_by(license_plate=data['license_plate']).first()
            if existing_plate:
                return jsonify({'error': 'Vehicle with this license plate already exists'}), 400
        
        # Create new vehicle
        vehicle = Vehicle(
            user_id=user_id,
            **data
        )
        
        db.session.add(vehicle)
        db.session.commit()
        
        return jsonify({
            'message': 'Vehicle created successfully',
            'vehicle': vehicle.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create vehicle', 'details': str(e)}), 500

@vehicles_bp.route('/', methods=['GET'])
@jwt_required()
def get_vehicles():
    """Get all vehicles for the current user."""
    try:
        user_id = get_jwt_identity()
        vehicles = Vehicle.query.filter_by(user_id=user_id).order_by(Vehicle.created_at.desc()).all()
        
        return jsonify({
            'vehicles': [vehicle.to_dict() for vehicle in vehicles]
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get vehicles', 'details': str(e)}), 500

@vehicles_bp.route('/<int:vehicle_id>', methods=['GET'])
@jwt_required()
def get_vehicle(vehicle_id):
    """Get a specific vehicle."""
    try:
        user_id = get_jwt_identity()
        vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        return jsonify({'vehicle': vehicle.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get vehicle', 'details': str(e)}), 500

@vehicles_bp.route('/<int:vehicle_id>', methods=['PUT'])
@jwt_required()
def update_vehicle(vehicle_id):
    """Update a vehicle."""
    try:
        user_id = get_jwt_identity()
        vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        # Validate input data
        schema = VehicleSchema()
        data = schema.load(request.get_json())
        
        # Check for duplicate VIN or license plate (excluding current vehicle)
        if data.get('vin') and data['vin'] != vehicle.vin:
            existing_vin = Vehicle.query.filter_by(vin=data['vin']).first()
            if existing_vin:
                return jsonify({'error': 'Vehicle with this VIN already exists'}), 400
        
        if data.get('license_plate') and data['license_plate'] != vehicle.license_plate:
            existing_plate = Vehicle.query.filter_by(license_plate=data['license_plate']).first()
            if existing_plate:
                return jsonify({'error': 'Vehicle with this license plate already exists'}), 400
        
        # Update vehicle data
        for key, value in data.items():
            if hasattr(vehicle, key):
                setattr(vehicle, key, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Vehicle updated successfully',
            'vehicle': vehicle.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update vehicle', 'details': str(e)}), 500

@vehicles_bp.route('/<int:vehicle_id>', methods=['DELETE'])
@jwt_required()
def delete_vehicle(vehicle_id):
    """Delete a vehicle."""
    try:
        user_id = get_jwt_identity()
        vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        db.session.delete(vehicle)
        db.session.commit()
        
        return jsonify({'message': 'Vehicle deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete vehicle', 'details': str(e)}), 500

@vehicles_bp.route('/<int:vehicle_id>/mileage', methods=['PUT'])
@jwt_required()
def update_mileage(vehicle_id):
    """Update vehicle mileage."""
    try:
        user_id = get_jwt_identity()
        vehicle = Vehicle.query.filter_by(id=vehicle_id, user_id=user_id).first()
        
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        
        data = request.get_json()
        new_mileage = data.get('mileage')
        
        if not new_mileage or new_mileage < 0:
            return jsonify({'error': 'Valid mileage is required'}), 400
        
        if new_mileage < vehicle.mileage:
            return jsonify({'error': 'New mileage cannot be less than current mileage'}), 400
        
        vehicle.mileage = new_mileage
        
        # Update next service date if needed (3000km intervals)
        if vehicle.mileage >= vehicle.calculate_next_service_mileage():
            # Calculate next service due date (assuming 3 months or 3000km, whichever comes first)
            from datetime import timedelta
            vehicle.next_service_due = datetime.now().date() + timedelta(days=90)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Mileage updated successfully',
            'vehicle': vehicle.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update mileage', 'details': str(e)}), 500