#!/usr/bin/env python3
"""
Simple run script for the CMIS Flask backend.
This creates the database tables and starts the server.
"""

from app import app, db
import os

if __name__ == '__main__':
    with app.app_context():
        # Create all database tables
        db.create_all()
        print("Database tables created successfully!")
        
        # Check if we should seed the database
        if os.getenv('SEED_DB', 'false').lower() == 'true':
            print("Seeding database...")
            from seed_data import main as seed_main
            seed_main()
    
    print("Starting CMIS Flask Server...")
    print(f"Server will be available at: http://localhost:{os.getenv('PORT', 5000)}")
    print("API documentation will be available at the root URL")
    
    app.run(
        debug=os.getenv('DEBUG', 'True').lower() == 'true',
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000))
    )