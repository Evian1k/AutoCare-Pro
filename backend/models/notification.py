from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # email, sms, push, system
    category = db.Column(db.String(50))  # appointment, incident, service, reminder, alert
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, sent, delivered, failed, read
    
    # Reference to related objects
    reference_type = db.Column(db.String(50))  # appointment, incident, vehicle, service
    reference_id = db.Column(db.Integer)
    
    # Delivery tracking
    sent_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    read_at = db.Column(db.DateTime)
    failed_at = db.Column(db.DateTime)
    failure_reason = db.Column(db.String(500))
    
    # Retry mechanism
    retry_count = db.Column(db.Integer, default=0)
    max_retries = db.Column(db.Integer, default=3)
    next_retry_at = db.Column(db.DateTime)
    
    # Metadata
    metadata = db.Column(db.JSON)  # Additional data like email subject, SMS gateway used, etc.
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def is_delivered(self):
        """Check if the notification has been delivered."""
        return self.status == 'delivered'
    
    def is_failed(self):
        """Check if the notification has failed."""
        return self.status == 'failed'
    
    def can_retry(self):
        """Check if the notification can be retried."""
        return self.retry_count < self.max_retries and self.status == 'failed'
    
    def mark_as_sent(self):
        """Mark the notification as sent."""
        self.status = 'sent'
        self.sent_at = datetime.utcnow()
    
    def mark_as_delivered(self):
        """Mark the notification as delivered."""
        self.status = 'delivered'
        self.delivered_at = datetime.utcnow()
    
    def mark_as_failed(self, reason=None):
        """Mark the notification as failed."""
        self.status = 'failed'
        self.failed_at = datetime.utcnow()
        self.failure_reason = reason
        self.retry_count += 1
        
        # Schedule next retry if possible
        if self.can_retry():
            from datetime import timedelta
            retry_delay = timedelta(minutes=5 * (2 ** self.retry_count))  # Exponential backoff
            self.next_retry_at = datetime.utcnow() + retry_delay
    
    def mark_as_read(self):
        """Mark the notification as read."""
        if self.status == 'delivered':
            self.read_at = datetime.utcnow()
    
    def to_dict(self):
        """Convert notification object to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'category': self.category,
            'priority': self.priority,
            'status': self.status,
            'reference_type': self.reference_type,
            'reference_id': self.reference_id,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'failed_at': self.failed_at.isoformat() if self.failed_at else None,
            'failure_reason': self.failure_reason,
            'retry_count': self.retry_count,
            'max_retries': self.max_retries,
            'next_retry_at': self.next_retry_at.isoformat() if self.next_retry_at else None,
            'metadata': self.metadata,
            'is_delivered': self.is_delivered(),
            'is_failed': self.is_failed(),
            'can_retry': self.can_retry(),
            'user': self.user.to_dict() if self.user else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def __repr__(self):
        return f'<Notification {self.title} - {self.status}>'