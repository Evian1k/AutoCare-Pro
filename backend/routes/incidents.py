from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, ValidationError
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db
from models.user import User
from models.vehicle import Vehicle
from models.incident import Incident, IncidentMedia

incidents_bp = Blueprint('incidents', __name__)

# Validation schemas
class IncidentSchema(Schema):
    title = fields.Str(required=True, validate=lambda x: len(x) >= 3)
    description = fields.Str(required=True, validate=lambda x: len(x) >= 10)
    incident_type = fields.Str(required=True)
    severity = fields.Str(missing='medium')
    vehicle_id = fields.Int()
    latitude = fields.Float()
    longitude = fields.Float()
    address = fields.Str()
    incident_date = fields.DateTime(required=True)

class IncidentUpdateSchema(Schema):
    title = fields.Str()
    description = fields.Str()
    incident_type = fields.Str()
    severity = fields.Str()
    vehicle_id = fields.Int()
    latitude = fields.Float()
    longitude = fields.Float()
    address = fields.Str()
    incident_date = fields.DateTime()

def allowed_file(filename):
    """Check if file type is allowed."""
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'wmv'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_type(filename):
    """Determine if file is image or video."""
    IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    extension = filename.rsplit('.', 1)[1].lower()
    return 'image' if extension in IMAGE_EXTENSIONS else 'video'

@incidents_bp.route('/', methods=['POST'])
@jwt_required()
def create_incident():
    """Create a new incident report."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate input data
        schema = IncidentSchema()
        data = schema.load(request.get_json())
        
        # Validate vehicle ownership if vehicle_id is provided
        if data.get('vehicle_id'):
            vehicle = Vehicle.query.filter_by(id=data['vehicle_id'], user_id=user_id).first()
            if not vehicle:
                return jsonify({'error': 'Vehicle not found or not owned by user'}), 404
        
        # Create new incident
        incident = Incident(
            user_id=user_id,
            title=data['title'],
            description=data['description'],
            incident_type=data['incident_type'],
            severity=data.get('severity', 'medium'),
            vehicle_id=data.get('vehicle_id'),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            address=data.get('address'),
            incident_date=data['incident_date']
        )
        
        db.session.add(incident)
        db.session.commit()
        
        return jsonify({
            'message': 'Incident created successfully',
            'incident': incident.to_dict()
        }), 201
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create incident', 'details': str(e)}), 500

@incidents_bp.route('/', methods=['GET'])
@jwt_required()
def get_incidents():
    """Get all incidents for the current user."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        incident_type = request.args.get('incident_type')
        
        query = Incident.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        if incident_type:
            query = query.filter_by(incident_type=incident_type)
        
        incidents = query.order_by(Incident.created_at.desc()).paginate(
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

@incidents_bp.route('/<int:incident_id>', methods=['GET'])
@jwt_required()
def get_incident(incident_id):
    """Get a specific incident."""
    try:
        user_id = get_jwt_identity()
        incident = Incident.query.filter_by(id=incident_id, user_id=user_id).first()
        
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        return jsonify({'incident': incident.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get incident', 'details': str(e)}), 500

@incidents_bp.route('/<int:incident_id>', methods=['PUT'])
@jwt_required()
def update_incident(incident_id):
    """Update an incident report."""
    try:
        user_id = get_jwt_identity()
        incident = Incident.query.filter_by(id=incident_id, user_id=user_id).first()
        
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        # Check if incident can be edited (not resolved or rejected)
        if incident.status in ['resolved', 'rejected']:
            return jsonify({'error': 'Cannot edit resolved or rejected incidents'}), 400
        
        # Validate input data
        schema = IncidentUpdateSchema()
        data = schema.load(request.get_json())
        
        # Validate vehicle ownership if vehicle_id is provided
        if data.get('vehicle_id'):
            vehicle = Vehicle.query.filter_by(id=data['vehicle_id'], user_id=user_id).first()
            if not vehicle:
                return jsonify({'error': 'Vehicle not found or not owned by user'}), 404
        
        # Update incident data
        for key, value in data.items():
            if hasattr(incident, key):
                setattr(incident, key, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Incident updated successfully',
            'incident': incident.to_dict()
        }), 200
        
    except ValidationError as err:
        return jsonify({'error': 'Validation failed', 'details': err.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update incident', 'details': str(e)}), 500

@incidents_bp.route('/<int:incident_id>', methods=['DELETE'])
@jwt_required()
def delete_incident(incident_id):
    """Delete an incident report."""
    try:
        user_id = get_jwt_identity()
        incident = Incident.query.filter_by(id=incident_id, user_id=user_id).first()
        
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        # Check if incident can be deleted (not under investigation or resolved)
        if incident.status in ['under_investigation', 'resolved']:
            return jsonify({'error': 'Cannot delete incidents under investigation or resolved'}), 400
        
        # Delete associated media files
        for media in incident.media:
            try:
                if os.path.exists(media.file_path):
                    os.remove(media.file_path)
            except:
                pass  # Continue if file deletion fails
        
        db.session.delete(incident)
        db.session.commit()
        
        return jsonify({'message': 'Incident deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete incident', 'details': str(e)}), 500

@incidents_bp.route('/<int:incident_id>/upload', methods=['POST'])
@jwt_required()
def upload_media(incident_id):
    """Upload media files for an incident."""
    try:
        user_id = get_jwt_identity()
        incident = Incident.query.filter_by(id=incident_id, user_id=user_id).first()
        
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        caption = request.form.get('caption', '')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed'}), 400
        
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'incidents', str(incident_id))
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        file.save(file_path)
        
        # Create media record
        media = IncidentMedia(
            incident_id=incident_id,
            file_type=get_file_type(file.filename),
            file_name=file.filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            mime_type=file.content_type,
            caption=caption
        )
        
        db.session.add(media)
        db.session.commit()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'media': media.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to upload file', 'details': str(e)}), 500

@incidents_bp.route('/<int:incident_id>/location', methods=['PUT'])
@jwt_required()
def update_location(incident_id):
    """Update incident geolocation."""
    try:
        user_id = get_jwt_identity()
        incident = Incident.query.filter_by(id=incident_id, user_id=user_id).first()
        
        if not incident:
            return jsonify({'error': 'Incident not found'}), 404
        
        data = request.get_json()
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        address = data.get('address')
        
        if latitude is None or longitude is None:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        incident.latitude = latitude
        incident.longitude = longitude
        if address:
            incident.address = address
        
        db.session.commit()
        
        return jsonify({
            'message': 'Location updated successfully',
            'incident': incident.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update location', 'details': str(e)}), 500

@incidents_bp.route('/public', methods=['GET'])
def get_public_incidents():
    """Get public incidents for map display."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        incidents = Incident.query.filter_by(is_public=True).filter(
            Incident.latitude.isnot(None),
            Incident.longitude.isnot(None)
        ).order_by(Incident.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'incidents': [incident.to_dict() for incident in incidents.items],
            'pagination': {
                'page': page,
                'pages': incidents.pages,
                'per_page': per_page,
                'total': incidents.total
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get public incidents', 'details': str(e)}), 500