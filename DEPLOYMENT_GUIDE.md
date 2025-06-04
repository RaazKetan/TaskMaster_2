# TaskMaster - Vercel Deployment Guide

## Clean MongoDB-Only Architecture

This project has been cleaned and optimized for Vercel deployment:

### ✅ Removed Unnecessary Files
- Firebase dependencies and configuration
- Test and demo files
- Development documentation
- Unused authentication components
- Console logs for production
- Build artifacts and cache

### ✅ Frontend Structure (Vercel Ready)
```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/ (Login, Register)
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── teams/
│   │   └── ui/
│   ├── context/AuthContext.jsx
│   ├── services/api.jsx
│   └── utils/auth.js
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env (for production)
```

## Vercel Deployment Steps

### 1. Frontend Deployment
```bash
cd frontend
npm install
npm run build
```

### 2. Vercel Configuration
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 3. Environment Variables
Set in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com/api/public
VITE_APP_NAME=TaskMaster
```

### 4. Backend Deployment Options

#### Option A: Railway/Render (Spring Boot)
- Deploy your Spring Boot backend
- Update VITE_API_URL with deployed backend URL

#### Option B: Vercel Serverless (Node.js conversion needed)
- Convert Spring Boot endpoints to Node.js/Express
- Use Vercel serverless functions

## Production Architecture

### Database: MongoDB Atlas
- Collection: `users` (single collection)
- No local MongoDB required
- Connection via environment variable

### Authentication Flow
1. Registration: `POST /api/public/register`
2. Login: `POST /api/public/login`
3. Session: localStorage with JWT tokens

### API Structure
```
/api/public/register    - User registration
/api/public/login       - User authentication
/api/public/users/{id}  - User profile
/api/public/teams       - Team management
/api/public/projects    - Project management
```

## Post-Deployment
1. Update CORS settings in backend for Vercel domain
2. Test authentication flow
3. Verify MongoDB Atlas connection
4. Test CRUD operations for teams/projects

Your app is now ready for production deployment with clean, MongoDB-only architecture.