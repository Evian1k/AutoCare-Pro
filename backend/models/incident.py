from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db

class Incident(db.Model):
    __tablename__ = 'incidents'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'))
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    incident_type = db.Column(db.String(50), nullable=False)  # red-flag, intervention, accident, breakdown
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    status = db.Column(db.String(20), default='pending')  # pending, under_investigation, resolved, rejected
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    address = db.Column(db.String(500))
    incident_date = db.Column(db.DateTime, nullable=False)
    reported_date = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_date = db.Column(db.DateTime)
    admin_notes = db.Column(db.Text)
    resolution_details = db.Column(db.Text)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    media = db.relationship('IncidentMedia', backref='incident', lazy=True, cascade='all, delete-orphan')
    
    def has_location(self):
        """Check if the incident has geolocation data."""
        return self.latitude is not None and self.longitude is not None
    
    def is_resolved(self):
        """Check if the incident has been resolved."""
        return self.status == 'resolved'
    
    def is_overdue(self, days=7):
        """Check if the incident is overdue for resolution."""
        if self.status in ['resolved', 'rejected']:
            return False
        time_diff = datetime.utcnow() - self.reported_date
        return time_diff.days > days
    
    def to_dict(self):
        """Convert incident object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'vehicle_id': self.vehicle_id,
            'title': self.title,
            'description': self.description,
            'incident_type': self.incident_type,
            'severity': self.severity,
            'status': self.status,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'address': self.address,
            'incident_date': self.incident_date.isoformat(),
            'reported_date': self.reported_date.isoformat(),
            'resolved_date': self.resolved_date.isoformat() if self.resolved_date else None,
            'admin_notes': self.admin_notes,
            'resolution_details': self.resolution_details,
            'is_public': self.is_public,
            'has_location': self.has_location(),
            'is_resolved': self.is_resolved(),
            'is_overdue': self.is_overdue(),
            'media': [media.to_dict() for media in self.media],
            'user': self.user.to_dict() if self.user else None,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Incident {self.title} - {self.status}>'

class IncidentMedia(db.Model):
    __tablename__ = 'incident_media'
    
    id = db.Column(db.Integer, primary_key=True)
    incident_id = db.Column(db.Integer, db.ForeignKey('incidents.id'), nullable=False)
    file_type = db.Column(db.String(20), nullable=False)  # image, video
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)  # in bytes
    mime_type = db.Column(db.String(100))
    caption = db.Column(db.String(500))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        """Convert incident media object to dictionary."""
        return {
            'id': self.id,
            'incident_id': self.incident_id,
            'file_type': self.file_type,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'caption': self.caption,
            'uploaded_at': self.uploaded_at.isoformat()
        }
    
    def __repr__(self):
        return f'<IncidentMedia {self.file_name}>'