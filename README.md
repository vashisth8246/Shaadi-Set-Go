# Shaadi Set Go - Wedding Planning & Management Platform

## 🎊 Overview

**Shaadi Set Go** is a comprehensive wedding planning and management platform built with modern web technologies. It connects couples with vetted vendors across multiple wedding services (venues, catering, photography, music/DJ, and decoration) while providing tools for budget management, checklists, and booking management.

### Key Features

- **Vendor Discovery & Management**: Browse and book vendors across multiple service categories
- **Role-Based Dashboards**: Separate interfaces for customers, vendors, and administrators
- **Budget Calculator**: Plan and track wedding expenses
- **Checklist Manager**: Timeline-based wedding planning checklist
- **Booking System**: Request and manage bookings with status tracking
- **Admin Panel**: Comprehensive dashboard for platform management and vendor approvals
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Status Updates**: Track booking status and vendor responses in real-time

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18.3 with TypeScript
- Vite (build tool and dev server)
- Tailwind CSS (styling)
- Framer Motion (animations)
- React Router DOM (routing)
- Axios (HTTP client)
- Recharts (data visualization)
- Lucide React (icons)

**Backend:**
- Node.js + Express
- MongoDB (database)
- JWT (authentication)
- Multer (file uploads)
- Nodemailer (email service)

### Project Structure

```
Shaadi-Set-Go/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (routes)
│   │   ├── utils/            # Utility functions and services
│   │   ├── data/             # Constants and static content
│   │   ├── App.tsx           # Main app component
│   │   └── main.tsx          # Entry point
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   ├── package.json          # Frontend dependencies
│   └── vercel.json           # Vercel deployment configuration
│
└── backend/
    ├── routes/               # API route handlers
    ├── models/               # Database models
    ├── middleware/           # Custom middleware
    ├── utils/                # Utility functions
    ├── scripts/              # Database scripts
    ├── index.js              # Server entry point
    └── package.json          # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **MongoDB** (local or cloud)
- **Git**

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shaadi-set-go.git
cd shaadi-set-go
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create a .env file with the following variables:
MONGO_URI=mongodb://localhost:27017/wedding_vendors_SSG_loc
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development

# Seed the database with initial data
npm run seed

# Start the development server
npm run dev
```

Backend will be available at `http://localhost:5000`

#### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create a .env file:
VITE_API_BASE_URL=http://localhost:5000

# Start the development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

### Available Scripts

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

**Backend:**
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run tests
npm run seed         # Seed database with vendors
```

## 🔐 Authentication

The platform uses JWT (JSON Web Tokens) for authentication with role-based access control:

- **Customer**: Browse vendors, make bookings, manage requests
- **Vendor**: Manage services, respond to booking requests, view analytics
- **Admin**: Manage users, approve vendors, monitor platform activity

### Default Admin Credentials

```
Email: admin@gmail.com
Password: admin123
```

⚠️ **IMPORTANT**: Change these credentials in production!

## 📋 Environment Variables

### Frontend (.env)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000
# For production, set to your backend URL: https://api.shaadisetweddings.com
```

### Backend (.env)

```env
# MongoDB Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## 🌐 Deployment

### Vercel Deployment (Frontend)

#### Prerequisites
- Vercel account (free at vercel.com)
- GitHub repository with your code

#### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose your Shaadi Set Go repository

#### Step 2: Configure Build Settings

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Step 3: Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
VITE_API_BASE_URL=https://your-backend-url.com
```

#### Step 4: Deploy

Click "Deploy" - Vercel will automatically build and deploy your frontend

**Frontend URL**: `https://your-project.vercel.app`

### Backend Deployment Options

#### Option A: Heroku (Recommended for getting started)

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create a new app
heroku create your-app-name

# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set CORS_ORIGIN=https://your-frontend-url

# Deploy
git push heroku main
```

#### Option B: DigitalOcean App Platform

1. Connect GitHub repository
2. Create a new app
3. Select App Spec → Edit JSON
4. Configure ports, environment variables, and build commands
5. Deploy

#### Option C: MongoDB Atlas + VM (AWS/DigitalOcean/Linode)

1. Setup MongoDB Atlas cluster
2. Deploy Node.js app to VM
3. Configure environment variables
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start index.js --name "shaadi-backend"
pm2 startup
pm2 save
```

### Configuration After Deployment

#### Update Frontend .env for Production

After deploying the backend, update the Vercel environment variable:

```
VITE_API_BASE_URL=https://your-backend-deployed-url.com
```

Then trigger a redeploy on Vercel.

#### Configure CORS on Backend

Update `backend/index.js` CORS settings:

```javascript
app.use(cors({
  origin: ['https://your-frontend-url.vercel.app', 'https://yourdomain.com'],
  credentials: true
}));
```

## 📱 Mobile Responsiveness

The platform is fully responsive and tested on:
- iPhone 12 / 14 / 15
- iPad
- Android devices
- Tablets

Tailwind CSS breakpoints are used throughout:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔍 Testing

### Run Frontend Tests

```bash
cd frontend
npm run test
```

### Run Backend Tests

```bash
cd backend
npm test
```

## 🐛 Troubleshooting

### Backend Connection Issues

**Problem**: Frontend can't connect to backend
- Check that backend is running on port 5000
- Verify `VITE_API_BASE_URL` environment variable
- Check CORS configuration in backend
- Verify no firewall blocking port 5000

### MongoDB Connection Issues

**Problem**: MongoDB connection error
- Verify MongoDB is running locally or MongoDB Atlas URI is correct
- Check network access rules in MongoDB Atlas
- Ensure credentials in `MONGO_URI` are correct

### Build Errors

**Problem**: Build fails with TypeScript errors
```bash
# Run type checking
npm run typecheck

# Fix any reported issues
# Ensure all imports are used (strict mode enabled)
```

**Problem**: Dependencies conflicts
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

#### Venues
- `GET /api/venues` - Get all venues
- `GET /api/venues/:id` - Get venue details
- `POST /api/venues` - Create venue (admin only)

#### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my` - Get user's bookings
- `GET /api/bookings` - Get all bookings (admin)
- `PATCH /api/bookings/:id` - Update booking status

#### Vendors
- `GET /api/vendors` - Get all vendors
- `POST /api/vendors` - Register as vendor
- `GET /api/admin/vendors` - Get vendors (admin only)

Complete API documentation available in `backend/ROUTES.md`

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see LICENSE file for details.

## 👥 Team

- **Frontend Development**: React & TypeScript specialists
- **Backend Development**: Node.js & MongoDB experts
- **UI/UX Design**: Luxury wedding platform focus

## 🎯 Roadmap

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email notifications and reminders
- [ ] Vendor portfolio showcase
- [ ] Advanced analytics and reporting
- [ ] Multi-language support (Hindi/Gujarati)
- [ ] Video consultation booking
- [ ] Guest management and RSVPs
- [ ] Vendor verification system

## 📞 Support

For issues, feature requests, or questions:
- Open an issue on GitHub
- Email: support@shaadisetweddings.com
- Contact: +91-XXXXXXXXXX

## 🎊 Thank You!

Thank you for choosing Shaadi Set Go. We hope to make your wedding planning journey smooth and joyful!

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Production Ready
