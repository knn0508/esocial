# Vercel Deployment Setup Guide

## Problem: Login/Signup Not Working

The frontend is deployed but can't connect to the backend API because the API URL environment variable is not configured.

## Solution

### Step 1: Deploy Backend (if not already deployed)

Your backend needs to be deployed separately. Choose one:

#### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `esocial` repository
5. Add Service → Select "server" as root directory
6. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esocial
   JWT_SECRET=your_strong_random_secret_here
   JWT_EXPIRE=7d
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
   (Add other variables as needed)
7. Railway will automatically deploy and give you a URL like: `https://your-app.railway.app`

#### Option B: Render
1. Go to [Render](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: esocial-api
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (same as Railway)
7. Deploy - you'll get a URL like: `https://your-app.onrender.com`

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel project dashboard
2. Click on your project (esocial)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api` 
     (or `https://your-backend-url.onrender.com/api` if using Render)
   - **Environment**: Production, Preview, Development (select all)
6. Click **Save**

### Step 3: Redeploy Vercel

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

### Step 4: Verify Backend CORS

Make sure your backend allows requests from your Vercel domain. In `server/index.js`, it should have:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
```

And set `FRONTEND_URL` in your backend environment variables to your Vercel URL:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## Testing

After setup:
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to sign up with a new account
3. Check browser console (F12) for any errors
4. Check backend logs for incoming requests

## Common Issues

### Issue: Still can't connect
- **Check**: Browser console (F12) → Network tab → Look for API requests
- **Check**: Backend URL is correct in Vercel environment variables
- **Check**: Backend is running and accessible
- **Check**: CORS is configured correctly

### Issue: CORS errors
- **Fix**: Update `FRONTEND_URL` in backend environment variables
- **Fix**: Restart backend after changing environment variables

### Issue: Database connection errors
- **Fix**: Make sure MongoDB Atlas IP whitelist includes `0.0.0.0/0` for deployment platforms
- **Fix**: Verify MongoDB connection string is correct

## No Database Migrations

This project uses **MongoDB with Mongoose**, which means:
- ✅ Collections are created automatically when you use the models
- ✅ No migration files needed
- ✅ No migration commands to run
- ✅ Just deploy and use - the database will set itself up

## Quick Checklist

- [ ] Backend deployed (Railway/Render/Heroku)
- [ ] Backend URL obtained (e.g., `https://your-app.railway.app`)
- [ ] `REACT_APP_API_URL` set in Vercel environment variables
- [ ] `FRONTEND_URL` set in backend environment variables
- [ ] Vercel deployment redeployed
- [ ] Backend CORS configured
- [ ] MongoDB Atlas IP whitelist updated

Once all these are done, login and signup should work! 🎉

