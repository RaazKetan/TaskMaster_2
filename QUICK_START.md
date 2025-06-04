# TaskMaster - Quick Start Guide

## What You're Running
- **MongoDB-only** project management app (no Firebase)
- **Backend**: Spring Boot on port 8000
- **Frontend**: React/Vite on port 5000
- **Database**: MongoDB Atlas (cloud-hosted)

## Current Status ✅
- Backend: Running and connected to MongoDB Atlas
- Frontend: Running on Vite dev server
- Authentication: Custom MongoDB session-based (no Firebase)

## For Local Development

### 1. Fix Java (if getting JAVA_HOME errors)
```bash
export JAVA_HOME=$(/usr/libexec/java_home)
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
source ~/.zshrc
```

### 2. Backend Setup
```bash
# Build project
mvn clean install -DskipTests

# Run backend
mvn spring-boot:run -Dspring-boot.run.args="--server.port=8000"
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Test the App
- Frontend: http://localhost:5173 (or port shown in terminal)
- Backend API: http://localhost:8000/api/public/health
- Register/Login works with MongoDB authentication

## Key Files Modified

### ✅ Removed Firebase
- Deleted all Firebase packages
- Removed Firebase config files
- Cleaned environment variables
- Updated localStorage keys from 'user' to 'userData'

### ✅ MongoDB Structure
```json
{
  "userId": "user_abc123",
  "email": "user@example.com", 
  "userdata": { "firstName": "John", "lastName": "Doe" },
  "teams": [{ "teamId": "team_123", "name": "Dev Team" }],
  "projects": [{ "projectId": "proj_456", "name": "TaskMaster" }]
}
```

### ✅ Authentication
- Registration: POST /api/public/register
- Login: POST /api/public/login  
- Session: localStorage.getItem('sessionToken')
- User data: localStorage.getItem('userData')

## Troubleshooting

### Port Issues
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

### Java Issues
```bash
java -version
mvn -version
# If errors, see LOCAL_JAVA_SETUP.md
```

### MongoDB Connection
Uses cloud Atlas - no local setup needed.
Connection string in Spring Boot application.properties.

## Next Steps
1. Test registration/login
2. Create teams and projects
3. Verify data persistence in MongoDB Atlas
4. Deploy when ready

Your app is now completely Firebase-free and running on pure MongoDB architecture.