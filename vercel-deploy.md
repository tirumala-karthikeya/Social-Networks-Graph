# 🚀 Vercel Deployment Guide for Cybernauts

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account (for database)

## Step 1: Prepare Your Repository

1. **Commit all your changes** to your GitHub repository
2. **Make sure your code is pushed** to the main/master branch
3. **Verify these files exist**:
   - `vercel.json` ✅
   - `backend/src/index.ts` ✅
   - `frontend/package.json` ✅

## Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub repositories

## Step 3: Import Your Project

1. **Click "New Project"** on your Vercel dashboard
2. **Find your repository** in the list (cybernauts)
3. **Click "Import"** next to your repository
4. **Configure the project**:
   - Project Name: `cybernauts` (or your preferred name)
   - Framework Preset: **Other** (Vercel will auto-detect)
   - Root Directory: `./` (leave as default)

## Step 4: Set Environment Variables

1. **In the project settings**, go to **"Environment Variables"**
2. **Add these variables**:

```
NODE_ENV = production
ENABLE_CLUSTERING = false
MONGODB_URI = your-mongodb-connection-string
CORS_ORIGIN = https://your-app-name.vercel.app
```

3. **Click "Save"** for each variable

## Step 5: Deploy

1. **Click "Deploy"** button
2. **Wait for the build** to complete (usually 2-5 minutes)
3. **Check the build logs** for any errors

## Step 6: Test Your Deployment

1. **Visit your app URL** (provided by Vercel)
2. **Test the health endpoint**: `https://your-app.vercel.app/health`
3. **Test the API**: `https://your-app.vercel.app/api/health`
4. **Test the frontend**: Visit the root URL

## Troubleshooting

### Common Issues:

1. **Build fails**:
   - Check that all dependencies are in package.json
   - Ensure TypeScript compiles without errors

2. **API not working**:
   - Verify environment variables are set
   - Check MongoDB connection string

3. **Frontend not loading**:
   - Ensure frontend build completes successfully
   - Check that build files are in the correct directory

### Getting Help:
- Check Vercel's build logs
- Visit [Vercel Documentation](https://vercel.com/docs)
- Check your app's function logs in Vercel dashboard

## Benefits of Vercel:
- ✅ Automatic deployments on git push
- ✅ Global CDN for fast loading
- ✅ Serverless functions (scales automatically)
- ✅ Free tier with generous limits
- ✅ Easy rollbacks and preview deployments