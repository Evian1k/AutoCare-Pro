from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message
from twilio.rest import Client
import os
from datetime import datetime
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import db, mail
from models.user import User
from models.notification import Notification

notifications_bp = Blueprint('notifications', __name__)

def send_email_notification(notification):
    """Send email notification."""
    try:
        user = notification.user
        if not user or not user.email:
            return False
        
        msg = Message(
            subject=notification.title,
            recipients=[user.email],
            body=notification.message,
            html=f"""
            <html>
                <body>
                    <h2>{notification.title}</h2>
                    <p>{notification.message}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from CMIS - Car Management Information System.
                    </p>
                </body>
            </html>
            """
        )
        
        mail.send(msg)
        notification.mark_as_delivered()
        return True
        
    except Exception as e:
        notification.mark_as_failed(str(e))
        return False

def send_sms_notification(notification):
    """Send SMS notification."""
    try:
        user = notification.user
        if not user or not user.phone:
            return False
        
        # Check if Twilio credentials are configured
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        from_number = os.getenv('TWILIO_FROM_NUMBER')
        
        if not all([account_sid, auth_token, from_number]):
            notification.mark_as_failed('Twilio credentials not configured')
            return False
        
        client = Client(account_sid, auth_token)
        
        # Send SMS
        message = client.messages.create(
            body=f"{notification.title}\n\n{notification.message}",
            from_=from_number,
            to=user.phone
        )
        
        notification.mark_as_delivered()
        notification.metadata = notification.metadata or {}
        notification.metadata['twilio_sid'] = message.sid
        
        return True
        
    except Exception as e:
        notification.mark_as_failed(str(e))
        return False

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    """Get user's notifications."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        category = request.args.get('category')
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        query = Notification.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        if category:
            query = query.filter_by(category=category)
        if unread_only:
            query = query.filter(Notification.read_at.is_(None))
        
        notifications = query.order_by(Notification.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'notifications': [notification.to_dict() for notification in notifications.items],
            'pagination': {
                'page': page,
                'pages': notifications.pages,
                'per_page': per_page,
                'total': notifications.total,
                'has_next': notifications.has_next,
                'has_prev': notifications.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get notifications', 'details': str(e)}), 500

@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id):
    """Mark a notification as read."""
    try:
        user_id = get_jwt_identity()
        notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
        
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
        
        notification.mark_as_read()
        db.session.commit()
        
        return jsonify({
            'message': 'Notification marked as read',
            'notification': notification.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to mark notification as read', 'details': str(e)}), 500

@notifications_bp.route('/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    """Mark all user notifications as read."""
    try:
        user_id = get_jwt_identity()
        
        notifications = Notification.query.filter_by(user_id=user_id).filter(
            Notification.read_at.is_(None)
        ).all()
        
        for notification in notifications:
            notification.mark_as_read()
        
        db.session.commit()
        
        return jsonify({
            'message': f'Marked {len(notifications)} notifications as read'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to mark notifications as read', 'details': str(e)}), 500

@notifications_bp.route('/send', methods=['POST'])
@jwt_required()
def send_notification():
    """Send a notification (admin only for manual notifications)."""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or not current_user.is_admin():
            return jsonify({'error': 'Admin privileges required'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'title', 'message', 'notification_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if target user exists
        target_user = User.query.get(data['user_id'])
        if not target_user:
            return jsonify({'error': 'Target user not found'}), 404
        
        # Create notification
        notification = Notification(
            user_id=data['user_id'],
            title=data['title'],
            message=data['message'],
            notification_type=data['notification_type'],
            category=data.get('category', 'system'),
            priority=data.get('priority', 'normal')
        )
        
        db.session.add(notification)
        db.session.commit()
        
        # Send notification based on type
        success = False
        if notification.notification_type == 'email':
            success = send_email_notification(notification)
        elif notification.notification_type == 'sms':
            success = send_sms_notification(notification)
        
        if success:
            db.session.commit()
            return jsonify({
                'message': 'Notification sent successfully',
                'notification': notification.to_dict()
            }), 200
        else:
            return jsonify({
                'message': 'Notification created but delivery failed',
                'notification': notification.to_dict()
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send notification', 'details': str(e)}), 500

@notifications_bp.route('/retry-failed', methods=['POST'])
@jwt_required()
def retry_failed_notifications():
    """Retry failed notifications (admin only)."""
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or not current_user.is_admin():
            return jsonify({'error': 'Admin privileges required'}), 403
        
        # Get failed notifications that can be retried
        failed_notifications = Notification.query.filter_by(status='failed').filter(
            Notification.next_retry_at <= datetime.utcnow()
        ).all()
        
        retried_count = 0
        success_count = 0
        
        for notification in failed_notifications:
            if notification.can_retry():
                retried_count += 1
                
                if notification.notification_type == 'email':
                    success = send_email_notification(notification)
                elif notification.notification_type == 'sms':
                    success = send_sms_notification(notification)
                else:
                    success = False
                
                if success:
                    success_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'Retried {retried_count} notifications, {success_count} successful',
            'retried': retried_count,
            'successful': success_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to retry notifications', 'details': str(e)}), 500

@notifications_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_notification_preferences():
    """Get user's notification preferences."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # For now, return basic preferences (can be extended with a preferences table)
        preferences = {
            'email_enabled': bool(user.email),
            'sms_enabled': bool(user.phone),
            'categories': {
                'appointment': True,
                'incident': True,
                'service': True,
                'reminder': True,
                'alert': True
            },
            'delivery_methods': {
                'email': bool(user.email),
                'sms': bool(user.phone and os.getenv('TWILIO_ACCOUNT_SID'))
            }
        }
        
        return jsonify({'preferences': preferences}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to get notification preferences', 'details': str(e)}), 500

@notifications_bp.route('/test', methods=['POST'])
@jwt_required()
def send_test_notification():
    """Send a test notification to the current user."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        notification_type = data.get('type', 'email')
        
        if notification_type not in ['email', 'sms']:
            return jsonify({'error': 'Invalid notification type'}), 400
        
        if notification_type == 'email' and not user.email:
            return jsonify({'error': 'No email address configured'}), 400
        
        if notification_type == 'sms' and not user.phone:
            return jsonify({'error': 'No phone number configured'}), 400
        
        # Create test notification
        notification = Notification(
            user_id=user_id,
            title='Test Notification',
            message='This is a test notification from CMIS. If you received this, your notifications are working correctly!',
            notification_type=notification_type,
            category='system',
            priority='normal'
        )
        
        db.session.add(notification)
        db.session.commit()
        
        # Send notification
        success = False
        if notification_type == 'email':
            success = send_email_notification(notification)
        elif notification_type == 'sms':
            success = send_sms_notification(notification)
        
        db.session.commit()
        
        if success:
            return jsonify({
                'message': 'Test notification sent successfully',
                'notification': notification.to_dict()
            }), 200
        else:
            return jsonify({
                'message': 'Test notification failed to send',
                'notification': notification.to_dict()
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to send test notification', 'details': str(e)}), 500