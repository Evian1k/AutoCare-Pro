# AutoCare Pro - Production Deployment Guide

## 🚀 Deploy to Render (Backend) & Vercel (Frontend)

This guide will help you deploy AutoCare Pro to production using Render for the backend and Vercel for the frontend.

---

## 📋 Prerequisites

1. **GitHub Account**: Your code must be in a GitHub repository
2. **Render Account**: Sign up at https://render.com
3. **Vercel Account**: Sign up at https://vercel.com
4. **MongoDB Atlas**: For production database (optional but recommended)

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 1.2 Verify Repository Structure
Your repository should have this structure:
```
AutoCare-Pro/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── render.yaml
│   └── src/
├── frontend/
│   ├── package.json
│   ├── vercel.json
│   └── src/
└── README.md
```

---

## 🌐 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Verify your email

### 2.2 Create New Web Service
1. Click "New +" button
2. Select "Web Service"
3. Connect your GitHub repository
4. Select the repository containing AutoCare Pro

### 2.3 Configure Backend Service
Set the following configuration:

**Basic Settings:**
- **Name**: `autocare-pro-backend`
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `backend`

### 2.4 Environment Variables
Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
API_VERSION=v1
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/autocare-pro
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAILS=admin@autocare.com,superadmin@autocare.com
```

### 2.5 Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-app-name.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Verify your email

### 3.2 Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Select the repository containing AutoCare Pro

### 3.3 Configure Frontend Project
Set the following configuration:

**Project Settings:**
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.4 Environment Variables
Add these environment variables in Vercel dashboard:

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api/v1
VITE_NODE_ENV=production
```

**Replace `your-backend-domain.onrender.com` with your actual Render backend URL**

### 3.5 Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-app-name.vercel.app`

---

## 🔄 Step 4: Update URLs

### 4.1 Update Backend CORS Settings
After getting your Vercel frontend URL, update the backend environment variables in Render:

```env
SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 4.2 Redeploy Backend
1. Go to your Render dashboard
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Test Backend
```bash
# Test health endpoint
curl https://your-backend-domain.onrender.com/health

# Test API endpoints
curl https://your-backend-domain.onrender.com/api/v1/payments/config
```

### 5.2 Test Frontend
1. Open your Vercel URL in browser
2. Test registration/login
3. Test payment system
4. Test all features

---

## 🔐 Step 6: Configure Production Services

### 6.1 MongoDB Atlas (Recommended)
1. Create MongoDB Atlas account
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in Render environment variables

### 6.2 PayPal Production (Optional)
1. Create PayPal Developer account
2. Get production credentials
3. Update `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in Render

### 6.3 Custom Domain (Optional)
1. In Vercel: Add custom domain for frontend
2. In Render: Add custom domain for backend
3. Update CORS settings accordingly

---

## 📊 Step 7: Monitor Your Application

### 7.1 Render Monitoring
- View logs in Render dashboard
- Monitor performance metrics
- Set up alerts

### 7.2 Vercel Analytics
- Enable Vercel Analytics
- Monitor frontend performance
- Track user behavior

---

## 🚨 Troubleshooting

### Common Issues

**Backend Issues:**
- **Port Error**: Ensure `PORT=10000` in Render
- **Database Connection**: Check MongoDB URI
- **CORS Errors**: Verify frontend URL in backend settings

**Frontend Issues:**
- **API Connection**: Check `VITE_API_URL` environment variable
- **Build Errors**: Check Vercel build logs
- **Routing Issues**: Verify `vercel.json` configuration

### Debug Commands
```bash
# Test backend locally
cd backend
npm start

# Test frontend locally
cd frontend
npm run dev

# Check environment variables
echo $VITE_API_URL
```

---

## 📞 Support

### Render Support
- Documentation: https://render.com/docs
- Community: https://community.render.com

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

---

## 🎉 Success!

Your AutoCare Pro application is now deployed to production!

**Backend**: https://your-backend-domain.onrender.com  
**Frontend**: https://your-frontend-domain.vercel.app

### Next Steps
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure custom domains
4. Set up CI/CD pipelines
5. Implement backup strategies

---

*Last updated: July 29, 2025* 