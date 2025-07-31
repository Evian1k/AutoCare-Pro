#!/usr/bin/env python3
"""
Seed script to populate the database with initial data.
Run this after setting up the database to add sample services and data.
"""

from app import app, db
from models.user import User
from models.service import Service, ServicePart
from models.vehicle import Vehicle
from models.appointment import Appointment
from models.incident import Incident
from datetime import datetime, date, timedelta
import os

def create_services():
    """Create sample services with parts."""
    services_data = [
        {
            'name': 'Brake Repair',
            'description': 'Complete brake system inspection and repair including pads, rotors, and fluid',
            'category': 'repair',
            'duration_hours': 2.5,
            'price': 250.00,
            'requires_appointment': True,
            'parts': [
                {'part_name': 'Brake Pads', 'part_number': 'BP-001', 'quantity': 4, 'unit_price': 45.00, 'is_required': True},
                {'part_name': 'Brake Rotors', 'part_number': 'BR-002', 'quantity': 2, 'unit_price': 80.00, 'is_required': False},
                {'part_name': 'Brake Fluid', 'part_number': 'BF-003', 'quantity': 1, 'unit_price': 15.00, 'is_required': True}
            ]
        },
        {
            'name': '3000km Service',
            'description': 'Regular maintenance service including oil change, filter replacement, and basic inspection',
            'category': 'maintenance',
            'duration_hours': 1.5,
            'price': 120.00,
            'service_interval_km': 3000,
            'requires_appointment': True,
            'parts': [
                {'part_name': 'Engine Oil', 'part_number': 'EO-001', 'quantity': 5, 'unit_price': 8.00, 'is_required': True},
                {'part_name': 'Oil Filter', 'part_number': 'OF-002', 'quantity': 1, 'unit_price': 12.00, 'is_required': True},
                {'part_name': 'Air Filter', 'part_number': 'AF-003', 'quantity': 1, 'unit_price': 15.00, 'is_required': False}
            ]
        },
        {
            'name': 'Tire Rotation',
            'description': 'Rotate tires to ensure even wear and extend tire life',
            'category': 'maintenance',
            'duration_hours': 0.5,
            'price': 50.00,
            'requires_appointment': False
        },
        {
            'name': 'Engine Diagnostics',
            'description': 'Comprehensive engine diagnostic scan to identify issues',
            'category': 'inspection',
            'duration_hours': 1.0,
            'price': 80.00,
            'requires_appointment': True
        },
        {
            'name': 'Transmission Service',
            'description': 'Transmission fluid change and filter replacement',
            'category': 'maintenance',
            'duration_hours': 2.0,
            'price': 180.00,
            'requires_appointment': True,
            'parts': [
                {'part_name': 'Transmission Fluid', 'part_number': 'TF-001', 'quantity': 6, 'unit_price': 12.00, 'is_required': True},
                {'part_name': 'Transmission Filter', 'part_number': 'TFL-002', 'quantity': 1, 'unit_price': 25.00, 'is_required': True}
            ]
        },
        {
            'name': 'Battery Replacement',
            'description': 'Replace vehicle battery and test charging system',
            'category': 'repair',
            'duration_hours': 0.5,
            'price': 150.00,
            'requires_appointment': False,
            'parts': [
                {'part_name': 'Car Battery', 'part_number': 'BAT-001', 'quantity': 1, 'unit_price': 120.00, 'is_required': True}
            ]
        }
    ]
    
    for service_data in services_data:
        # Check if service already exists
        existing_service = Service.query.filter_by(name=service_data['name']).first()
        if existing_service:
            print(f"Service '{service_data['name']}' already exists, skipping...")
            continue
        
        parts_data = service_data.pop('parts', [])
        service = Service(**service_data)
        db.session.add(service)
        db.session.flush()  # Get the service ID
        
        # Add parts
        for part_data in parts_data:
            part = ServicePart(service_id=service.id, **part_data)
            db.session.add(part)
        
        print(f"Created service: {service.name}")
    
    db.session.commit()

