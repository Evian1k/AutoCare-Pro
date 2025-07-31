#!/usr/bin/env python3
"""
CMIS - Car Management Information System
Simplified Flask Backend for Testing
"""

import json
import os
import hashlib
import sqlite3
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

# Simple in-memory database
DATABASE = {
    'users': [
        {
            'id': 1,
            'username': 'admin',
            'email': 'admin@cmis.com',
            'password_hash': hashlib.sha256('admin123'.encode()).hexdigest(),
            'phone': '+1234567890',
            'is_admin': True,
            'created_at': datetime.now().isoformat()
        },
        {
            'id': 2,
            'username': 'user1',
            'email': 'user1@cmis.com',
            'password_hash': hashlib.sha256('user123'.encode()).hexdigest(),
            'phone': '+1234567891',
            'is_admin': False,
            'created_at': datetime.now().isoformat()
        }
    ],
    'vehicles': [
        {
            'id': 1,
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2022,
            'vin': '1HGBH41JXMN109186',
            'license_plate': 'ABC123',
            'color': 'Silver',
            'mileage': 15000,
            'status': 'available',
            'location': 'Lot A',
            'created_at': datetime.now().isoformat()
        },
        {
            'id': 2,
            'make': 'Honda',
            'model': 'Civic',
            'year': 2021,
            'vin': '2HGFC2F59NH123456',
            'license_plate': 'XYZ789',
            'color': 'Blue',
            'mileage': 25000,
            'status': 'in_service',
            'location': 'Service Bay 1',
            'created_at': datetime.now().isoformat()
        }
    ],
    'services': [
        {
            'id': 1,
            'name': 'Brake Repair',
            'description': 'Complete brake system inspection and repair',
            'price': 299.99,
            'duration_hours': 2,
            'service_type': 'brake_repair',
            'parts': [
                {'id': 1, 'name': 'Brake Pads', 'part_number': 'BP-001', 'quantity_required': 1, 'price': 89.99},
                {'id': 2, 'name': 'Brake Fluid', 'part_number': 'BF-001', 'quantity_required': 1, 'price': 12.99}
            ]
        },
        {
            'id': 2,
            'name': '3000km Service',
            'description': 'Regular maintenance service every 3000km',
            'price': 149.99,
            'duration_hours': 1,
            'service_type': '3000km_service',
            'parts': [
                {'id': 3, 'name': 'Oil Filter', 'part_number': 'OF-001', 'quantity_required': 1, 'price': 19.99}
            ]
        }
    ],
    'parts': [
        {
            'id': 1,
            'name': 'Brake Pads',
            'part_number': 'BP-001',
            'description': 'High-quality ceramic brake pads',
            'price': 89.99,
            'stock_quantity': 50,
            'supplier': 'AutoParts Inc'
        },
        {
            'id': 2,
            'name': 'Brake Fluid',
            'part_number': 'BF-001',
            'description': 'DOT 3 brake fluid',
            'price': 12.99,
            'stock_quantity': 75,
            'supplier': 'FluidTech'
        },
        {
            'id': 3,
            'name': 'Oil Filter',
            'part_number': 'OF-001',
            'description': 'Engine oil filter',
            'price': 19.99,
            'stock_quantity': 100,
            'supplier': 'FilterCorp'
        }
    ],
    'appointments': [],
    'incident_reports': [],
    'tokens': {}
}

class CMISHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def send_json_response(self, data, status_code=200):
        """Send JSON response with CORS headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def get_request_data(self):
        """Get JSON data from request body"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            return json.loads(post_data.decode('utf-8'))
        except:
            return {}

    def get_auth_user(self):
        """Get authenticated user from token"""
        auth_header = self.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        user_id = DATABASE['tokens'].get(token)
        if not user_id:
            return None
        
        return next((u for u in DATABASE['users'] if u['id'] == user_id), None)

    def generate_token(self, user_id):
        """Generate a simple token"""
        token = hashlib.sha256(f"{user_id}_{datetime.now().isoformat()}".encode()).hexdigest()
        DATABASE['tokens'][token] = user_id
        return token

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/health':
            self.send_json_response({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'message': 'CMIS Backend is running'
            })
            return

        # Protected routes require authentication
        user = self.get_auth_user()
        if not user:
            self.send_json_response({'message': 'Authentication required'}, 401)
            return

        if path == '/api/vehicles':
            self.send_json_response(DATABASE['vehicles'])
        elif path == '/api/services':
            self.send_json_response(DATABASE['services'])
        elif path == '/api/parts':
            self.send_json_response(DATABASE['parts'])
        elif path == '/api/appointments':
            if user['is_admin']:
                self.send_json_response(DATABASE['appointments'])
            else:
                user_appointments = [a for a in DATABASE['appointments'] if a['user_id'] == user['id']]
                self.send_json_response(user_appointments)
        elif path == '/api/incident-reports':
            if user['is_admin']:
                self.send_json_response(DATABASE['incident_reports'])
            else:
                user_reports = [r for r in DATABASE['incident_reports'] if r['user_id'] == user['id']]
                self.send_json_response(user_reports)
        else:
            self.send_json_response({'message': 'Endpoint not found'}, 404)

    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        data = self.get_request_data()

        if path == '/api/login':
            username = data.get('username')
            password = data.get('password')
            
            if not username or not password:
                self.send_json_response({'message': 'Username and password required'}, 400)
                return
            
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            user = next((u for u in DATABASE['users'] if u['username'] == username and u['password_hash'] == password_hash), None)
            
            if user:
                token = self.generate_token(user['id'])
                user_data = {k: v for k, v in user.items() if k != 'password_hash'}
                self.send_json_response({
                    'access_token': token,
                    'user': user_data
                })
            else:
                self.send_json_response({'message': 'Invalid credentials'}, 401)
            return

        if path == '/api/register':
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if not all([username, email, password]):
                self.send_json_response({'message': 'Username, email, and password required'}, 400)
                return
            
            # Check if user exists
            if any(u['username'] == username for u in DATABASE['users']):
                self.send_json_response({'message': 'Username already exists'}, 400)
                return
            
            if any(u['email'] == email for u in DATABASE['users']):
                self.send_json_response({'message': 'Email already exists'}, 400)
                return
            
            # Create new user
            new_user = {
                'id': len(DATABASE['users']) + 1,
                'username': username,
                'email': email,
                'password_hash': hashlib.sha256(password.encode()).hexdigest(),
                'phone': data.get('phone', ''),
                'is_admin': False,
                'created_at': datetime.now().isoformat()
            }
            DATABASE['users'].append(new_user)
            
            self.send_json_response({'message': 'User created successfully'}, 201)
            return

        # Protected routes require authentication
        user = self.get_auth_user()
        if not user:
            self.send_json_response({'message': 'Authentication required'}, 401)
            return

        if path == '/api/vehicles':
            new_vehicle = {
                'id': len(DATABASE['vehicles']) + 1,
                'make': data.get('make', ''),
                'model': data.get('model', ''),
                'year': data.get('year', 2024),
                'vin': data.get('vin', ''),
                'license_plate': data.get('license_plate', ''),
                'color': data.get('color', ''),
                'mileage': data.get('mileage', 0),
                'status': data.get('status', 'available'),
                'location': data.get('location', ''),
                'created_at': datetime.now().isoformat()
            }
            DATABASE['vehicles'].append(new_vehicle)
            self.send_json_response({'message': 'Vehicle created successfully', 'vehicle': new_vehicle}, 201)

        elif path == '/api/appointments':
            new_appointment = {
                'id': len(DATABASE['appointments']) + 1,
                'user_id': user['id'],
                'user': user['username'],
                'vehicle_id': data.get('vehicle_id'),
                'service_id': data.get('service_id'),
                'appointment_date': data.get('appointment_date'),
                'status': 'scheduled',
                'notes': data.get('notes', ''),
                'created_at': datetime.now().isoformat()
            }
            
            # Add vehicle and service info
            vehicle = next((v for v in DATABASE['vehicles'] if v['id'] == new_appointment['vehicle_id']), None)
            service = next((s for s in DATABASE['services'] if s['id'] == new_appointment['service_id']), None)
            
            if vehicle:
                new_appointment['vehicle'] = f"{vehicle['year']} {vehicle['make']} {vehicle['model']}"
            if service:
                new_appointment['service'] = service['name']
            
            DATABASE['appointments'].append(new_appointment)
            self.send_json_response({'message': 'Appointment created successfully', 'appointment': new_appointment}, 201)

        elif path == '/api/incident-reports':
            new_report = {
                'id': len(DATABASE['incident_reports']) + 1,
                'user_id': user['id'],
                'user': user['username'],
                'vehicle_id': data.get('vehicle_id'),
                'title': data.get('title', ''),
                'description': data.get('description', ''),
                'incident_type': data.get('incident_type', 'red_flag'),
                'status': 'pending',
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'location_description': data.get('location_description', ''),
                'images': [],
                'videos': [],
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Add vehicle info if provided
            if new_report['vehicle_id']:
                vehicle = next((v for v in DATABASE['vehicles'] if v['id'] == new_report['vehicle_id']), None)
                if vehicle:
                    new_report['vehicle'] = f"{vehicle['year']} {vehicle['make']} {vehicle['model']}"
            
            DATABASE['incident_reports'].append(new_report)
            self.send_json_response({'message': 'Incident report created successfully', 'report': new_report}, 201)

        else:
            self.send_json_response({'message': 'Endpoint not found'}, 404)

    def do_PUT(self):
        """Handle PUT requests"""
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.split('/')
        
        user = self.get_auth_user()
        if not user:
            self.send_json_response({'message': 'Authentication required'}, 401)
            return

        if len(path_parts) >= 4 and path_parts[2] == 'incident-reports':
            report_id = int(path_parts[3])
            data = self.get_request_data()
            
            report = next((r for r in DATABASE['incident_reports'] if r['id'] == report_id), None)
            if not report:
                self.send_json_response({'message': 'Report not found'}, 404)
                return
            
            # Check permissions
            if not user['is_admin'] and report['user_id'] != user['id']:
                self.send_json_response({'message': 'Unauthorized'}, 403)
                return
            
            # Update report
            updatable_fields = ['title', 'description', 'incident_type', 'latitude', 'longitude', 'location_description']
            for field in updatable_fields:
                if field in data:
                    report[field] = data[field]
            
            # Admin can update status
            if user['is_admin'] and 'status' in data:
                report['status'] = data['status']
            
            report['updated_at'] = datetime.now().isoformat()
            
            self.send_json_response({'message': 'Report updated successfully', 'report': report})
        else:
            self.send_json_response({'message': 'Endpoint not found'}, 404)

    def do_DELETE(self):
        """Handle DELETE requests"""
        parsed_path = urlparse(self.path)
        path_parts = parsed_path.path.split('/')
        
        user = self.get_auth_user()
        if not user:
            self.send_json_response({'message': 'Authentication required'}, 401)
            return

        if len(path_parts) >= 4 and path_parts[2] == 'incident-reports':
            report_id = int(path_parts[3])
            
            report = next((r for r in DATABASE['incident_reports'] if r['id'] == report_id), None)
            if not report:
                self.send_json_response({'message': 'Report not found'}, 404)
                return
            
            # Check permissions
            if not user['is_admin'] and report['user_id'] != user['id']:
                self.send_json_response({'message': 'Unauthorized'}, 403)
                return
            
            DATABASE['incident_reports'].remove(report)
            self.send_json_response({'message': 'Report deleted successfully'})
        else:
            self.send_json_response({'message': 'Endpoint not found'}, 404)

def run_server(port=5000):
    """Run the CMIS backend server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, CMISHandler)
    
    print(f"""
    🚗 CMIS Backend Server Started!
    
    ✅ Server running on: http://localhost:{port}
    ✅ Health check: http://localhost:{port}/api/health
    
    📋 Demo Accounts:
    👨‍💼 Admin: admin / admin123
    👤 User: user1 / user123
    
    🔗 API Endpoints:
    - POST /api/login
    - POST /api/register
    - GET /api/vehicles
    - GET /api/services
    - GET /api/appointments
    - GET /api/incident-reports
    - GET /api/parts
    
    Press Ctrl+C to stop the server
    """)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        httpd.server_close()

if __name__ == '__main__':
    run_server()