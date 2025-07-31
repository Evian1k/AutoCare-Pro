from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='scheduled')  # scheduled, confirmed, in_progress, completed, cancelled
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    estimated_completion = db.Column(db.DateTime)
    actual_completion = db.Column(db.DateTime)
    current_mileage = db.Column(db.Integer)
    notes = db.Column(db.Text)
    admin_notes = db.Column(db.Text)
    cost = db.Column(db.Numeric(10, 2))
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, refunded
    reminder_sent = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def is_overdue(self):
        """Check if the appointment is overdue."""
        if self.status in ['completed', 'cancelled']:
            return False
        return self.appointment_date < datetime.utcnow()
    
    def is_upcoming(self, hours=24):
        """Check if the appointment is upcoming within specified hours."""
        if self.status in ['completed', 'cancelled']:
            return False
        time_diff = self.appointment_date - datetime.utcnow()
        return 0 <= time_diff.total_seconds() <= (hours * 3600)
    
    def to_dict(self):
        """Convert appointment object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'vehicle_id': self.vehicle_id,
            'service_id': self.service_id,
            'appointment_date': self.appointment_date.isoformat(),
            'status': self.status,
            'priority': self.priority,
            'estimated_completion': self.estimated_completion.isoformat() if self.estimated_completion else None,
            'actual_completion': self.actual_completion.isoformat() if self.actual_completion else None,
            'current_mileage': self.current_mileage,
            'notes': self.notes,
            'admin_notes': self.admin_notes,
            'cost': float(self.cost) if self.cost else None,
            'payment_status': self.payment_status,
            'reminder_sent': self.reminder_sent,
            'is_overdue': self.is_overdue(),
            'is_upcoming': self.is_upcoming(),
            'user': self.user.to_dict() if self.user else None,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None,
            'service': self.service.to_dict() if self.service else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Appointment {self.id} - {self.status}>'