def create_sample_user():
    """Create a sample user for testing."""
    sample_email = 'user@example.com'
    existing_user = User.query.filter_by(email=sample_email).first()
    
    if existing_user:
        print(f"Sample user '{sample_email}' already exists, skipping...")
        return existing_user
    
    user = User(
        username='sampleuser',
        email=sample_email,
        first_name='John',
        last_name='Doe',
        phone='+1234567890',
        role='user'
    )
    user.set_password('password123')
    
    db.session.add(user)
    db.session.commit()
    
    print(f"Created sample user: {user.email}")
    return user

def create_sample_vehicle(user):
    """Create a sample vehicle for the user."""
    existing_vehicle = Vehicle.query.filter_by(user_id=user.id).first()
    
    if existing_vehicle:
        print(f"Sample vehicle for user {user.email} already exists, skipping...")
        return existing_vehicle
    
    vehicle = Vehicle(
        user_id=user.id,
        make='Toyota',
        model='Camry',
        year=2020,
        vin='1HGBH41JXMN109186',
        license_plate='ABC123',
        color='Silver',
        mileage=15000,
        fuel_type='gasoline',
        transmission='automatic',
        engine_size='2.5L',
        purchase_date=date(2020, 3, 15),
        next_service_due=date.today() + timedelta(days=30),
        insurance_expiry=date.today() + timedelta(days=365),
        registration_expiry=date.today() + timedelta(days=365)
    )
    
    db.session.add(vehicle)
    db.session.commit()
    
    print(f"Created sample vehicle: {vehicle.year} {vehicle.make} {vehicle.model}")
    return vehicle

def create_sample_appointment(user, vehicle):
    """Create a sample appointment."""
    service = Service.query.filter_by(name='3000km Service').first()
    if not service:
        print("3000km Service not found, cannot create sample appointment")
        return
    
    existing_appointment = Appointment.query.filter_by(user_id=user.id, vehicle_id=vehicle.id).first()
    if existing_appointment:
        print("Sample appointment already exists, skipping...")
        return
    
    appointment = Appointment(
        user_id=user.id,
        vehicle_id=vehicle.id,
        service_id=service.id,
        appointment_date=datetime.now() + timedelta(days=7, hours=10),
        current_mileage=15000,
        notes='Regular maintenance service',
        cost=service.price
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    print(f"Created sample appointment for {service.name}")

def create_sample_incident(user, vehicle):
    """Create a sample incident."""
    existing_incident = Incident.query.filter_by(user_id=user.id).first()
    if existing_incident:
        print("Sample incident already exists, skipping...")
        return
    
    incident = Incident(
        user_id=user.id,
        vehicle_id=vehicle.id,
        title='Engine Warning Light',
        description='Check engine light came on while driving. Engine seems to be running normally but the light is persistent.',
        incident_type='red-flag',
        severity='medium',
        latitude=40.7128,  # New York City coordinates
        longitude=-74.0060,
        address='123 Main St, New York, NY 10001',
        incident_date=datetime.now() - timedelta(hours=2)
    )
    
    db.session.add(incident)
    db.session.commit()
    
    print(f"Created sample incident: {incident.title}")

def main():
    """Main function to seed the database."""
    print("Starting database seeding...")
    
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Create services
        print("\n1. Creating services...")
        create_services()
        
        # Create sample user
        print("\n2. Creating sample user...")
        user = create_sample_user()
        
        # Create sample vehicle
        print("\n3. Creating sample vehicle...")
        vehicle = create_sample_vehicle(user)
        
        # Create sample appointment
        print("\n4. Creating sample appointment...")
        create_sample_appointment(user, vehicle)
        
        # Create sample incident
        print("\n5. Creating sample incident...")
        create_sample_incident(user, vehicle)
        
        print("\n✅ Database seeding completed successfully!")
        print("\nSample credentials:")
        print(f"Email: {user.email}")
        print("Password: password123")
        print(f"Admin email: {os.getenv('ADMIN_EMAIL', 'admin@cmis.com')}")
        print("Admin password: admin123")

if __name__ == '__main__':
    main()