# Git Setup & Deployment Instructions

## ✅ Current Status

Your project has been committed to git locally. Now you need to:

1. Create a GitHub repository
2. Push your code to GitHub
3. Deploy to Vercel

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `esocial` (or your preferred name)
5. Description: "Student & Teacher Mentorship and Networking Platform"
6. Choose **Public** or **Private**
7. **DO NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 2: Push to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/esocial.git

# Rename branch to main if needed
git branch -M main

# Push your code
git push -u origin main
```

**Or if you prefer SSH:**

```bash
git remote add origin git@github.com:YOUR_USERNAME/esocial.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "Add New..." → "Project"
3. Import your GitHub repository (`esocial`)
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```
   (You'll update this after deploying the backend)

6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client directory
cd client

# Deploy
vercel

# Follow the prompts
```

## Step 4: Deploy Backend

For the backend (Express + Socket.io), you have these options:

### Option A: Railway (Recommended)

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
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
   (Add other variables as needed)

7. Railway will automatically deploy

### Option B: Render

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
7. Click "Create Web Service"

### Option C: Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
cd server
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...
# ... add all variables

# Deploy
git subtree push --prefix server heroku main
```

## Step 5: Set Up MongoDB Atlas (Production Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account (if you don't have one)
3. Create a new cluster (free tier M0)
4. Create database user:
   - Username: `esocial-admin` (or your choice)
   - Password: Generate a strong password (save it!)
5. Whitelist IP addresses:
   - For Railway/Render: Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
6. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/esocial`

## Step 6: Update Environment Variables

### Backend Environment Variables

Set these in Railway/Render/Heroku:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esocial
JWT_SECRET=generate_a_strong_random_secret_here
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
FRONTEND_URL=https://your-frontend-name.vercel.app
```

### Frontend Environment Variables

Set this in Vercel:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## Step 7: Update CORS in Backend

After deployment, update `server/index.js` to allow your Vercel frontend URL:

```javascript
origin: process.env.FRONTEND_URL || "http://localhost:3000"
```

This should already be set up to use the `FRONTEND_URL` environment variable.

## Step 8: Test Your Deployment

1. Visit your Vercel frontend URL
2. Try signing up with a test account
3. Verify database connection
4. Test login functionality

## Troubleshooting

### Build Fails on Vercel
- Check that Root Directory is set to `client`
- Verify Build Command is `npm run build`
- Check Output Directory is `build`

### Backend Connection Errors
- Verify `REACT_APP_API_URL` points to your backend URL
- Check CORS settings in backend
- Verify backend environment variables are set

### Database Connection Issues
- Check MongoDB Atlas IP whitelist includes deployment platform IPs
- Verify connection string format
- Check database user permissions

## Next Steps

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Deploy frontend to Vercel
- [ ] Set up MongoDB Atlas
- [ ] Deploy backend to Railway/Render
- [ ] Configure environment variables
- [ ] Test deployment
- [ ] Set up custom domain (optional)

## Need Help?

Check the detailed deployment guide in `DEPLOYMENT.md`

