# MongoDB Atlas Setup Guide

## 🚨 Current Issue: MongoDB Connection Failed

The backend is trying to connect to `localhost:27017` which doesn't exist on Render. You need to set up MongoDB Atlas.

## 🔧 Step-by-Step MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/atlas
2. Click "Try Free"
3. Create account or sign in
4. Choose "Free" tier (M0)

### 2. Create Database Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region closest to your users
5. Click "Create"

### 3. Set Up Database Access

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 4. Set Up Network Access

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 5. Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

### 6. Update Render Environment Variables

In your Render dashboard:

1. Go to your service `autocare-pro-2`
2. Go to "Environment" tab
3. Add/Update `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/autocare-pro?retryWrites=true&w=majority
```

**Replace:**
- `your-username` with your Atlas username
- `your-password` with your Atlas password
- `your-cluster` with your actual cluster name

### 7. Complete Environment Variables

Make sure you have ALL these environment variables in Render:

```env
NODE_ENV=production
PORT=10000
API_VERSION=v1
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/autocare-pro?retryWrites=true&w=majority
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

### 8. Redeploy Backend

1. In Render dashboard, go to your service
2. Click "Manual Deploy"
3. Select "Clear build cache & deploy"
4. Wait for deployment

## 🧪 Test After Setup

```bash
# Test health endpoint
curl https://autocare-pro-2.onrender.com/health

# Test API endpoint
curl https://autocare-pro-2.onrender.com/api/v1/payments/config
```

## 🎯 Expected Results

After fixing MongoDB:

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

## 📞 MongoDB Atlas Support

- **Documentation**: https://docs.atlas.mongodb.com
- **Free Tier**: 512MB storage, shared RAM
- **Limits**: 500 connections, 1000 operations/second

## 🔐 Security Notes

- Use strong passwords for database users
- Consider IP whitelisting for production
- Regularly rotate database passwords
- Monitor database usage

---

*Last updated: July 29, 2025* 