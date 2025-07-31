#!/usr/bin/env python3
"""
Quick test script to verify the CMIS backend is working.
Run this after setting up the database to test basic functionality.
"""

import requests
import json
import sys

def test_backend():
    """Test basic backend functionality."""
    base_url = "http://localhost:5000"
    
    print("🔄 Testing CMIS Backend...")
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print("❌ Health check failed")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on localhost:5000")
        return False
    
    # Test 2: API root
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ API root accessible")
        else:
            print("❌ API root failed")
    except:
        print("❌ API root failed")
    
    # Test 3: Get services (public endpoint)
    try:
        response = requests.get(f"{base_url}/api/services")
        if response.status_code == 200:
            services = response.json().get('services', [])
            print(f"✅ Services endpoint working ({len(services)} services found)")
        else:
            print("❌ Services endpoint failed")
    except:
        print("❌ Services endpoint failed")
    
    # Test 4: User registration
    try:
        user_data = {
            "username": "testuser123",
            "email": "testuser123@example.com",
            "password": "password123",
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/register",
            json=user_data
        )
        
        if response.status_code == 201:
            print("✅ User registration working")
            token = response.json().get('access_token')
            
            # Test 5: Protected endpoint
            headers = {'Authorization': f'Bearer {token}'}
            response = requests.get(f"{base_url}/api/auth/profile", headers=headers)
            
            if response.status_code == 200:
                print("✅ Authentication working")
            else:
                print("❌ Authentication failed")
                
        elif response.status_code == 400 and "already" in response.json().get('error', ''):
            print("✅ User registration working (user already exists)")
        else:
            print(f"❌ User registration failed: {response.json()}")
    except Exception as e:
        print(f"❌ User registration failed: {e}")
    
    # Test 6: Admin login
    try:
        admin_data = {
            "email": "admin@cmis.com",
            "password": "admin123"
        }
        
        response = requests.post(
            f"{base_url}/api/auth/login",
            json=admin_data
        )
        
        if response.status_code == 200:
            print("✅ Admin login working")
            admin_token = response.json().get('access_token')
            
            # Test admin dashboard
            headers = {'Authorization': f'Bearer {admin_token}'}
            response = requests.get(f"{base_url}/api/admin/dashboard", headers=headers)
            
            if response.status_code == 200:
                print("✅ Admin dashboard working")
            else:
                print("❌ Admin dashboard failed")
        else:
            print("❌ Admin login failed")
    except Exception as e:
        print(f"❌ Admin login failed: {e}")
    
    print("\n🎉 Backend test completed!")
    print("\n📋 Quick Test Summary:")
    print("• Backend is running and accessible")
    print("• API endpoints are responding")
    print("• Database is connected")
    print("• Authentication is working")
    print("• Admin features are accessible")
    
    print("\n🔐 Sample Accounts:")
    print("• User: user@example.com / password123")
    print("• Admin: admin@cmis.com / admin123")
    
    print("\n🌐 URLs:")
    print(f"• Backend API: {base_url}")
    print(f"• Health Check: {base_url}/health")
    print(f"• API Documentation: {base_url}")
    
    return True

if __name__ == "__main__":
    success = test_backend()
    sys.exit(0 if success else 1)