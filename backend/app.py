from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flask_migrate import Migrate
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/cmis_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Mail configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# File upload configuration
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
mail = Mail(app)
migrate = Migrate(app, db)
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

# Import models (this will create the tables)
from models import *

# Import routes
from routes.auth import auth_bp
from routes.users import users_bp
from routes.vehicles import vehicles_bp
from routes.services import services_bp
from routes.appointments import appointments_bp
from routes.incidents import incidents_bp
from routes.admin import admin_bp
from routes.notifications import notifications_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(vehicles_bp, url_prefix='/api/vehicles')
app.register_blueprint(services_bp, url_prefix='/api/services')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
app.register_blueprint(incidents_bp, url_prefix='/api/incidents')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

@app.route('/')
def index():
    return jsonify({
        'message': 'CMIS - Car Management Information System API',
        'version': '1.0.0',
        'status': 'active'
    })

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'CMIS API'})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        # Create admin user if it doesn't exist
        from models.user import User
        admin_email = os.getenv('ADMIN_EMAIL', 'admin@cmis.com')
        admin = User.query.filter_by(email=admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                username='admin',
                first_name='System',
                last_name='Administrator',
                role='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print(f"Admin user created: {admin_email}")
    
    app.run(debug=True, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))