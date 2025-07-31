# CMIS - Car Management Information System
## Complete Setup Guide

This document provides a complete setup guide for the CMIS (Car Management Information System) built with Flask backend and React frontend.

## ✨ Features Implemented

### MVP Features ✅
- [x] User authentication (registration, login, JWT)
- [x] Incident report CRUD operations
- [x] Incident report editing and deletion
- [x] Geolocation support (Lat/Long coordinates)
- [x] Geolocation editing for incident reports
- [x] Admin status management (under investigation, rejected, resolved)
- [x] Image and video upload support for incident reports
- [x] Google Map integration for incident locations
- [x] Email notifications for status changes
- [x] SMS notifications for status changes

### New MVP Features ✅
- [x] Service offerings (Brake repair, 3000km service, etc.)
- [x] Appointment booking system
- [x] Service reminders (3000km intervals)
- [x] Parts display for services
- [x] Real-time notifications

### Additional Features ✅
- [x] Vehicle management
- [x] Service parts management
- [x] Admin dashboard with statistics
- [x] User dashboard
- [x] Comprehensive API with validation
- [x] File upload system
- [x] JWT authentication with role management

## 🏗 Architecture

### Backend (Flask + PostgreSQL)
```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── run.py                # Simple run script
├── seed_data.py          # Database seeding script
├── .env.example          # Environment variables template
├── models/               # SQLAlchemy models
│   ├── __init__.py
│   ├── user.py          # User model with authentication
│   ├── vehicle.py       # Vehicle management
│   ├── service.py       # Service and parts models
│   ├── appointment.py   # Appointment booking
│   ├── incident.py      # Incident reports with media
│   └── notification.py  # Email/SMS notifications
└── routes/              # API routes
    ├── __init__.py
    ├── auth.py          # Authentication endpoints
    ├── users.py         # User management
    ├── vehicles.py      # Vehicle CRUD
    ├── services.py      # Service management
    ├── appointments.py  # Appointment booking
    ├── incidents.py     # Incident reports
    ├── admin.py         # Admin functions
    └── notifications.py # Notification management
```

### Frontend (React + Redux Toolkit)
```
frontend/
├── src/
│   ├── store/           # Redux store and API slices
│   │   ├── index.js     # Store configuration
│   │   ├── slices/      # Redux slices
│   │   └── api/         # RTK Query API slices
│   ├── components/      # React components
│   ├── pages/          # Page components
│   └── App.jsx         # Main app component
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## 🚀 Quick Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### 1. Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database and email/SMS credentials

# Create PostgreSQL database
createdb cmis_db

# Run the application (creates tables and seeds data)
SEED_DB=true python run.py
```

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment (optional)
cp env.example .env
# Edit .env with your API URL and Google Maps API key

# Start development server
npm run dev
```

## 📊 Sample Data

The system includes comprehensive sample data:

### Services
- **Brake Repair** ($250) - Brake pads, rotors, fluid
- **3000km Service** ($120) - Oil change, filters
- **Tire Rotation** ($50) - Tire maintenance
- **Engine Diagnostics** ($80) - Computer diagnostics
- **Transmission Service** ($180) - Fluid and filter
- **Battery Replacement** ($150) - New battery installation

### Sample User Account
- **Email**: user@example.com
- **Password**: password123

### Sample Admin Account
- **Email**: admin@cmis.com
- **Password**: admin123

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Flask Configuration
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
DEBUG=True
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/cmis_db

# Email Configuration (SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+1234567890

# Admin Configuration
ADMIN_EMAIL=admin@cmis.com

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Vehicles
- `GET /api/vehicles` - Get user vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/{id}` - Update vehicle
- `DELETE /api/vehicles/{id}` - Delete vehicle
- `PUT /api/vehicles/{id}/mileage` - Update mileage

### Services
- `GET /api/services` - Get available services
- `GET /api/services/{id}` - Get service details
- `POST /api/services` - Create service (admin)
- `PUT /api/services/{id}` - Update service (admin)
- `DELETE /api/services/{id}` - Delete service (admin)

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Book appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment
- `GET /api/appointments/due-reminders` - Get service reminders

### Incidents
- `GET /api/incidents` - Get user incidents
- `POST /api/incidents` - Create incident report
- `PUT /api/incidents/{id}` - Update incident
- `DELETE /api/incidents/{id}` - Delete incident
- `POST /api/incidents/{id}/upload` - Upload media
- `PUT /api/incidents/{id}/location` - Update location
- `GET /api/incidents/public` - Get public incidents for map

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/appointments` - All appointments
- `PUT /api/admin/appointments/{id}/status` - Update appointment status
- `GET /api/admin/incidents` - All incidents
- `PUT /api/admin/incidents/{id}/status` - Update incident status
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/{id}/toggle-status` - Toggle user status

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `POST /api/notifications/test` - Send test notification

## 🗄 Database Schema

### Users Table
- id, username, email, password_hash
- first_name, last_name, phone, role
- is_active, created_at, updated_at

### Vehicles Table
- id, user_id, make, model, year, vin
- license_plate, color, mileage, fuel_type
- transmission, engine_size, purchase_date
- last_service_date, next_service_due
- insurance_expiry, registration_expiry, status

### Services Table
- id, name, description, category
- duration_hours, price, service_interval_km
- is_active, requires_appointment

### Service Parts Table
- id, service_id, part_name, part_number
- quantity, unit_price, supplier
- is_required, description

### Appointments Table
- id, user_id, vehicle_id, service_id
- appointment_date, status, priority
- estimated_completion, actual_completion
- current_mileage, notes, admin_notes
- cost, payment_status

### Incidents Table
- id, user_id, vehicle_id, title, description
- incident_type, severity, status
- latitude, longitude, address
- incident_date, reported_date, resolved_date
- admin_notes, resolution_details, is_public

### Incident Media Table
- id, incident_id, file_type, file_name
- file_path, file_size, mime_type, caption

### Notifications Table
- id, user_id, title, message
- notification_type, category, priority, status
- reference_type, reference_id
- sent_at, delivered_at, read_at, failed_at

## 🧪 Testing

### Backend Testing
```bash
cd backend
pip install pytest pytest-flask
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

## 🚀 Production Deployment

### Backend (Heroku/Railway/Render)
1. Create new app on your platform
2. Set environment variables
3. Deploy via Git
4. Run database migrations

### Frontend (Vercel/Netlify)
1. Connect repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure environment variables

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔒 Security Features

- JWT authentication with secure tokens
- Role-based access control (user/admin)
- Input validation and sanitization
- File upload restrictions
- CORS protection
- Rate limiting ready
- Secure password hashing

## 📞 Support

For technical support or questions:
1. Check the API documentation at the root URL
2. Review the code comments
3. Check environment configuration
4. Verify database connection

## 🎯 Next Steps

1. **Configure Email/SMS**: Set up SMTP and Twilio credentials
2. **Google Maps**: Add Google Maps API key for location features
3. **Customize**: Modify services, branding, and styling
4. **Deploy**: Use the production deployment guide
5. **Monitor**: Set up logging and monitoring in production

---

**CMIS - Car Management Information System** 🚗✨

This system provides a complete solution for managing vehicles, services, appointments, and incident reports with real-time notifications and administrative oversight.