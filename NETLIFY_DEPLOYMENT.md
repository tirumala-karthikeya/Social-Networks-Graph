# 🚀 Netlify Deployment Guide for Cybernauts

This guide covers deploying the Cybernauts frontend to Netlify with automatic backend integration.

## 📋 Prerequisites

- GitHub repository with your code
- Netlify account (free tier available)
- Backend already deployed (e.g., on Render, Railway, or Heroku)
- MongoDB Atlas database configured

## 🌐 Netlify Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure all files are committed and pushed to GitHub**
   ```bash
   git add .
   git commit -m "Add Netlify deployment configuration"
   git push origin main
   ```

2. **Verify the following files exist in your repository:**
   - `netlify.toml` (configuration file)
   - `frontend/package.json` (with build:netlify script)
   - `frontend/build/` (after running build locally)

### Step 2: Connect to Netlify

1. **Go to [Netlify Dashboard](https://app.netlify.com)**
2. **Click "New site from Git"**
3. **Choose "GitHub" as your Git provider**
4. **Select your repository** (`cybernauts`)
5. **Configure build settings:**
   - Build command: `npm run build:netlify`
   - Publish directory: `frontend/build`
   - Base directory: `frontend`

### Step 3: Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```
REACT_APP_API_URL=https://cybernauts-backend.onrender.com/api
REACT_APP_ENV=production
GENERATE_SOURCEMAP=false
```

### Step 4: Deploy

1. **Click "Deploy site"**
2. **Wait for the build to complete** (usually 2-5 minutes)
3. **Your site will be available at** `https://your-site-name.netlify.app`

## 🔧 Configuration Details

### netlify.toml Configuration

The `netlify.toml` file includes:

- **Build settings**: Node.js 18, optimized build command
- **Redirects**: API calls proxied to your backend
- **SPA routing**: All routes redirect to index.html for React Router
- **Security headers**: XSS protection, content type options, etc.
- **Caching**: Optimized cache headers for static assets

### Key Features

1. **Automatic API Proxying**
   - All `/api/*` requests are automatically forwarded to your backend
   - No CORS issues in production

2. **SPA Support**
   - All routes redirect to `index.html` for client-side routing
   - Works perfectly with React Router

3. **Performance Optimization**
   - Static assets cached for 1 year
   - Source maps disabled for smaller bundle size
   - Gzip compression enabled

4. **Security Headers**
   - XSS protection enabled
   - Content type sniffing disabled
   - Frame options set to DENY

## 🚀 Advanced Configuration

### Custom Domain

1. **In Netlify dashboard:**
   - Go to **Domain settings**
   - Click **Add custom domain**
   - Enter your domain name
   - Follow DNS configuration instructions

2. **SSL Certificate:**
   - Automatically provided by Netlify
   - HTTPS redirect enabled by default

### Branch Deploys

1. **Enable branch deploys:**
   - Go to **Site settings** → **Build & deploy** → **Deploy contexts**
   - Enable "Deploy previews" for pull requests
   - Enable "Branch deploys" for specific branches

### Form Handling

If you need form submissions:

1. **Enable forms in netlify.toml:**
   ```toml
   [forms]
     enabled = true
   ```

2. **Add form attributes to your forms:**
   ```html
   <form name="contact" method="POST" data-netlify="true">
   ```

### Serverless Functions

If you need serverless functions:

1. **Create functions directory:**
   ```bash
   mkdir -p netlify/functions
   ```

2. **Add function files:**
   ```javascript
   // netlify/functions/hello.js
   exports.handler = async (event, context) => {
     return {
       statusCode: 200,
       body: JSON.stringify({ message: 'Hello World' })
     }
   }
   ```

## 🔄 Continuous Deployment

### Automatic Deployments

- **Main branch**: Deploys automatically on every push
- **Pull requests**: Creates deploy previews
- **Branch deploys**: Deploy specific branches for testing

### Build Hooks

1. **Create build hook:**
   - Go to **Site settings** → **Build & deploy** → **Build hooks**
   - Click **Add build hook**
   - Name it (e.g., "Manual Deploy")
   - Copy the webhook URL

2. **Trigger manual deploy:**
   ```bash
   curl -X POST -d {} https://api.netlify.com/build_hooks/YOUR_HOOK_ID
   ```

## 📊 Performance Monitoring

### Netlify Analytics

1. **Enable analytics:**
   - Go to **Site settings** → **Analytics**
   - Enable **Netlify Analytics**

2. **Monitor:**
   - Page views and unique visitors
   - Top pages and referrers
   - Build times and deploy frequency

### Lighthouse Integration

The configuration includes Lighthouse plugin for performance monitoring:

```toml
[[plugins]]
  package = "@netlify/plugin-lighthouse"
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Netlify dashboard
   # Common fixes:
   - Update Node.js version
   - Clear build cache
   - Check environment variables
   ```

2. **API Calls Not Working**
   - Verify `REACT_APP_API_URL` is set correctly
   - Check backend is accessible
   - Verify CORS settings on backend

3. **Routing Issues**
   - Ensure redirects are configured in netlify.toml
   - Check React Router configuration
   - Verify all routes redirect to index.html

4. **Environment Variables**
   - Check variable names (must start with REACT_APP_)
   - Verify values are correct
   - Redeploy after changing variables

### Debug Steps

1. **Check build logs:**
   - Go to **Deploys** tab in Netlify dashboard
   - Click on failed deploy
   - Review build logs for errors

2. **Test locally:**
   ```bash
   cd frontend
   npm run build:netlify
   npx serve -s build
   ```

3. **Verify configuration:**
   - Check netlify.toml syntax
   - Verify package.json scripts
   - Test environment variables

## 📈 Optimization Tips

### Build Optimization

1. **Reduce bundle size:**
   ```bash
   # Analyze bundle
   npm install -g webpack-bundle-analyzer
   npx webpack-bundle-analyzer build/static/js/*.js
   ```

2. **Enable tree shaking:**
   - Use ES6 imports
   - Avoid importing entire libraries

3. **Optimize images:**
   - Use WebP format
   - Compress images
   - Use lazy loading

### Performance Optimization

1. **Enable compression:**
   - Netlify automatically enables gzip
   - Consider Brotli compression

2. **Use CDN:**
   - Netlify provides global CDN
   - Static assets served from edge locations

3. **Cache optimization:**
   - Configure cache headers in netlify.toml
   - Use service workers for offline support

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit sensitive data
   - Use Netlify's environment variable system
   - Rotate secrets regularly

2. **Headers**
   - Security headers configured in netlify.toml
   - HTTPS enforced by default
   - HSTS enabled

3. **Dependencies**
   - Keep dependencies updated
   - Use `npm audit` to check vulnerabilities
   - Enable Dependabot for automatic updates

## 📞 Support

### Netlify Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [Netlify Status](https://www.netlifystatus.com/)

### Getting Help

1. **Check Netlify documentation**
2. **Review build logs**
3. **Test locally first**
4. **Use Netlify community forums**

---

## 🎉 Deployment Checklist

### Pre-Deployment
- [ ] Code committed to GitHub
- [ ] netlify.toml configured
- [ ] Environment variables set
- [ ] Backend deployed and accessible
- [ ] Build works locally

### Post-Deployment
- [ ] Site loads correctly
- [ ] API calls work
- [ ] Routing functions properly
- [ ] Performance is acceptable
- [ ] Security headers applied

### Production Ready
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Monitoring set up
- [ ] Backup strategy in place

---

**Happy Deploying! 🚀**

Your Cybernauts application is now ready for production deployment on Netlify!