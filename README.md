# AutoCare Pro

A premium car management system built with React and Node.js, featuring real-time service tracking, automated reminders, and comprehensive admin controls.

## 🚗 Features

### User Features
- **Vehicle Management**: Add and manage multiple vehicles
- **Service Requests**: Submit service requests with detailed information
- **Real-time Tracking**: Track service status and progress
- **Service History**: View complete service history for all vehicles
- **Notifications**: Receive updates on service status
- **Dashboard**: Comprehensive overview of vehicles and services
- **Payment System**: Integrated PayPal and mock payment options

### Admin Features
- **Request Management**: Approve, manage, and update service requests
- **Status Updates**: Real-time status updates for ongoing services
- **Analytics Dashboard**: View system statistics and metrics
- **User Management**: Oversee user accounts and activities
- **Messaging System**: Communicate with customers
- **Fleet Management**: Track and manage service vehicles

## 🛠 Technology Stack

### Frontend
- **React 18** with Vite
- **UI Framework**: Tailwind CSS, Radix UI
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Icons**: Lucide React

### Backend
- **Node.js** with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Payment**: PayPal integration + Mock payments

## 🚀 Quick Deployment

### Automatic Deployment (Recommended)

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/autocare-pro.git
cd autocare-pro
```

2. **Run the automatic deployment script**:
```bash
./deploy.sh
```

This script will:
- ✅ Check dependencies (Node.js, npm)
- ✅ Install backend dependencies
- ✅ Install frontend dependencies
- ✅ Build the frontend
- ✅ Start backend server (port 3001)
- ✅ Start frontend development server (port 5173)
- ✅ Verify both servers are running

### Manual Deployment

#### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Start the server**:
```bash
npm start
```

#### Frontend Setup

1. **Navigate to frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment** (optional):
```bash
cp env.example .env
# Edit .env with your API URL
```

4. **Start development server**:
```bash
npm run dev
```

## 🔐 Authentication

The application includes role-based authentication with two user types:

- **Regular Users**: Can manage vehicles and submit service requests
- **Admin Users**: Can manage all requests and access administrative features

### Admin Access
Admin users are identified by specific email addresses defined in the system.

## 💳 Payment System

AutoCare Pro now features a flexible payment system:

### Payment Options
1. **Mock Payments** (Development/Testing)
   - Simulated payment processing
   - No real charges
   - Perfect for development and testing

2. **PayPal Integration** (Production)
   - Real payment processing
   - Secure PayPal checkout
   - Multiple currency support (USD, EUR, GBP)

### Configuration
To enable PayPal payments in production:
1. Create a PayPal Developer account
2. Get your Client ID and Secret
3. Add to backend `.env`:
```env
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
```

## 🎨 UI Components

The project uses a custom component library built on top of Radix UI primitives:

- Buttons, Cards, Dialogs
- Form inputs and selects
- Tabs and navigation
- Toast notifications
- Loading states

## 📱 Responsive Design

AutoCare Pro is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 🔧 Development

### Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/autocare-pro

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# PayPal Configuration (Optional)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# CORS Configuration
SOCKET_CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3001/api/v1

# Google Maps API (Optional)
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 🌐 Production Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Create a new app** on your preferred platform
2. **Set environment variables** in your platform's dashboard
3. **Deploy using Git**:
```bash
git push heroku main
```

### Frontend Deployment (Vercel/Netlify)

1. **Connect your repository** to your preferred platform
2. **Set build command**: `npm run build`
3. **Set output directory**: `dist`
4. **Set environment variables** in your platform's dashboard

## 📁 Project Structure

```
AutoCare-Pro/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   └── middleware/     # Express middleware
│   ├── server.js           # Main server file
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   └── package.json
├── deploy.sh              # Automatic deployment script
└── README.md
```

## 🔮 Roadmap

- [x] Backend API integration
- [x] Real-time notifications
- [x] File upload system
- [x] Payment processing (PayPal + Mock)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Email notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the component examples in the codebase

## 🚀 Quick Start URLs

After deployment:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001

---

**AutoCare Pro** - Your complete vehicle management solution! 🚗✨

