# Backend Deployment Guide

## Prerequisites

- Node.js v18 or higher
- MongoDB (Atlas or local)
- Git
- Deployment platform account (Heroku, DigitalOcean, etc.)

## Local Development Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/wedding_vendors_SSG_loc
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Start MongoDB (if local)

```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
mongod
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## Production Deployment

### Option 1: Heroku (Recommended for Getting Started)

#### Step 1: Install Heroku CLI

```bash
npm install -g heroku
heroku login
```

#### Step 2: Create Heroku App

```bash
cd backend
heroku create your-app-name

# Add MongoDB Atlas addon
heroku addons:create mongolab
```

#### Step 3: Set Environment Variables

```bash
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend-url.vercel.app
```

#### Step 4: Deploy

```bash
git push heroku main

# View logs
heroku logs --tail

# Check app status
heroku ps
```

**Backend URL**: `https://your-app-name.herokuapp.com`

### Option 2: DigitalOcean App Platform

#### Step 1: Setup Repository

Ensure your code is on GitHub and `backend` folder contains:
- `package.json`
- `index.js`
- All other necessary files

#### Step 2: Create App on DigitalOcean

1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. Click "Apps" → "Create App"
3. Connect GitHub repository
4. Configure app spec:

```yaml
name: shaadi-backend
services:
  - name: backend
    source:
      type: github
      repo: your-username/shaadi-set-go
      branch: main
    build_command: npm install
    run_command: npm start
    http_port: 5000
    health_check:
      http_path: /api/health
    envs:
      - key: PORT
        value: 5000
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        scope: RUN_AND_BUILD_TIME
        value: ${JWT_SECRET}
      - key: MONGO_URI
        scope: RUN_AND_BUILD_TIME
        value: ${MONGO_URI}
      - key: CORS_ORIGIN
        scope: RUN_AND_BUILD_TIME
        value: https://your-frontend-url.vercel.app
databases:
  - name: mongodb
    engine: MONGODB
    version: "5.0"
    production: true
```

#### Step 3: Set Environment Variables

In App Settings → Environment Variables:

```
JWT_SECRET=your-secure-secret
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
CORS_ORIGIN=https://your-frontend.vercel.app
```

#### Step 4: Deploy

Click "Deploy App" and monitor the build process.

### Option 3: AWS EC2 with PM2

#### Step 1: Setup EC2 Instance

```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2
```

#### Step 2: Deploy Code

```bash
# Clone repository
git clone your-repo-url
cd shaadi-set-go/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables
```

#### Step 3: Start with PM2

```bash
pm2 start index.js --name "shaadi-backend"
pm2 startup
pm2 save

# View logs
pm2 logs shaadi-backend

# Restart app
pm2 restart shaadi-backend
```

#### Step 4: Configure Nginx Reverse Proxy

```bash
sudo apt install nginx

# Create nginx config
sudo nano /etc/nginx/sites-available/default
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 4: Render.com

#### Step 1: Create Account

Sign up at [render.com](https://render.com)

#### Step 2: Create Web Service

1. Click "New" → "Web Service"
2. Connect GitHub repository
3. Select `backend` directory
4. Configure:
   - **Name**: shaadi-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Paid

#### Step 3: Add Environment Variables

In Service Settings → Environment:

```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-secret
MONGO_URI=mongodb+srv://...
CORS_ORIGIN=https://your-frontend.vercel.app
```

#### Step 4: Deploy

Render automatically deploys on push to main branch.

## MongoDB Atlas Setup

### Step 1: Create Cluster

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0)
3. Choose region close to your deployment

### Step 2: Configure Network Access

1. Go to Security → Network Access
2. Add IP address: 0.0.0.0/0 (for development) or specific IPs
3. For production, whitelist only your server IP

### Step 3: Create Database User

1. Go to Security → Database Access
2. Create user with strong password
3. Save credentials

### Step 4: Get Connection String

1. Click "Connect" on cluster
2. Copy connection string
3. Replace `<password>` with your password

Format:
```
mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

## Database Backup & Recovery

### Automated Backups

MongoDB Atlas provides automatic daily backups. Configure in Cluster Settings → Backup Settings.

### Manual Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" --out=./backup

# Restore MongoDB
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" ./backup
```

## Performance Optimization

### Database Indexes

Add indexes to frequently queried fields:

```javascript
// In database scripts
db.vendors.createIndex({ businessType: 1, city: 1 });
db.bookings.createIndex({ status: 1, createdAt: -1 });
db.users.createIndex({ email: 1 });
```

### Caching Strategy

Implement caching for expensive queries:

```javascript
// Example with Redis (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache vendor list for 1 hour
app.get('/api/vendors', async (req, res) => {
  const cacheKey = 'vendors:all';
  const cached = await client.get(cacheKey);
  
  if (cached) return res.json(JSON.parse(cached));
  
  const vendors = await Vendor.find();
  await client.setex(cacheKey, 3600, JSON.stringify(vendors));
  res.json(vendors);
});
```

### Connection Pooling

MongoDB uses connection pooling by default. Ensure optimal settings:

```javascript
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 45000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(MONGO_URI, options);
```

## Monitoring & Logging

### Application Monitoring

Set up monitoring service:

```bash
# Example: Using New Relic
npm install newrelic

# Create newrelic.js configuration
# Add to top of index.js: require('newrelic');
```

### Log Aggregation

```javascript
// Example: Using Winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ],
});

// Usage
logger.info('Server started');
logger.error('Database error', { error });
```

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check MongoDB version
mongod --version

# Test connection
mongo mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Verify network access is allowed
# Check IP whitelist in MongoDB Atlas
```

### Port Already in Use

```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3000 npm start
```

### Environment Variable Not Loading

```bash
# Verify .env file exists and has correct format
cat .env

# Make sure .env is in correct directory
# Should be in backend/ folder

# Restart application
npm start
```

### CORS Issues

Update CORS configuration in `index.js`:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
```

## Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] CORS_ORIGIN limited to frontend domain
- [ ] Database credentials not in code
- [ ] API validates all inputs
- [ ] Rate limiting implemented
- [ ] Error messages don't expose sensitive info
- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] Database backups enabled
- [ ] Logs monitored for suspicious activity

## Deployment Verification

After deployment:

```bash
# Test API health endpoint
curl https://your-backend-url/api/health

# Check database connection
curl https://your-backend-url/api/admin/stats -H "Authorization: Bearer token"

# Monitor logs
# Check error logs in deployment platform
```

## Scaling Considerations

### Horizontal Scaling

For high traffic, deploy multiple instances:

- Use load balancer (Nginx, HAProxy)
- Store sessions in Redis (not memory)
- Use managed MongoDB with replication
- Scale databases separately from API

### Vertical Scaling

- Increase instance memory/CPU
- Optimize database queries
- Implement caching layer
- Enable compression

## Rollback Procedure

```bash
# View deployment history
git log --oneline

# Rollback to previous version
git revert <commit-hash>
git push heroku main

# Or redeploy previous version
git checkout <commit-hash>
git push heroku main
```

---

**Last Updated**: January 2026  
**Backend Version**: 1.0.0
