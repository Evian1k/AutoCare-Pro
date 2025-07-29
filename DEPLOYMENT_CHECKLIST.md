# AutoCare Pro - Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] All tests pass locally
- [ ] Environment variables are prepared
- [ ] MongoDB Atlas account created (optional)
- [ ] PayPal Developer account created (optional)

---

## 🌐 Render Backend Deployment

### Account Setup
- [ ] Create Render account at https://render.com
- [ ] Connect GitHub repository
- [ ] Verify email address

### Service Configuration
- [ ] Create new Web Service
- [ ] Set name: `autocare-pro-backend`
- [ ] Set environment: `Node`
- [ ] Set root directory: `backend`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `API_VERSION=v1`
- [ ] `MONGODB_URI=your-mongodb-atlas-url`
- [ ] `JWT_SECRET=your-secret-key`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `PAYPAL_CLIENT_ID=your-paypal-client-id`
- [ ] `PAYPAL_CLIENT_SECRET=your-paypal-client-secret`
- [ ] `SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app`
- [ ] `FRONTEND_URL=https://your-frontend-domain.vercel.app`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `ADMIN_EMAILS=admin@autocare.com,superadmin@autocare.com`

### Deployment
- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Note backend URL: `https://your-app-name.onrender.com`
- [ ] Test health endpoint: `https://your-backend-domain.onrender.com/health`

---

## 🎨 Vercel Frontend Deployment

### Account Setup
- [ ] Create Vercel account at https://vercel.com
- [ ] Connect GitHub repository
- [ ] Verify email address

### Project Configuration
- [ ] Import GitHub repository
- [ ] Set framework preset: `Vite`
- [ ] Set root directory: `frontend`
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`
- [ ] Set install command: `npm install`

### Environment Variables
- [ ] `VITE_API_URL=https://your-backend-domain.onrender.com/api/v1`
- [ ] `VITE_NODE_ENV=production`

### Deployment
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note frontend URL: `https://your-app-name.vercel.app`
- [ ] Test frontend application

---

## 🔄 Post-Deployment Configuration

### Update Backend CORS
- [ ] Update `SOCKET_CORS_ORIGIN` with Vercel URL
- [ ] Update `FRONTEND_URL` with Vercel URL
- [ ] Redeploy backend in Render

### Test Application
- [ ] Test user registration
- [ ] Test user login
- [ ] Test payment system (mock)
- [ ] Test admin features
- [ ] Test all major features

### Production Services (Optional)
- [ ] Set up MongoDB Atlas
- [ ] Configure PayPal production credentials
- [ ] Set up custom domains
- [ ] Configure SSL certificates

---

## 📊 Monitoring Setup

### Render Monitoring
- [ ] Set up log monitoring
- [ ] Configure performance alerts
- [ ] Set up uptime monitoring

### Vercel Analytics
- [ ] Enable Vercel Analytics
- [ ] Set up performance monitoring
- [ ] Configure error tracking

---

## 🔐 Security Checklist

- [ ] JWT secret is strong and unique
- [ ] MongoDB connection is secure
- [ ] CORS settings are correct
- [ ] Rate limiting is enabled
- [ ] Environment variables are secure
- [ ] No sensitive data in code

---

## 🚨 Troubleshooting

### Common Issues
- [ ] Backend port conflicts → Set `PORT=10000`
- [ ] CORS errors → Check frontend URL in backend settings
- [ ] Database connection → Verify MongoDB URI
- [ ] Build failures → Check Vercel build logs
- [ ] API connection → Verify `VITE_API_URL`

### Debug Steps
- [ ] Check Render logs
- [ ] Check Vercel build logs
- [ ] Test endpoints with curl
- [ ] Verify environment variables
- [ ] Test locally first

---

## 🎉 Success Criteria

- [ ] Backend responds to health check
- [ ] Frontend loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Payment system works (mock)
- [ ] Admin features work
- [ ] All major features functional
- [ ] No console errors
- [ ] Performance is acceptable

---

## 📞 Support Resources

- [ ] Render Documentation: https://render.com/docs
- [ ] Vercel Documentation: https://vercel.com/docs
- [ ] MongoDB Atlas: https://docs.atlas.mongodb.com
- [ ] PayPal Developer: https://developer.paypal.com

---

*Checklist completed: _____ / _____ items*  
*Deployment date: _____*  
*Deployment status: _____* 