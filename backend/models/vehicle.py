from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    make = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    vin = db.Column(db.String(17), unique=True)
    license_plate = db.Column(db.String(20), unique=True)
    color = db.Column(db.String(30))
    mileage = db.Column(db.Integer, default=0)
    fuel_type = db.Column(db.String(20))  # gasoline, diesel, electric, hybrid
    transmission = db.Column(db.String(20))  # manual, automatic, cvt
    engine_size = db.Column(db.String(20))
    purchase_date = db.Column(db.Date)
    last_service_date = db.Column(db.Date)
    next_service_due = db.Column(db.Date)
    insurance_expiry = db.Column(db.Date)
    registration_expiry = db.Column(db.Date)
    status = db.Column(db.String(20), default='active')  # active, inactive, in_service, sold
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='vehicle', lazy=True)
    incidents = db.relationship('Incident', backref='vehicle', lazy=True)
    
    def is_service_due(self):
        """Check if the vehicle is due for service."""
        if self.next_service_due:
            return self.next_service_due <= datetime.now().date()
        return False
    
    def calculate_next_service_mileage(self, service_interval=3000):
        """Calculate when the next service is due based on mileage."""
        return self.mileage + service_interval
    
    def to_dict(self):
        """Convert vehicle object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'make': self.make,
            'model': self.model,
            'year': self.year,
            'vin': self.vin,
            'license_plate': self.license_plate,
            'color': self.color,
            'mileage': self.mileage,
            'fuel_type': self.fuel_type,
            'transmission': self.transmission,
            'engine_size': self.engine_size,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'last_service_date': self.last_service_date.isoformat() if self.last_service_date else None,
            'next_service_due': self.next_service_due.isoformat() if self.next_service_due else None,
            'insurance_expiry': self.insurance_expiry.isoformat() if self.insurance_expiry else None,
            'registration_expiry': self.registration_expiry.isoformat() if self.registration_expiry else None,
            'status': self.status,
            'notes': self.notes,
            'is_service_due': self.is_service_due(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Vehicle {self.year} {self.make} {self.model}>'