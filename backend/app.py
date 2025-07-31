import os
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import uuid
import json

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'cmis-secret-key-2024')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://cmis_user:cmis_pass@localhost/cmis_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-cmis-2024')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# Email configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
cors = CORS(app)
mail = Mail(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Models
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    incident_reports = db.relationship('IncidentReport', backref='user', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='user', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat()
        }

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    vin = db.Column(db.String(17), unique=True, nullable=False)
    license_plate = db.Column(db.String(20), unique=True)
    color = db.Column(db.String(30))
    mileage = db.Column(db.Integer, default=0)
    status = db.Column(db.String(20), default='available')
    location = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    incident_reports = db.relationship('IncidentReport', backref='vehicle', lazy=True)
    appointments = db.relationship('Appointment', backref='vehicle', lazy=True)
    maintenance_records = db.relationship('MaintenanceRecord', backref='vehicle', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'vin': self.vin,
            'license_plate': self.license_plate,
            'color': self.color,
            'mileage': self.mileage,
            'status': self.status,
            'location': self.location,
            'created_at': self.created_at.isoformat()
        }

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    duration_hours = db.Column(db.Integer, default=1)
    service_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='service', lazy=True)
    service_parts = db.relationship('ServicePart', backref='service', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'duration_hours': self.duration_hours,
            'service_type': self.service_type,
            'parts': [{
                'id': sp.part.id,
                'name': sp.part.name,
                'part_number': sp.part.part_number,
                'quantity_required': sp.quantity_required,
                'price': sp.part.price
            } for sp in self.service_parts]
        }

class Part(db.Model):
    __tablename__ = 'parts'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    part_number = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, default=0)
    supplier = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    service_parts = db.relationship('ServicePart', backref='part', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'part_number': self.part_number,
            'description': self.description,
            'price': self.price,
            'stock_quantity': self.stock_quantity,
            'supplier': self.supplier
        }

class ServicePart(db.Model):
    __tablename__ = 'service_parts'
    
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey('parts.id'), nullable=False)
    quantity_required = db.Column(db.Integer, default=1)

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')
    notes = db.Column(db.Text)
    reminder_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.username,
            'vehicle': f"{self.vehicle.year} {self.vehicle.make} {self.vehicle.model}",
            'service': self.service.name,
            'appointment_date': self.appointment_date.isoformat(),
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class MaintenanceRecord(db.Model):
    __tablename__ = 'maintenance_records'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    service_type = db.Column(db.String(100), nullable=False)
    mileage_at_service = db.Column(db.Integer)
    service_date = db.Column(db.DateTime, default=datetime.utcnow)
    next_service_mileage = db.Column(db.Integer)
    next_service_date = db.Column(db.DateTime)
    cost = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class IncidentReport(db.Model):
    __tablename__ = 'incident_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    incident_type = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='pending')
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    location_description = db.Column(db.String(200))
    images = db.Column(db.JSON)
    videos = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'incident_type': self.incident_type,
            'status': self.status,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location_description': self.location_description,
            'images': self.images or [],
            'videos': self.videos or [],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user': self.user.username,
            'vehicle': f"{self.vehicle.year} {self.vehicle.make} {self.vehicle.model}" if self.vehicle else None
        }

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov', 'webm'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def send_email_notification(to_email, subject, body):
    try:
        if not app.config['MAIL_USERNAME']:
            print("Email not configured")
            return False
            
        msg = Message(subject, sender=app.config['MAIL_USERNAME'], recipients=[to_email])
        msg.body = body
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def send_sms_notification(phone_number, message):
    try:
        print(f"SMS to {phone_number}: {message}")
        return True
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return False

