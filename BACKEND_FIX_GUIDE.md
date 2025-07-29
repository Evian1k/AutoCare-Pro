# AutoCare Pro - Backend Fix Guide

## 🚨 Current Issue: Backend 502 Bad Gateway Error

Your backend at `https://autocare-pro-2.onrender.com` is returning a 502 Bad Gateway error, which means the service is not running properly.

## 🔧 Step-by-Step Fix

### 1. Check Render Dashboard

1. Go to https://dashboard.render.com
2. Find your service `autocare-pro-2`
3. Check the **Logs** tab for error messages
4. Check the **Events** tab for deployment status

### 2. Common Issues & Solutions

#### Issue 1: Environment Variables Missing
**Symptoms**: Service fails to start
**Solution**: Add these environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=10000
API_VERSION=v1
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/autocare-pro
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
SOCKET_CORS_ORIGIN=https://auto-care-pro-269h.vercel.app
FRONTEND_URL=https://auto-care-pro-269h.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAILS=admin@autocare.com,superadmin@autocare.com
```

#### Issue 2: Build Command Error
**Symptoms**: Build fails
**Solution**: Ensure build command is `npm install` and start command is `npm start`

#### Issue 3: Root Directory Wrong
**Symptoms**: Service can't find files
**Solution**: Set root directory to `backend`

#### Issue 4: Port Issues
**Symptoms**: Service starts but doesn't respond
**Solution**: Ensure `PORT=10000` in environment variables

### 3. Manual Redeploy

1. In Render dashboard, go to your service
2. Click **Manual Deploy**
3. Select **Clear build cache & deploy**
4. Wait for deployment to complete

### 4. Test Backend After Fix

```bash
# Test health endpoint
curl https://autocare-pro-2.onrender.com/health

# Test API endpoint
curl https://autocare-pro-2.onrender.com/api/v1/payments/config
```

### 5. Update Frontend Configuration

Once backend is working, update your frontend environment variables in Vercel:

1. Go to https://vercel.com/dashboard
2. Find your project `auto-care-pro-269h`
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   VITE_API_URL=https://autocare-pro-2.onrender.com/api/v1
   VITE_NODE_ENV=production
   ```

### 6. Test Complete Connection

```bash
# Test backend
curl https://autocare-pro-2.onrender.com/health

# Test frontend
curl https://auto-care-pro-269h.vercel.app

# Test API connection
curl https://autocare-pro-2.onrender.com/api/v1/payments/config
```

## 🔗 Current URLs

- **Backend**: https://autocare-pro-2.onrender.com
- **Frontend**: https://auto-care-pro-269h.vercel.app
- **API Endpoint**: https://autocare-pro-2.onrender.com/api/v1

## 📋 Checklist

- [ ] Check Render logs for errors
- [ ] Verify environment variables are set
- [ ] Ensure build and start commands are correct
- [ ] Redeploy backend service
- [ ] Test backend endpoints
- [ ] Update frontend environment variables
- [ ] Test complete connection
- [ ] Verify payment system works

## 🆘 If Still Having Issues

1. **Check Render Logs**: Look for specific error messages
2. **Verify MongoDB Connection**: Ensure MongoDB URI is correct
3. **Check PayPal Credentials**: Verify PayPal environment variables
4. **Contact Render Support**: If issues persist

## 🎯 Expected Result

After fixing the backend:

```bash
# Health check should return:
{
  "status": "OK",
  "timestamp": "2025-07-29T22:17:53.592Z",
  "environment": "production",
  "version": "v1"
}

# API check should return:
{
  "success": true,
  "data": {
    "mode": "live",
    "currency": "USD",
    "supportedCurrencies": ["USD", "EUR", "GBP"]
  }
}
```

## 📞 Support

- **Render Documentation**: https://render.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **AutoCare Pro Support**: Check the logs and error messages

---

*Last updated: July 29, 2025* 