# 🚀 Netlify Deployment Setup for MedQuiz Pro

## 📋 Prerequisites

### 1. Install Netlify CLI
```bash
# Install globally
npm install -g netlify-cli

# Verify installation
netlify --version
```

### 2. Login to Netlify
```bash
# Login to your Netlify account
netlify login
```

## 🏗️ Local Production Testing

### 1. Run Production Validation
```bash
# Validate production configuration
npm run validate:prod
```

### 2. Test with Netlify Dev (Recommended)
```bash
# Start local development server with Netlify environment
npm run netlify:dev

# This will:
# - Use netlify.toml configuration
# - Simulate production environment variables
# - Test redirects and headers locally
# - Mirror Netlify's build process
```

### 3. Build and Test Production Locally
```bash
# Create production build
npm run build:prod

# Serve production build
npm run serve:prod

# Or combine validation + quality checks + build
npm run deploy:check
```

## 🌐 Deployment Process

### 1. Deploy to Staging (Preview)
```bash
# Deploy to preview URL for testing
npm run netlify:deploy

# Or manually
netlify build
netlify deploy
```

### 2. Deploy to Production
```bash
# Deploy to production domain
npm run netlify:deploy:prod

# Or manually
netlify build
netlify deploy --prod
```

## 🔧 Environment Configuration

### Production Environment Variables
Set in Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Convex Backend URL
VITE_CONVEX_URL=https://formal-sardine-916.convex.cloud

# Node Environment
NODE_ENV=production
VITE_NODE_ENV=production

# Build Configuration
NODE_VERSION=20
NPM_FLAGS=--force
```

### Build Settings in Netlify Dashboard
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions` (if needed)

## 🧪 Testing Checklist

### Before Production Deployment:

#### ✅ Configuration Validation
- [ ] Run `npm run validate:prod` - all checks pass
- [ ] Verify `netlify.toml` contains all required sections
- [ ] Check `_redirects` file exists for SPA routing

#### ✅ Build Testing
- [ ] Run `npm run build:prod` - builds without errors
- [ ] Run `npm run netlify:build` - Netlify build succeeds
- [ ] Run `npm run serve:prod` - production build serves correctly

#### ✅ Functionality Testing
- [ ] Authentication works (login/logout)
- [ ] Quiz functionality operates properly
- [ ] Navigation works across all routes
- [ ] Mobile responsiveness verified
- [ ] 404 redirects to appropriate page

#### ✅ Performance Testing
- [ ] Bundle size is optimized (<500KB target)
- [ ] Page load times are acceptable
- [ ] Lighthouse scores are good (90+)

## 🐛 Common Issues & Solutions

### Issue: Build Fails with Node Memory Error
**Solution**: Increase memory limit in `netlify.toml`
```toml
[build.environment]
NODE_OPTIONS = "--max-old-space-size=2048"
```

### Issue: SPA Routes Return 404
**Solution**: Ensure `_redirects` file exists:
```
/*    /index.html   200
```

### Issue: Environment Variables Not Available
**Solution**: Set in both:
1. Netlify Dashboard → Environment Variables
2. `netlify.toml` context sections

### Issue: Convex Connection Fails
**Solution**: Verify Convex URL and ensure it's accessible:
```bash
# Test Convex connection
curl https://formal-sardine-916.convex.cloud
```

### Issue: Functions Don't Work
**Solution**: Check functions directory setting:
```toml
[functions]
directory = "netlify/functions"
node_bundler = "esbuild"
```

## 📊 Performance Optimization

### Automatic Optimizations by Netlify:
- ✅ Gzip/Brotli compression
- ✅ Global CDN distribution  
- ✅ Asset optimization
- ✅ HTTP/2 support

### Manual Optimizations in Config:
- ✅ Asset caching headers (31536000s for static assets)
- ✅ HTML caching headers (0s for HTML)
- ✅ Security headers (CSP, HSTS, etc.)
- ✅ Source map disabled in production

## 🔄 Continuous Deployment

### Automatic Deployment Setup:
1. Connect GitHub repository to Netlify
2. Set branch to `main` for production
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Enable automatic deploys on push

### Manual Deployment:
Use the scripts provided in `package.json`:
```bash
npm run netlify:deploy      # Preview deployment
npm run netlify:deploy:prod # Production deployment
```

## 📞 Support & Resources

- **Netlify Documentation**: https://docs.netlify.com/
- **Convex + Netlify Guide**: https://docs.convex.dev/production/hosting/netlify
- **React SPA Deployment**: https://docs.netlify.com/routing/redirects/

## 🎯 Next Steps After Deployment

1. **Monitor Performance**: Use Netlify Analytics
2. **Set Up Forms**: If contact forms needed
3. **Configure Domain**: Custom domain setup
4. **SSL Certificate**: Automatically handled by Netlify
5. **CDN Distribution**: Automatically optimized globally

---

**🚀 Your MedQuiz Pro app is now ready for world-class Netlify deployment!**