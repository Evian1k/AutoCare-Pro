# Car Management Information System (CMIS)

A comprehensive full-stack web application for managing car dealerships, rental companies, and fleet operations.

## 🚗 Features

### ✅ MVP Features
- **User Authentication**: Registration, login with role-based access (Admin/User)
- **Incident Reports**: Create, edit, delete incident reports with geolocation
- **Google Maps Integration**: Display incident locations with markers
- **Image/Video Upload**: Support for multimedia evidence in reports
- **Admin Status Management**: Change report status (pending, under investigation, resolved, rejected)
- **Real-time Notifications**: Email and SMS notifications for status changes

### ✅ New MVP Features
- **Service Management**: Brake repair, 3000km service offerings
- **Appointment Booking**: Schedule service appointments
- **Service Reminders**: Automated 3000km service reminders
- **Parts Management**: Display relevant parts for each service
- **Vehicle Management**: Track vehicle inventory and status

## 🛠 Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens
- **Email**: Flask-Mail
- **SMS**: Twilio
- **File Upload**: Local storage with secure filenames

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Maps**: Google Maps API
- **Routing**: React Router DOM

## 📁 Project Structure

```
cmis/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/              # File upload directory
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── store/           # Redux store
│   │   └── App.js           # Main App component
│   ├── package.json         # Node dependencies
│   └── .env                 # Frontend environment variables
├── .env.example             # Environment variables template
└── CMIS_README.md          # This file
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Google Maps API Key

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb cmis_db
   
   # Create user (optional)
   psql -c "CREATE USER cmis_user WITH PASSWORD 'cmis_password';"
   psql -c "GRANT ALL PRIVILEGES ON DATABASE cmis_db TO cmis_user;"
   ```

5. **Environment Variables**
   ```bash
   cp ../.env.example .env
   # Edit .env with your configuration
   ```

6. **Run the backend**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   ```bash
   cp ../.env.example .env
   # Add your Google Maps API key
   REACT_APP_GOOGLE_MAPS_API_KEY=your-api-key
   ```

4. **Run the frontend**
   ```bash
   npm start
   ```

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Incident Reports
- `GET /api/incident-reports` - Get all reports
- `POST /api/incident-reports` - Create new report
- `PUT /api/incident-reports/:id` - Update report
- `DELETE /api/incident-reports/:id` - Delete report

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service

### Parts
- `GET /api/parts` - Get all parts
- `POST /api/parts` - Create new part

### Appointments
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Book appointment

### File Upload
- `POST /api/upload` - Upload files

## 👤 Default Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@cmis.com`

### Regular User
- **Username**: `user1`
- **Password**: `user123`
- **Email**: `user1@cmis.com`

## 🎯 Features in Detail

### Incident Report Management
- Create reports with title, description, and type (red flag/intervention)
- Add geolocation data via Google Maps integration
- Upload images and videos as evidence
- Edit and delete own reports
- Admin can change report status and send notifications

### Service Management
- Predefined services: Brake Repair, 3000km Service
- Custom service creation with parts association
- Price and duration tracking
- Parts inventory management

### Appointment System
- Book appointments for specific services
- Link appointments to vehicles and users
- Status tracking (scheduled, in progress, completed)

### Vehicle Management
- Track vehicle inventory with make, model, year, VIN
- Monitor mileage and service history
- Location and status tracking

### Notification System
- Email notifications for status changes
- SMS notifications (requires Twilio setup)
- Service reminders based on mileage

## 🧪 Testing

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest
```

### Frontend Testing
```bash
# Run React tests
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy with Git

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## ⚙️ Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://user:pass@localhost/cmis_db
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@cmis.com or create an issue in the repository.

## 🗺 Roadmap

- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Integration with external APIs
- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] Customer portal
- [ ] Maintenance scheduling automation

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cmis
   ```

2. **Start Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Start Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

5. **Login with demo accounts**
   - Admin: `admin` / `admin123`
   - User: `user1` / `user123`

The system is now ready for use! 🎉