# Deployment Guide for Esocial

This guide will help you deploy the Esocial project to Vercel (frontend) and a backend hosting service.

## Prerequisites

1. GitHub account
2. Vercel account (free tier available)
3. MongoDB Atlas account (free tier available) - for production database
4. Cloudinary account (optional, for file uploads)

## Deployment Steps

### 1. Push to GitHub

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Esocial platform"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/esocial.git
git branch -M main
git push -u origin main
```

### 2. Set up MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP address (use `0.0.0.0/0` for Vercel deployment)
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/esocial`

### 3. Deploy Frontend to Vercel

#### Option A: Using Vercel Dashboard
1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app
   ```

#### Option B: Using Vercel CLI
```bash
npm i -g vercel
cd client
vercel
```

### 4. Deploy Backend

You have several options for backend deployment:

#### Option A: Vercel Serverless Functions
1. Create `api/index.js` in the root directory
2. Configure routes as serverless functions
3. Deploy with frontend

#### Option B: Railway (Recommended for Express + Socket.io)
1. Go to [Railway](https://railway.app)
2. Create new project from GitHub
3. Set root directory to `server`
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_production_secret
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

#### Option C: Render
1. Go to [Render](https://render.com)
2. Create new Web Service from GitHub
3. Set root directory to `server`
4. Add environment variables (same as Railway)

#### Option D: Heroku
```bash
heroku create your-app-name
cd server
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...
# ... add all environment variables
git subtree push --prefix server heroku main
```

### 5. Environment Variables

Make sure to set these in your deployment platform:

**Backend (Production):**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esocial
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend (Production):**
```env
REACT_APP_API_URL=https://your-backend-url.railway.app
# or
REACT_APP_API_URL=https://your-backend-url.render.com
```

### 6. Update CORS Settings

After deployment, update `server/index.js` CORS origin to your production frontend URL.

### 7. Post-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Database connection string is set
- [ ] All environment variables are configured
- [ ] Frontend API URL points to backend
- [ ] CORS is configured for production domain
- [ ] Email service is configured (optional)
- [ ] Cloudinary is configured (optional)
- [ ] Test user registration
- [ ] Test user login
- [ ] Verify email verification works (if configured)

## Troubleshooting

### Database Connection Issues
- Check MongoDB Atlas IP whitelist includes deployment platform IPs
- Verify connection string format
- Check database user permissions

### CORS Errors
- Update `FRONTEND_URL` in backend environment variables
- Update CORS origin in `server/index.js`

### Build Failures
- Check Node.js version (should be 16+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

## Support

For deployment issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

