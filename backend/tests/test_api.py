#!/usr/bin/env python3
"""
Basic API tests for the CMIS Flask backend.
Run with: python -m pytest tests/
"""

import pytest
import json
from app import app, db
from models.user import User
from models.service import Service

@pytest.fixture
def client():
    """Create test client."""
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

@pytest.fixture
def sample_user(client):
    """Create a sample user."""
    user = User(
        username='testuser',
        email='test@example.com',
        first_name='Test',
        last_name='User',
        role='user'
    )
    user.set_password('password123')
    
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def admin_user(client):
    """Create an admin user."""
    admin = User(
        username='admin',
        email='admin@test.com',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    admin.set_password('admin123')
    
    db.session.add(admin)
    db.session.commit()
    return admin

def test_health_check(client):
    """Test health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json['status'] == 'healthy'

def test_user_registration(client):
    """Test user registration."""
    data = {
        'username': 'newuser',
        'email': 'newuser@test.com',
        'password': 'password123',
        'first_name': 'New',
        'last_name': 'User'
    }
    
    response = client.post('/api/auth/register', 
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 201
    assert 'access_token' in response.json
    assert 'user' in response.json

def test_user_login(client, sample_user):
    """Test user login."""
    data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    
    response = client.post('/api/auth/login',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 200
    assert 'access_token' in response.json
    assert 'user' in response.json

def test_login_invalid_credentials(client, sample_user):
    """Test login with invalid credentials."""
    data = {
        'email': 'test@example.com',
        'password': 'wrongpassword'
    }
    
    response = client.post('/api/auth/login',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 401

def get_auth_headers(client, user_email, password):
    """Helper function to get authentication headers."""
    data = {
        'email': user_email,
        'password': password
    }
    
    response = client.post('/api/auth/login',
                          data=json.dumps(data),
                          content_type='application/json')
    
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}

def test_get_services(client):
    """Test getting services (public endpoint)."""
    # Create a sample service
    service = Service(
        name='Test Service',
        description='Test service description',
        category='maintenance',
        price=100.00,
        is_active=True
    )
    db.session.add(service)
    db.session.commit()
    
    response = client.get('/api/services')
    
    assert response.status_code == 200
    assert 'services' in response.json
    assert len(response.json['services']) == 1

def test_create_vehicle_authenticated(client, sample_user):
    """Test creating a vehicle with authentication."""
    headers = get_auth_headers(client, 'test@example.com', 'password123')
    
    data = {
        'make': 'Toyota',
        'model': 'Camry',
        'year': 2020,
        'license_plate': 'TEST123',
        'color': 'Blue',
        'mileage': 15000
    }
    
    response = client.post('/api/vehicles',
                          data=json.dumps(data),
                          content_type='application/json',
                          headers=headers)
    
    assert response.status_code == 201
    assert 'vehicle' in response.json
    assert response.json['vehicle']['make'] == 'Toyota'

def test_create_vehicle_unauthenticated(client):
    """Test creating a vehicle without authentication."""
    data = {
        'make': 'Toyota',
        'model': 'Camry',
        'year': 2020
    }
    
    response = client.post('/api/vehicles',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 401

def test_admin_dashboard(client, admin_user):
    """Test admin dashboard access."""
    headers = get_auth_headers(client, 'admin@test.com', 'admin123')
    
    response = client.get('/api/admin/dashboard', headers=headers)
    
    assert response.status_code == 200
    assert 'statistics' in response.json

def test_admin_dashboard_regular_user(client, sample_user):
    """Test admin dashboard access with regular user."""
    headers = get_auth_headers(client, 'test@example.com', 'password123')
    
    response = client.get('/api/admin/dashboard', headers=headers)
    
    assert response.status_code == 403

def test_create_incident_report(client, sample_user):
    """Test creating an incident report."""
    headers = get_auth_headers(client, 'test@example.com', 'password123')
    
    data = {
        'title': 'Test Incident',
        'description': 'This is a test incident report',
        'incident_type': 'red-flag',
        'severity': 'medium',
        'incident_date': '2024-01-15T10:00:00',
        'latitude': 40.7128,
        'longitude': -74.0060
    }
    
    response = client.post('/api/incidents',
                          data=json.dumps(data),
                          content_type='application/json',
                          headers=headers)
    
    assert response.status_code == 201
    assert 'incident' in response.json
    assert response.json['incident']['title'] == 'Test Incident'

if __name__ == '__main__':
    pytest.main([__file__])