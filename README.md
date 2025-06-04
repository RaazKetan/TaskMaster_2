# TaskMaster - Project Management App

A modern project management platform with React frontend and Spring Boot backend.

## Quick Setup for macOS

### Install Prerequisites

1. **Install Homebrew** (if not already installed):
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install required software**:
   ```bash
   # Install Java
   brew install openjdk@17
   
   # Install Maven
   brew install maven
   
   # Install Node.js
   brew install node
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   ```

## Running the App

### Step 1: Download and Setup
1. Clone or download this project
2. Open Terminal and navigate to the project folder

### Step 2: Start MongoDB
```bash
# Create data directory and set permissions
sudo mkdir -p /tmp/mongodb
sudo chown $(whoami) /tmp/mongodb

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
brew services list | grep mongodb
# Should show "started"

# Alternative manual start if service fails
mongod --dbpath /tmp/mongodb --port 27017 --bind_ip 0.0.0.0
```

### Step 3: Start Backend (Spring Boot)
Open a new terminal tab and run:
```bash
# Verify Java version first
java -version
# Should show version 17 or higher

# Clean and install dependencies
mvn clean install -DskipTests

# Start the backend
mvn spring-boot:run -Dspring-boot.run.args="--server.port=8000"

# Backend should show "Started TaskmasterApplication" when ready
# API will be available at: http://localhost:8000/api/public
```

### Step 4: Start Frontend (React)
Open another terminal tab and run:
```bash
# Navigate to frontend folder
cd frontend

# Verify Node.js version
node --version
# Should show version 18 or higher

# Install dependencies
npm install

# Start the development server
npm run dev

# Frontend should show "Local: http://localhost:5000/" when ready
```

### Step 5: Access the App
- Wait for all services to start (should see success messages in each terminal)
- Open your web browser
- Go to: `http://localhost:5000`
- You should see the TaskMaster login page
- Click "Register" to create a new account
- Start creating projects and teams with animated interactions

### Verification Steps:
1. MongoDB: `brew services list | grep mongodb` shows "started"
2. Backend: Terminal shows "Started TaskmasterApplication" 
3. Frontend: Terminal shows "Local: http://localhost:5000/"
4. Browser: Login page loads without errors

## What You'll See
- **Dashboard**: Overview of your projects and teams
- **Projects**: Create and manage projects with animated interactions
- **Teams**: Create teams and collaborate
- **Smooth Animations**: Framer Motion micro-interactions throughout the app

## Common Local Development Issues & Solutions

### Issue: "BUILD FAILURE" or Backend Won't Start
```bash
# Clean and rebuild the project
mvn clean
mvn clean install -DskipTests

# If still failing, check Java version
java -version
# Should show Java 17 or higher

# Set JAVA_HOME if needed
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
```

### Issue: MongoDB Connection Errors
```bash
# Check if MongoDB is actually running
brew services list | grep mongodb

# If not running, start it
brew services start mongodb-community

# Check MongoDB logs
brew services info mongodb-community

# Alternative: Run MongoDB manually
mongod --config /opt/homebrew/etc/mongod.conf
```

### Issue: "Port Already in Use" Errors
```bash
# For backend (port 8000)
lsof -ti:8000 | xargs kill -9

# For frontend (port 5000) 
lsof -ti:5000 | xargs kill -9

# For MongoDB (port 27017)
lsof -ti:27017 | xargs kill -9
```

### Issue: Frontend Dependencies Problems
```bash
# Complete cleanup and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# If still issues, try different Node version
node --version
# Should be 18+ 
```

### Issue: Environment Variables Not Working
Create a `.env` file in the root directory:
```bash
# Create .env file
touch .env

# Add these lines to .env
echo "MONGODB_URI=mongodb://localhost:27017/taskmaster" >> .env
```

### Issue: JAVA_HOME Not Defined Error
```bash
# Quick fix for current session
export JAVA_HOME=$(/usr/libexec/java_home)
export PATH="$JAVA_HOME/bin:$PATH"

# Permanent fix (choose your shell)
# For Zsh (default on newer macOS)
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.zshrc
source ~/.zshrc

# For Bash
echo 'export JAVA_HOME=$(/usr/libexec/java_home)' >> ~/.bash_profile
source ~/.bash_profile

# Install Java if missing
brew install openjdk@17

# Verify setup
echo $JAVA_HOME
mvn -version
```
See LOCAL_JAVA_SETUP.md for detailed instructions.

### Issue: "Permission Denied" Errors
```bash
# Fix MongoDB data directory permissions
sudo mkdir -p /tmp/mongodb
sudo chown $(whoami) /tmp/mongodb

# Fix Homebrew permissions if needed
sudo chown -R $(whoami) /opt/homebrew
```

### Issue: Java PATH Problems
```bash
# For Intel Macs
echo 'export PATH="/usr/local/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# For Apple Silicon Macs (M1/M2)
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc

# Reload terminal
source ~/.zshrc
```

### Complete Reset (Nuclear Option)
If nothing works, start fresh:
```bash
# Stop all services
brew services stop mongodb-community
pkill -f spring-boot
pkill -f vite

# Clean everything
mvn clean
rm -rf frontend/node_modules frontend/package-lock.json
rm -rf /tmp/mongodb

# Restart in order
brew services start mongodb-community
mvn clean install
mvn spring-boot:run -Dspring-boot.run.args="--server.port=8000" &
cd frontend && npm install && npm run dev
```

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Spring Boot + Java
- **Database**: MongoDB (single collection architecture)
- **Authentication**: Custom MongoDB-based session authentication
- **Features**: Real-time animations, project management, team collaboration

## That's It!
Your TaskMaster app should now be running locally on your Mac. The app includes smooth animations and a modern interface for managing projects and teams.