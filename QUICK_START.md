# 🚗 AutoCare Pro - Quick Start Guide

## System Overview

**AutoCare Pro** is a full-stack car service management system with:

- **Frontend**: React 18 + Vite + Tailwind CSS (Port 5173/3000)
- **Backend**: Node.js + Express + MongoDB + Socket.io (Port 3001)
- **Database**: MongoDB (Port 27017)

## 🚀 3 Ways to Deploy

### 1. 🎯 Instant Start (Recommended for testing)
```bash
./start.sh
```
*Requires: MongoDB installed locally*

### 2. 🐳 Docker Deployment (Recommended for production)
```bash
./deploy.sh
# Choose option 1 (Docker)
```
*Includes everything: MongoDB, Backend, Frontend*

### 3. 📋 Manual Setup
```bash
# Backend
cd backend && npm install && npm run init-db && npm run dev &

# Frontend  
cd frontend && npm install && npm run dev &
```

## 🔗 Frontend ↔ Backend Connection

### How They're Linked

1. **API Base URL**: Frontend calls backend via `VITE_API_BASE_URL`
2. **WebSocket**: Real-time features via `VITE_SOCKET_URL`
3. **CORS**: Backend allows frontend origin in `FRONTEND_URL`

### Configuration Files

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/autocare-pro
```

### Key Connection Points

1. **API Calls**: `frontend/src/lib/constants.js`
   ```javascript
   baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
   ```

2. **Socket Connection**: Frontend connects to backend for real-time updates
3. **Authentication**: JWT tokens passed in API headers
4. **CORS**: Backend configured to accept frontend requests

## 🌐 Access Points

After deployment:

| Service | Local Dev | Docker | Purpose |
|---------|-----------|--------|---------|
| Frontend | http://localhost:5173 | http://localhost:3000 | Main UI |
| Backend API | http://localhost:3001/api | http://localhost:3001/api | REST API |
| MongoDB | localhost:27017 | localhost:27017 | Database |

## 👤 Default Admin Login

```
Email: emmanuel.evian@autocare.com
Password: autocarpro12k@12k.wwc
```

## 🔧 Prerequisites

### For Local Development:
- Node.js 18+
- MongoDB (install with `./install-mongodb.sh`)

### For Docker:
- Docker & Docker Compose

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 busy | `sudo lsof -i :3001` then kill process |
| MongoDB not running | `sudo systemctl start mongod` |
| Frontend can't reach backend | Check `VITE_API_BASE_URL` in frontend/.env |
| Docker issues | `docker-compose down && docker-compose up --build` |

## 📁 Project Structure

```
autocare-pro/
├── backend/          # Node.js API server
│   ├── src/routes/   # API endpoints
│   ├── src/models/   # Database models
│   ├── server.js     # Main server file
│   └── .env          # Backend config
├── frontend/         # React application
│   ├── src/          # React components
│   ├── vite.config.js # Build configuration
│   └── .env          # Frontend config
├── docker-compose.yml # Docker orchestration
├── deploy.sh         # Automated deployment
├── start.sh          # Quick local start
└── DEPLOYMENT.md     # Full deployment guide
```

## 🚀 Next Steps

1. **Deploy**: Choose your preferred method above
2. **Login**: Use admin credentials to access the system
3. **Explore**: Check out the dashboard, truck tracking, and messaging
4. **Customize**: Modify environment variables for your needs
5. **Scale**: Use Docker for production deployment

## 📞 Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Review `backend/README.md` for API documentation
- Look at `docs/` folder for feature documentation

---

**Ready to go? Run `./start.sh` and visit http://localhost:5173!** 🎉