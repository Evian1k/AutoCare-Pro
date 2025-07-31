from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))  # maintenance, repair, inspection
    duration_hours = db.Column(db.Float)  # estimated duration in hours
    price = db.Column(db.Numeric(10, 2))
    is_active = db.Column(db.Boolean, default=True)
    service_interval_km = db.Column(db.Integer)  # for regular services like 3000km service
    requires_appointment = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parts = db.relationship('ServicePart', backref='service', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='service', lazy=True)
    
    def to_dict(self):
        """Convert service object to dictionary."""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'duration_hours': float(self.duration_hours) if self.duration_hours else None,
            'price': float(self.price) if self.price else None,
            'is_active': self.is_active,
            'service_interval_km': self.service_interval_km,
            'requires_appointment': self.requires_appointment,
            'parts': [part.to_dict() for part in self.parts],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Service {self.name}>'

class ServicePart(db.Model):
    __tablename__ = 'service_parts'
    
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    part_name = db.Column(db.String(100), nullable=False)
    part_number = db.Column(db.String(50))
    quantity = db.Column(db.Integer, default=1)
    unit_price = db.Column(db.Numeric(10, 2))
    supplier = db.Column(db.String(100))
    is_required = db.Column(db.Boolean, default=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert service part object to dictionary."""
        return {
            'id': self.id,
            'service_id': self.service_id,
            'part_name': self.part_name,
            'part_number': self.part_number,
            'quantity': self.quantity,
            'unit_price': float(self.unit_price) if self.unit_price else None,
            'supplier': self.supplier,
            'is_required': self.is_required,
            'description': self.description,
            'total_price': float(self.unit_price * self.quantity) if self.unit_price else None,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self):
        return f'<ServicePart {self.part_name}>'