# Authentication Routes
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'message': 'No data provided'}), 400
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400
        
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            phone=data.get('phone'),
            is_admin=data.get('is_admin', False)
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating user: {str(e)}'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or 'username' not in data or 'password' not in data:
            return jsonify({'message': 'Username and password required'}), 400
        
        user = User.query.filter_by(username=data['username']).first()
        
        if user and check_password_hash(user.password_hash, data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        return jsonify({'message': f'Login error: {str(e)}'}), 500

# Vehicle Routes
@app.route('/api/vehicles', methods=['GET'])
@jwt_required()
def get_vehicles():
    try:
        vehicles = Vehicle.query.all()
        return jsonify([vehicle.to_dict() for vehicle in vehicles])
    except Exception as e:
        return jsonify({'message': f'Error fetching vehicles: {str(e)}'}), 500

@app.route('/api/vehicles', methods=['POST'])
@jwt_required()
def create_vehicle():
    try:
        data = request.get_json()
        
        required_fields = ['make', 'model', 'year', 'vin']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        vehicle = Vehicle(
            make=data['make'],
            model=data['model'],
            year=data['year'],
            vin=data['vin'],
            license_plate=data.get('license_plate'),
            color=data.get('color'),
            mileage=data.get('mileage', 0),
            status=data.get('status', 'available'),
            location=data.get('location')
        )
        
        db.session.add(vehicle)
        db.session.commit()
        
        return jsonify({'message': 'Vehicle created successfully', 'vehicle': vehicle.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating vehicle: {str(e)}'}), 500

# Service Routes
@app.route('/api/services', methods=['GET'])
@jwt_required()
def get_services():
    try:
        services = Service.query.all()
        return jsonify([service.to_dict() for service in services])
    except Exception as e:
        return jsonify({'message': f'Error fetching services: {str(e)}'}), 500

@app.route('/api/services', methods=['POST'])
@jwt_required()
def create_service():
    try:
        data = request.get_json()
        
        required_fields = ['name', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        service = Service(
            name=data['name'],
            description=data.get('description'),
            price=data['price'],
            duration_hours=data.get('duration_hours', 1),
            service_type=data.get('service_type')
        )
        
        db.session.add(service)
        db.session.flush()
        
        # Add parts if provided
        if 'parts' in data:
            for part_data in data['parts']:
                service_part = ServicePart(
                    service_id=service.id,
                    part_id=part_data['part_id'],
                    quantity_required=part_data.get('quantity_required', 1)
                )
                db.session.add(service_part)
        
        db.session.commit()
        return jsonify({'message': 'Service created successfully', 'service': service.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating service: {str(e)}'}), 500

# Parts Routes
@app.route('/api/parts', methods=['GET'])
@jwt_required()
def get_parts():
    try:
        parts = Part.query.all()
        return jsonify([part.to_dict() for part in parts])
    except Exception as e:
        return jsonify({'message': f'Error fetching parts: {str(e)}'}), 500

@app.route('/api/parts', methods=['POST'])
@jwt_required()
def create_part():
    try:
        data = request.get_json()
        
        required_fields = ['name', 'part_number', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        part = Part(
            name=data['name'],
            part_number=data['part_number'],
            description=data.get('description'),
            price=data['price'],
            stock_quantity=data.get('stock_quantity', 0),
            supplier=data.get('supplier')
        )
        
        db.session.add(part)
        db.session.commit()
        
        return jsonify({'message': 'Part created successfully', 'part': part.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating part: {str(e)}'}), 500

# Appointment Routes
@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.is_admin:
            appointments = Appointment.query.all()
        else:
            appointments = Appointment.query.filter_by(user_id=user_id).all()
        
        return jsonify([appointment.to_dict() for appointment in appointments])
    except Exception as e:
        return jsonify({'message': f'Error fetching appointments: {str(e)}'}), 500

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['vehicle_id', 'service_id', 'appointment_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        appointment = Appointment(
            user_id=user_id,
            vehicle_id=data['vehicle_id'],
            service_id=data['service_id'],
            appointment_date=datetime.fromisoformat(data['appointment_date'].replace('Z', '+00:00')),
            notes=data.get('notes')
        )
        
        db.session.add(appointment)
        db.session.commit()
        
        return jsonify({'message': 'Appointment created successfully', 'appointment': appointment.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating appointment: {str(e)}'}), 500

# Incident Report Routes
@app.route('/api/incident-reports', methods=['GET'])
@jwt_required()
def get_incident_reports():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if user.is_admin:
            reports = IncidentReport.query.all()
        else:
            reports = IncidentReport.query.filter_by(user_id=user_id).all()
        
        return jsonify([report.to_dict() for report in reports])
    except Exception as e:
        return jsonify({'message': f'Error fetching incident reports: {str(e)}'}), 500

@app.route('/api/incident-reports', methods=['POST'])
@jwt_required()
def create_incident_report():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        required_fields = ['title', 'description', 'incident_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        report = IncidentReport(
            user_id=user_id,
            vehicle_id=data.get('vehicle_id'),
            title=data['title'],
            description=data['description'],
            incident_type=data['incident_type'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            location_description=data.get('location_description')
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({'message': 'Incident report created successfully', 'report': report.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error creating incident report: {str(e)}'}), 500

@app.route('/api/incident-reports/<int:report_id>', methods=['PUT'])
@jwt_required()
def update_incident_report(report_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        report = IncidentReport.query.get_or_404(report_id)
        
        if not user.is_admin and report.user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = ['title', 'description', 'incident_type', 'latitude', 'longitude', 'location_description']
        for field in updatable_fields:
            if field in data:
                setattr(report, field, data[field])
        
        # Admin can update status
        if user.is_admin and 'status' in data:
            old_status = report.status
            report.status = data['status']
            
            # Send notifications on status change
            if old_status != data['status']:
                user_email = report.user.email
                user_phone = report.user.phone
                
                email_subject = f"Incident Report Status Update - {report.title}"
                email_body = f"Your incident report '{report.title}' status has been changed to: {data['status']}"
                sms_message = f"CMIS: Your incident report '{report.title}' status changed to: {data['status']}"
                
                send_email_notification(user_email, email_subject, email_body)
                if user_phone:
                    send_sms_notification(user_phone, sms_message)
        
        report.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Incident report updated successfully', 'report': report.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error updating incident report: {str(e)}'}), 500

@app.route('/api/incident-reports/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_incident_report(report_id):
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        report = IncidentReport.query.get_or_404(report_id)
        
        if not user.is_admin and report.user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        db.session.delete(report)
        db.session.commit()
        
        return jsonify({'message': 'Incident report deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error deleting incident report: {str(e)}'}), 500

# File Upload Routes
@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'message': 'No file part'}), 400
        
        file = request.files['file']
        report_id = request.form.get('report_id')
        
        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)
            
            # Update incident report with file
            if report_id:
                report = IncidentReport.query.get(report_id)
                if report:
                    file_ext = filename.rsplit('.', 1)[1].lower()
                    if file_ext in ['mp4', 'avi', 'mov', 'webm']:
                        videos = report.videos or []
                        videos.append(unique_filename)
                        report.videos = videos
                    else:
                        images = report.images or []
                        images.append(unique_filename)
                        report.images = images
                    
                    db.session.commit()
            
            return jsonify({'message': 'File uploaded successfully', 'filename': unique_filename})
        
        return jsonify({'message': 'Invalid file type'}), 400
    except Exception as e:
        return jsonify({'message': f'Error uploading file: {str(e)}'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# Initialize database and create sample data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create default admin user if it doesn't exist
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@cmis.com',
                password_hash=generate_password_hash('admin123'),
                phone='+1234567890',
                is_admin=True
            )
            db.session.add(admin)
            
            # Create sample regular user
            user = User(
                username='user1',
                email='user1@cmis.com',
                password_hash=generate_password_hash('user123'),
                phone='+1234567891',
                is_admin=False
            )
            db.session.add(user)
            
            # Create sample vehicles
            vehicle1 = Vehicle(
                make='Toyota',
                model='Camry',
                year=2022,
                vin='1HGBH41JXMN109186',
                license_plate='ABC123',
                color='Silver',
                mileage=15000,
                status='available',
                location='Lot A'
            )
            
            vehicle2 = Vehicle(
                make='Honda',
                model='Civic',
                year=2021,
                vin='2HGFC2F59NH123456',
                license_plate='XYZ789',
                color='Blue',
                mileage=25000,
                status='in_service',
                location='Service Bay 1'
            )
            
            db.session.add(vehicle1)
            db.session.add(vehicle2)
            
            # Create sample parts
            brake_pads = Part(
                name='Brake Pads',
                part_number='BP-001',
                description='High-quality ceramic brake pads',
                price=89.99,
                stock_quantity=50,
                supplier='AutoParts Inc'
            )
            
            oil_filter = Part(
                name='Oil Filter',
                part_number='OF-001',
                description='Engine oil filter for regular maintenance',
                price=19.99,
                stock_quantity=100,
                supplier='FilterCorp'
            )
            
            brake_fluid = Part(
                name='Brake Fluid',
                part_number='BF-001',
                description='DOT 3 brake fluid',
                price=12.99,
                stock_quantity=75,
                supplier='FluidTech'
            )
            
            db.session.add(brake_pads)
            db.session.add(oil_filter)
            db.session.add(brake_fluid)
            db.session.flush()
            
            # Create sample services
            brake_service = Service(
                name='Brake Repair',
                description='Complete brake system inspection and repair including pads, rotors, and fluid',
                price=299.99,
                duration_hours=2,
                service_type='brake_repair'
            )
            
            km_service = Service(
                name='3000km Service',
                description='Regular maintenance service every 3000km including oil change and inspection',
                price=149.99,
                duration_hours=1,
                service_type='3000km_service'
            )
            
            db.session.add(brake_service)
            db.session.add(km_service)
            db.session.flush()
            
            # Link parts to services
            brake_service_part1 = ServicePart(
                service_id=brake_service.id,
                part_id=brake_pads.id,
                quantity_required=1
            )
            
            brake_service_part2 = ServicePart(
                service_id=brake_service.id,
                part_id=brake_fluid.id,
                quantity_required=1
            )
            
            km_service_part = ServicePart(
                service_id=km_service.id,
                part_id=oil_filter.id,
                quantity_required=1
            )
            
            db.session.add(brake_service_part1)
            db.session.add(brake_service_part2)
            db.session.add(km_service_part)
            
            db.session.commit()
            print("Database initialized with sample data")

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)