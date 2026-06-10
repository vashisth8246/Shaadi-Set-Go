# Vercel Deployment Guide - Frontend

## Quick Start

### Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub account with code pushed to repository
- Backend API URL configured

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Click "Import Git Repository"
4. Search for your `shaadi-set-go` repository
5. Click "Import"

### Step 2: Configure Project Settings

**Framework**: Vite
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`
**Development Command** (optional): `npm run dev`

**Root Directory**: Select `frontend` folder

### Step 3: Set Environment Variables

In the "Environment Variables" section, add:

```
VITE_API_BASE_URL=https://your-backend-url.com
```

#### Environment Variable Examples

**Development**:
```
VITE_API_BASE_URL=http://localhost:5000
```

**Production**:
```
VITE_API_BASE_URL=https://api.shaadisetweddings.com
```

**Same-domain deployment** (backend on same domain):
Leave empty or not set

### Step 4: Deploy

1. Review the configuration
2. Click "Deploy"
3. Wait for build to complete (typically 2-5 minutes)
4. View deployment URL when complete

**Your site is now live!**

Example URL: `https://shaadi-set-go.vercel.app`

## Production Domain Setup

### Connect Custom Domain

1. In Vercel project → Settings → Domains
2. Enter your custom domain (e.g., `shaadisetweddings.com`)
3. Choose connection method:
   - **Vercel Nameservers** (recommended for Vercel-hosted DNS)
   - **CNAME** (for existing domain registrar)

### DNS Configuration

#### Using Vercel Nameservers

Update nameservers at your registrar:

```
ns1.vercel.com
ns2.vercel.com
```

#### Using CNAME

Add CNAME record at your registrar:

```
Name: www
Type: CNAME
Value: cname.vercel.com
```

### SSL/TLS Certificate

Vercel automatically issues free SSL certificate. Wait a few minutes for certificate provisioning.

### Verify Domain Connection

```bash
# Check DNS propagation
nslookup shaadisetweddings.com
# Should show Vercel nameservers

# Check SSL certificate
curl -I https://shaadisetweddings.com
# Should show 200 status and valid certificate
```

## Environment Variables Management

### Setting Variables in Vercel

#### Development Environment

Environment variables only for development branch:

1. Go to Settings → Environment Variables
2. Click "Edit" next to environment variable
3. Select "Development" checkbox
4. Save changes

#### Production Environment

Environment variables for main/production deployments:

1. Go to Settings → Environment Variables
2. Click "Edit"
3. Select "Production" checkbox
4. Save changes

#### Preview Environment

Environment variables for pull request previews:

1. Go to Settings → Environment Variables
2. Select "Preview" checkbox

### Variable Precedence

```
1. Development (dev command)
2. Preview (PR deployments)
3. Production (main branch)
```

### Using `.env.production` File

Add `.env.production` to your frontend directory:

```env
VITE_API_BASE_URL=https://api.shaadisetweddings.com
NODE_ENV=production
```

This file is automatically used during Vercel build.

## Build Configuration

### vercel.json

The `vercel.json` file in the frontend directory configures:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "dist"
}
```

### Build Optimization

#### Code Splitting

Vercel automatically enables Vite's code splitting. Verify in build output:

```
dist/
  ├── index.html
  ├── index.xxx.js
  ├── vendor.xxx.js
  ├── animations.xxx.js
  └── charts.xxx.js
```

#### Caching

Add cache headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(assets|_app/immutable)/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Rewriting and Redirects

### SPA Fallback

All routes should fallback to `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This allows React Router to handle all routes.

### Custom Redirects

Example redirect from `/admin` to `/admin/dashboard`:

```json
{
  "redirects": [
    {
      "source": "/admin",
      "destination": "/admin/dashboard",
      "statusCode": 307
    }
  ]
}
```

## Deployment Monitoring

### Build Logs

Check build progress and errors:

1. Go to Vercel project → Deployments
2. Click on the deployment
3. View build logs
4. Check for any warnings or errors

### Runtime Logs

Monitor application logs:

1. Go to Deployments → Live deployment
2. Click "Runtime Logs"
3. View console errors and info
4. Debug issues in real-time

### Performance Metrics

Check site performance:

1. Go to Analytics (if enabled)
2. View page load times
3. Check visitor metrics
4. Monitor uptime

## Troubleshooting

### Build Fails with "Module not found"

```bash
# Issue: Missing dependencies
# Solution: Add to package.json and redeploy
npm install missing-package
git push origin main
```

### Build Fails with TypeScript Errors

