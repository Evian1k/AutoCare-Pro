# AutoCare Pro Deployment Guide

## 🚀 Quick Start

### Option 1: One-Click Deployment (Recommended)
```bash
./deploy.sh
```

### Option 2: Manual Docker Deployment
```bash
# Start all services with Docker
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 3: Local Development
```bash
# Install MongoDB locally first, then:
cd backend && npm install && npm run init-db && npm run dev &
cd ../frontend && npm install && npm run dev
```

## 🌐 Access Points

After deployment, access your application at:

- **Frontend**: http://localhost:3000 (Docker) or http://localhost:5173 (Local)
- **Backend API**: http://localhost:3001/api/v1
- **MongoDB**: localhost:27017

## 🔐 Default Admin Accounts

| Name | Email | Password |
|------|-------|----------|
| Emmanuel Evian | emmanuel.evian@autocare.com | autocarpro12k@12k.wwc |
| Ibrahim Mohamud | ibrahim.mohamud@autocare.com | autocarpro12k@12k.wwc |
| Joel Ng'ang'a | joel.nganga@autocare.com | autocarpro12k@12k.wwc |
| Patience Karanja | patience.karanja@autocare.com | autocarpro12k@12k.wwc |
| Joyrose Kinuthia | joyrose.kinuthia@autocare.com | autocarpro12k@12k.wwc |

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/autocare-pro
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=autocarpro12k@12k.wwc
FRONTEND_URL=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## 🐳 Docker Deployment

### Development
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up --build -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### Production
```bash
# Update docker-compose.yml with production settings
# Change JWT_SECRET and database passwords
# Update FRONTEND_URL to your domain

docker-compose -f docker-compose.prod.yml up --build -d
```

## ☁️ Cloud Deployment Options

### 1. DigitalOcean App Platform
```yaml
# app.yaml
name: autocare-pro
services:
- name: backend
  source_dir: /backend
  github:
    repo: your-username/autocare-pro
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${DATABASE_URL}
  - key: JWT_SECRET
    value: ${JWT_SECRET}

- name: frontend
  source_dir: /frontend
  github:
    repo: your-username/autocare-pro
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: autocare-db
  engine: MONGODB
  version: "5"
```

### 2. Heroku Deployment
```bash
# Install Heroku CLI
# Create apps
heroku create autocare-backend
heroku create autocare-frontend

# Add MongoDB addon
heroku addons:create mongolab:sandbox -a autocare-backend

# Deploy backend
cd backend
git init
heroku git:remote -a autocare-backend
git add .
git commit -m "Deploy backend"
git push heroku main

# Deploy frontend (after updating API URL)
cd ../frontend
# Update VITE_API_BASE_URL to Heroku backend URL
git init
heroku git:remote -a autocare-frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

### 3. AWS ECS with RDS
```bash
# Use AWS CLI to create ECS cluster
aws ecs create-cluster --cluster-name autocare-cluster

# Create task definitions for backend and frontend
# Set up Application Load Balancer
# Configure RDS MongoDB or DocumentDB
```

### 4. Vercel + Railway
```bash
# Deploy frontend to Vercel
npm i -g vercel
cd frontend
vercel

# Deploy backend to Railway
# Connect GitHub repo to Railway
# Add MongoDB database
# Set environment variables
```

## 🔒 Security Considerations

### Production Checklist
- [ ] Change default JWT_SECRET
- [ ] Update admin passwords
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Enable database authentication
- [ ] Use environment variables for secrets
- [ ] Set up backup strategy

### SSL/HTTPS Setup
```nginx
# nginx configuration for HTTPS
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Monitoring & Logging

### Health Checks
- Backend: `GET /health`
- Database: `GET /api/v1/health/db`
- Frontend: Check if app loads

### Log Files
- Backend: Console logs with timestamps
- MongoDB: `/var/log/mongodb/mongod.log`
- Nginx: `/var/log/nginx/access.log`

### Monitoring Tools
- **Uptime**: UptimeRobot, Pingdom
- **Performance**: New Relic, DataDog
- **Errors**: Sentry
- **Analytics**: Google Analytics

## 🔄 Backup & Recovery

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/autocare-pro" --out=backup/

# Restore backup
mongorestore --uri="mongodb://localhost:27017/autocare-pro" backup/autocare-pro/
```

### Automated Backups
```bash
# Add to crontab for daily backups
0 2 * * * /usr/bin/mongodump --uri="mongodb://localhost:27017/autocare-pro" --out=/backups/$(date +\%Y\%m\%d)
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Find process using port
   sudo lsof -i :3001
   # Kill process
   sudo kill -9 <PID>
   ```

2. **MongoDB connection errors**
   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   # Start MongoDB
   sudo systemctl start mongod
   ```

3. **Frontend not connecting to backend**
   - Check VITE_API_BASE_URL in frontend/.env
   - Verify backend is running on correct port
   - Check CORS configuration

4. **Docker issues**
   ```bash
   # Clean up Docker
   docker system prune -a
   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Debug Commands
```bash
# Check all running processes
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec mongodb mongo
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Test with sample data

## 🚀 Performance Optimization

### Frontend
- Enable gzip compression
- Optimize images
- Use CDN for static assets
- Implement code splitting

### Backend
- Add Redis for caching
- Optimize database queries
- Use connection pooling
- Implement rate limiting

### Database
- Add proper indexes
- Regular maintenance
- Monitor query performance
- Set up replica sets for high availability