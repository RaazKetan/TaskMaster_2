# TaskMaster - Complete Local Setup Guide

## Overview
TaskMaster is a MongoDB-only project management app with:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Spring Boot + Java
- **Database**: MongoDB Atlas (cloud-hosted)
- **Authentication**: Custom MongoDB session-based auth (no Firebase)

## Prerequisites

### 1. Install Required Software
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Java 17
brew install openjdk@17

# Install Maven
brew install maven

# Install Node.js 18+
brew install node

# Install Git (if not installed)
brew install git
```

### 2. Fix Java Configuration
```bash
# Set JAVA_HOME permanently
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify Java setup
java -version
mvn -version
```

## Local Development Setup

### Step 1: Clone and Setup Project
```bash
# Clone the repository
git clone <your-repo-url>
cd taskmaster

# Verify project structure
ls -la
# Should see: pom.xml, frontend/, src/, README.md
```

### Step 2: Backend Setup
```bash
# Build the project
mvn clean install -DskipTests

# Create application.properties for local development
mkdir -p src/main/resources
cat > src/main/resources/application-local.properties << EOF
# MongoDB Configuration (uses cloud Atlas)
spring.data.mongodb.uri=mongodb+srv://ketanraaz:8BlnZCDgOgeToqWJ@cluster0.mpsxas7.mongodb.net/taskmaster
spring.data.mongodb.database=taskmaster

# Server Configuration
server.port=8000
server.servlet.context-path=/

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:5000,http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# Logging
logging.level.com.taskmaster=DEBUG
logging.level.org.springframework.data.mongodb=DEBUG
EOF
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Verify package.json (should NOT contain firebase)
grep -i firebase package.json || echo "✓ No Firebase dependencies found"

# Create local environment file
cat > .env.local << EOF
# Development server configuration
VITE_API_URL=http://localhost:8000/api/public
VITE_APP_NAME=TaskMaster
EOF
```

### Step 4: Run the Application

#### Terminal 1 - Backend
```bash
# From project root
mvn spring-boot:run -Dspring-boot.run.profiles=local -Dspring-boot.run.args="--server.port=8000"

# Wait for startup message:
# "Started TaskmasterApplication in X.XXX seconds"
```

#### Terminal 2 - Frontend
```bash
# From frontend directory
cd frontend
npm run dev

# Should start on http://localhost:5173
# Vite will show: "Local: http://localhost:5173/"
```

### Step 5: Test the Application
```bash
# Test backend health
curl http://localhost:8000/api/public/health

# Test MongoDB connection
curl http://localhost:8000/api/public/users

# Open frontend in browser
open http://localhost:5173
```

## Database Information

### MongoDB Atlas Connection
- **Database**: taskmaster
- **Collection**: users (single collection architecture)
- **Connection**: Cloud-hosted (no local MongoDB needed)

### User Document Structure
```json
{
  "_id": "ObjectId(...)",
  "userId": "user_abc123",
  "email": "user@example.com",
  "userdata": {
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe"
  },
  "teams": [
    {
      "teamId": "team_123",
      "name": "Development Team",
      "role": "OWNER"
    }
  ],
  "projects": [
    {
      "projectId": "proj_456",
      "name": "Task Manager",
      "status": "IN_PROGRESS"
    }
  ]
}
```

## Authentication Flow

### Registration
1. POST `/api/public/register` with user data
2. Backend creates user document in MongoDB
3. Returns user data with session token
4. Frontend stores in localStorage

### Login
1. POST `/api/public/login` with email/password
2. Backend validates and creates session
3. Returns user data with session token
4. Frontend stores in localStorage

### Session Management
- Token stored in `localStorage.getItem('sessionToken')`
- User data in `localStorage.getItem('userData')`
- All API requests include token in headers

## API Endpoints

### Public Endpoints (No Auth Required)
- `POST /api/public/register` - User registration
- `POST /api/public/login` - User login
- `GET /api/public/health` - Health check

### Protected Endpoints (Auth Required)
- `GET /api/public/users/{userId}` - Get user profile
- `GET /api/public/teams?userId={userId}` - Get user teams
- `POST /api/public/teams` - Create team
- `GET /api/public/projects?userId={userId}` - Get user projects
- `POST /api/public/projects` - Create project

## Troubleshooting

### Common Issues

#### 1. JAVA_HOME Error
```bash
export JAVA_HOME=$(/usr/libexec/java_home)
echo $JAVA_HOME
```

#### 2. Port Already in Use
```bash
# Kill processes on specific ports
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

#### 3. MongoDB Connection Issues
```bash
# Test connection directly
curl "mongodb+srv://ketanraaz:8BlnZCDgOgeToqWJ@cluster0.mpsxas7.mongodb.net/taskmaster"
```

#### 4. Frontend Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 5. CORS Issues
- Ensure backend is running on port 8000
- Frontend should be on port 5173
- Check application-local.properties CORS settings

### Development Workflow

#### Making Changes
1. **Backend Changes**: Restart Spring Boot server
2. **Frontend Changes**: Vite hot-reloads automatically
3. **Database Changes**: Use MongoDB Atlas dashboard

#### Testing
```bash
# Backend tests
mvn test

# Frontend tests
cd frontend
npm test

# Manual API testing
curl -X POST http://localhost:8000/api/public/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## Production Deployment

### Environment Variables Needed
- MongoDB URI (if using different database)
- Server port configuration
- CORS origins for production domain

### Build Commands
```bash
# Backend
mvn clean package -DskipTests

# Frontend
cd frontend
npm run build
```

## Support

For issues:
1. Check console logs in browser
2. Check Spring Boot logs in terminal
3. Verify MongoDB Atlas connection
4. Test API endpoints with curl

The application uses MongoDB Atlas (cloud) so no local database setup is required.