```bash
# Issue: Strict TypeScript mode
# Solution: Fix errors locally
npm run typecheck
# Fix reported issues
git push origin main
```

### API Calls Return 403/404

```bash
# Issue: VITE_API_BASE_URL not set or incorrect
# Solution: Update environment variable
# 1. Vercel Dashboard → Settings → Environment Variables
# 2. Update VITE_API_BASE_URL
# 3. Redeploy
```

### Static Assets Return 404

```bash
# Issue: Assets not in public folder
# Solution: Ensure assets in public/ directory
# Or use relative imports in code
import logo from './assets/logo.png'  // Correct
// NOT: <img src="/assets/logo.png" />  // May fail
```

### Deployment Takes Too Long

```bash
# Issue: Large dependencies or slow network
# Solution: 
# 1. Optimize node_modules (remove unused deps)
# 2. Use npm ci instead of npm install
# 3. Enable caching (automatic)
# 4. Check for large assets
```

### CORS Errors in Production

```javascript
// Issue: API calls blocked by CORS
// Solution: Update backend CORS settings
// backend/index.js
app.use(cors({
  origin: 'https://your-domain.vercel.app',
  credentials: true
}));
```

### Environment Variables Not Loading

```bash
# Issue: .env file not found or not in correct format
# Solution: 
# 1. Ensure .env or .env.production exists in frontend/
# 2. Check format: KEY=value (no spaces)
# 3. Use Vercel dashboard for sensitive values
# 4. Redeploy after changing variables
```

## Performance Optimization

### Image Optimization

Use next-gen image formats:

```javascript
// Instead of:
<img src="image.png" />

// Consider using:
<img src="image.webp" />
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.png" alt="description" />
</picture>
```

### Bundle Analysis

Analyze bundle size:

```bash
npm install --save-dev @vitejs/plugin-visualization
```

Update `vite.config.ts`:

```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
    })
  ]
}
```

### Lazy Loading

Implement route-based code splitting:

```javascript
import { lazy } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Admin = lazy(() => import('./pages/AdminDashboard'));
```

### Font Optimization

Load fonts efficiently:

```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

## Continuous Deployment

### Auto-Deploy on Push

Enabled by default. Every push to main branch auto-deploys.

### Disable Auto-Deploy

1. Go to Settings → Git Configuration
2. Disable "Auto-Deploy" if needed

### Preview Deployments

Every pull request auto-generates preview URL:

```
https://your-project-pr-123.vercel.app
```

Useful for testing before merging.

### Deploy from CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from directory
cd frontend
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# Check logs
vercel logs
```

## Rollback

### Revert to Previous Version

1. Go to Deployments
2. Find previous working deployment
3. Click the three dots
4. Select "Promote to Production"

### Automatic Rollback

If new deployment fails, previous version stays active.

### Manual Rollback via Git

```bash
git revert <commit-hash>
git push origin main
# Vercel auto-deploys the revert
```

## Advanced Configuration

### Middleware

Create `frontend/middleware.js` for request processing:

```javascript
export function middleware(request) {
  // Add custom headers
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'value');
  return response;
}

export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next).*)'],
};
```

### API Routes (if using Vercel Functions)

Create `frontend/api/hello.js`:

```javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}
```

Access at: `https://domain.com/api/hello`

### Serverless Functions

Add backend functions in Vercel:

```bash
# Create function
mkdir -p api
echo 'export default (req, res) => res.json({ data: "test" })' > api/data.js

# Deploy
vercel
```

## Security Best Practices

### Secure Environment Variables

Never commit `.env` files:

```bash
# Ensure .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.production" >> .gitignore
```

Only use Vercel dashboard for sensitive values.

### Content Security Policy

Add CSP headers in `vercel.json`:

```json
{
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
    }
  ]
}
```

### HTTPS Redirect

Auto-redirects HTTP to HTTPS. No configuration needed.

## Analytics & Monitoring

### Enable Web Analytics

1. Go to Analytics in Vercel dashboard
2. Enable "Web Analytics"
3. View real-time traffic data

### Third-Party Analytics

Add Google Analytics:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Error Tracking

Use Sentry for error tracking:

```bash
npm install @sentry/react

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

## Cost Optimization

- **Bandwidth**: Free tier includes 100GB/month
- **Serverless Functions**: Free tier includes 100GB-hours
- **Unlimited Deployments**: Free tier supports unlimited
- **Team**: $20/month for team features

### Reduce Costs

1. Optimize images and bundles
2. Enable caching
3. Use lazy loading
4. Remove unused dependencies

---

**Last Updated**: January 2026
**Version**: 1.0.0
