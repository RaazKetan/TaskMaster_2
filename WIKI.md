
# TaskMaster Wiki - Complete Documentation

## 📚 Table of Contents

1. [Getting Started](#-getting-started)
2. [User Guide](#-user-guide)
3. [Developer Guide](#-developer-guide)
4. [API Reference](#-api-reference)
5. [Architecture](#-architecture)
6. [Deployment](#-deployment)
7. [Troubleshooting](#-troubleshooting)
8. [FAQ](#-faq)

---

## 🚀 Getting Started

### System Requirements

#### Minimum Requirements
- **RAM**: 4GB
- **Storage**: 2GB free space
- **CPU**: Dual-core processor
- **Network**: Stable internet connection

#### Software Requirements
- **Java**: Version 17 or higher
- **Node.js**: Version 18 or higher
- **Maven**: Version 3.6 or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Installation Guide

1. **Import Project**
   ```bash
   # Fork this repl or import from GitHub
   https://github.com/RaazKetan/TaskMaster_2
   ```

2. **Environment Setup**
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Start Services**
   ```bash
   # Backend starts automatically on port 8000
   # Frontend starts automatically on port 5000
   ```

#### Local Development Setup
1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster
   ```

2. **Backend Setup**
   ```bash
   # Install dependencies
   mvn clean install -DskipTests
   
   # Start backend
   mvn spring-boot:run -Dspring-boot.run.args="--server.port=8000"
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev -- --port 5000 --host 0.0.0.0
   ```

---

## 👤 User Guide

### Account Management

#### Registration Process
1. Navigate to `/register`
2. Fill in required information:
   - First Name
   - Last Name
   - Email Address
   - Password (minimum 8 characters)
3. Click "Create Account"
4. Verify email (if email verification is enabled)

#### Login Process
1. Navigate to `/login`
2. Enter email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

#### Profile Management
- **Access**: Click your avatar in the top-right corner
- **Edit Profile**: Update personal information
- **Change Password**: Security settings
- **Notification Preferences**: Customize alerts

### Team Management

#### Creating a Team
1. **Navigate**: Go to Teams page (`/teams`)
2. **Create**: Click "Create New Team"
3. **Fill Details**:
   ```javascript
   {
     name: "Development Team",
     description: "Frontend and backend developers",
     visibility: "PRIVATE" // or "PUBLIC"
   }
   ```
4. **Save**: Click "Create Team"

#### Inviting Members
1. **Access Team**: Go to team detail page
2. **Invite**: Click "Invite Members"
3. **Add Details**:
   - Email address
   - Role (ADMIN, MEMBER, VIEWER)
   - Personal message (optional)
4. **Send**: Click "Send Invitation"

#### Member Roles
- **ADMIN**: Full access, can manage team and projects
- **MEMBER**: Can create and edit projects/tasks
- **VIEWER**: Read-only access to team resources

### Project Management

#### Creating Projects
1. **Navigate**: Go to Projects page (`/projects`)
2. **Create**: Click "New Project"
3. **Project Details**:
   ```javascript
   {
     name: "Website Redesign",
     description: "Complete redesign of company website",
     teamId: "selected_team_id",
     priority: "HIGH", // LOW, MEDIUM, HIGH
     deadline: "2024-12-31",
     status: "IN_PROGRESS"
   }
   ```

#### Project Statuses
- **PLANNING**: Initial phase, requirements gathering
- **IN_PROGRESS**: Active development
- **REVIEW**: Code review and testing
- **COMPLETED**: Project finished
- **ON_HOLD**: Temporarily paused

#### Project Dashboard
- **Overview**: Key metrics and progress
- **Tasks**: Associated task list
- **Timeline**: Project milestones
- **Team**: Assigned team members
- **Files**: Project documents (coming soon)

### Task Management

#### Quick Add Task
The Quick Add feature allows rapid task creation:

1. **Location**: Available on dashboard and tasks page
2. **Usage**:
   - Type task title
   - Select project (required)
   - Set due date (optional, defaults to current date)
   - Press Enter or click "Add Task"

#### Detailed Task Creation
1. **Navigate**: Tasks page or project detail
2. **Create**: Click "New Task" or "Create Task"
3. **Task Details**:
   ```javascript
   {
     title: "Implement user authentication",
     description: "Add login/logout functionality",
     projectId: "project_123",
     priority: "HIGH",
     status: "TODO",
     assignedTo: "user_456",
     dueDate: "2024-01-15",
     estimatedHours: 8
   }
   ```

#### Task Statuses
- **TODO**: Not started
- **IN_PROGRESS**: Currently being worked on
- **REVIEW**: Under review
- **COMPLETED**: Finished

#### Kanban Board
- **Access**: Tasks page or project detail
- **Features**:
  - Drag and drop tasks between columns
  - Visual status indicators
  - Quick edit functionality
  - Real-time updates

### Dashboard Features

#### Metrics Overview
- **Projects**: Total count and status breakdown
- **Tasks**: Completion rates and pending items
- **Teams**: Team activity and member count
- **Recent Activity**: Latest updates across all projects

#### Charts and Analytics
- **Project Progress**: Visual progress indicators
- **Task Distribution**: Priority and status breakdown
- **Team Performance**: Productivity metrics
- **Time Tracking**: Hours logged per project

### Notifications

#### Notification Types
- **Task Assignments**: When tasks are assigned to you
- **Due Dates**: Upcoming deadlines
- **Project Updates**: Status changes and milestones
- **Team Invitations**: New team invites
- **Comments**: Task and project comments

#### Managing Notifications
1. **Bell Icon**: Click notification bell in header
2. **Mark as Read**: Click on individual notifications
3. **Settings**: Configure notification preferences in profile

---

## 🛠️ Developer Guide

### Project Architecture

#### Frontend Structure
```
frontend/src/
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard widgets
│   ├── projects/           # Project management
│   ├── tasks/              # Task management
│   ├── teams/              # Team management
│   ├── ui/                 # Reusable UI components
│   └── layout/             # Layout components
├── context/                # React context providers
├── services/               # API service layer
├── utils/                  # Utility functions
└── styles/                 # CSS and styling
```

#### Backend Structure
```
src/main/java/com/taskmaster/
├── controller/             # REST API controllers
├── model/                  # Data models/entities
├── repository/             # Data access layer
├── service/                # Business logic layer
├── config/                 # Configuration classes
└── TaskMasterApplication.java  # Main application class
```

### Component Development

#### Creating New Components
1. **Component Structure**:
   ```javascript
   import React, { useState, useEffect } from 'react';
   
   const MyComponent = ({ prop1, prop2 }) => {
     const [state, setState] = useState(null);
     
     useEffect(() => {
       // Component logic
     }, []);
     
     return (
       <div className="my-component">
         {/* Component JSX */}
       </div>
     );
   };
   
   export default MyComponent;
   ```

2. **Styling Guidelines**:
   - Use Tailwind CSS classes
   - Follow existing design patterns
   - Ensure responsive design
   - Add hover and focus states

#### State Management
- **Local State**: Use `useState` for component-specific state
- **Global State**: Use React Context for shared state
- **API State**: Use custom hooks for API calls

### Backend Development

#### Creating Controllers
```java
@RestController
@RequestMapping("/api/myresource")
@CrossOrigin(origins = "*")
public class MyResourceController {
    
    @Autowired
    private MyResourceService service;
    
    @GetMapping
    public ResponseEntity<?> getAllResources(@RequestParam String userId) {
        try {
            List<MyResource> resources = service.findByUserId(userId);
            return ResponseEntity.ok(resources);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Failed to fetch resources"));
        }
    }
}
```

#### Service Layer
```java
@Service
public class MyResourceService {
    
    @Autowired
    private UserRepository userRepository;
    
    public List<MyResource> findByUserId(String userId) {
        User user = userRepository.findByUserId(userId);
        if (user == null) {
            throw new EntityNotFoundException("User not found");
        }
        return user.getMyResources();
    }
}
```

### Database Schema

#### User Document Structure
```javascript
{
  "_id": "user_123",
  "email": "user@example.com",
  "password": "hashed_password",
  "sessionToken": "session_token",
  "userdata": {
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "notifications": []
  },
  "teams": [],
  "projects": [],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Project Structure
```javascript
{
  "_id": "project_123",
  "name": "Website Redesign",
  "description": "Complete website overhaul",
  "teamId": "team_456",
  "teamName": "Development Team",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "deadline": "2024-12-31",
  "tasks": [],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Task Structure
```javascript
{
  "_id": "task_789",
  "title": "Implement authentication",
  "description": "Add login/logout functionality",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assignedTo": "user_123",
  "dueDate": "2024-01-15",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

## 🔌 API Reference

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "sessionToken": "session_abc123",
  "message": "User registered successfully",
  "userId": "user_123",
  "email": "john@example.com"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "sessionToken": "session_abc123",
  "message": "Login successful",
  "userId": "user_123",
  "userdata": {
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe"
  }
}
```

### Project Endpoints

#### Get Projects
```http
GET /api/projects?userId=user_123
```

**Response:**
```json
[
  {
    "_id": "project_123",
    "name": "Website Redesign",
    "description": "Complete website overhaul",
    "teamId": "team_456",
    "teamName": "Development Team",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "tasks": []
  }
]
```

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Mobile App",
  "description": "iOS and Android app development",
  "teamId": "team_456",
  "priority": "MEDIUM",
  "deadline": "2024-06-30",
  "userId": "user_123"
}
```

### Task Endpoints

#### Get Tasks
```http
GET /api/tasks?userId=user_123
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Design login screen",
  "description": "Create UI mockups for login",
  "projectId": "project_123",
  "priority": "MEDIUM",
  "dueDate": "2024-01-20",
  "userId": "user_123"
}
```

#### Update Task Status
```http
PUT /api/tasks/task_789/status
Content-Type: application/json

{
  "status": "COMPLETED",
  "userId": "user_123",
  "projectId": "project_123"
}
```

### Team Endpoints

#### Get Teams
```http
GET /api/teams?userId=user_123
```

#### Create Team
```http
POST /api/teams
Content-Type: application/json

{
  "name": "Frontend Team",
  "description": "UI/UX and frontend development",
  "visibility": "PRIVATE",
  "userId": "user_123"
}
```

#### Invite Member
```http
POST /api/teams/team_456/invite
Content-Type: application/json

{
  "email": "newmember@example.com",
  "role": "MEMBER",
  "invitedBy": "user_123"
}
```

---

## 🏗️ Architecture

### System Architecture

#### Overview
TaskMaster follows a modern three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   React     │  │  Tailwind   │  │   Vite      │        │
│  │   Frontend  │  │     CSS     │  │   Build     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                     Business Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Spring Boot │  │   Spring    │  │    Maven    │        │
│  │ Controllers │  │   Services  │  │    Build    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                         MongoDB Driver
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  MongoDB    │  │   Spring    │  │   Document  │        │
│  │   Atlas     │  │    Data     │  │   Models    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

#### Component Interaction
1. **Frontend Components**: React components handle user interactions
2. **API Services**: Axios-based services communicate with backend
3. **REST Controllers**: Spring Boot controllers handle HTTP requests
4. **Service Layer**: Business logic and data validation
5. **Repository Layer**: MongoDB data access and queries
6. **Database**: MongoDB Atlas stores application data

### Data Flow

#### User Action Flow
```
User Interaction → React Component → API Service → HTTP Request 
    ↓
Spring Controller → Service Layer → Repository → MongoDB
    ↓
Database Response → Repository → Service → Controller → JSON Response
    ↓
API Service → React Component → UI Update
```

### Security Architecture

#### Authentication Flow
1. **User Registration/Login**: Credentials validated against MongoDB
2. **Session Token**: Generated and stored in localStorage
3. **API Requests**: Session token included in request headers
4. **Server Validation**: Token validated for each protected endpoint

#### Data Security
- **Password Hashing**: Passwords stored with secure hashing
- **HTTPS**: All communication encrypted in production
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Proper cross-origin resource sharing

---


#### Environment Variables
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmaster
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

#### Deployment Configuration
```bash
# Build command (if needed)
mvn clean package

# Run command for production
mvn spring-boot:run -Dspring-boot.run.args="--server.port=8000"
```

### Manual Deployment

#### Production Build
```bash
# Backend
mvn clean package
java -jar target/taskmaster-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
# Serve build folder with static server
```

#### Environment Setup
```bash
# Production environment variables
export MONGODB_URI=your_production_mongodb_uri
export JWT_SECRET=your_production_jwt_secret
export PORT=8000
```

### Docker Deployment (Alternative)

#### Dockerfile (Backend)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/taskmaster-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "preview"]
```

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**Issue: Port 8000 already in use**
```bash
# Solution 1: Kill existing process
lsof -ti:8000 | xargs kill -9

# Solution 2: Use different port
mvn spring-boot:run -Dspring-boot.run.args="--server.port=8080"
```

**Issue: MongoDB connection failed**
```bash
# Check connection string
echo $MONGODB_URI

# Verify network connectivity
ping cluster0.mongodb.net

# Check credentials and IP whitelist in MongoDB Atlas
```

**Issue: Maven build failure**
```bash
# Clean and rebuild
mvn clean
mvn clean install -DskipTests

# Check Java version
java -version
# Should be Java 17 or higher
```

#### Frontend Issues

**Issue: npm install fails**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue: Vite build errors**
```bash
# Check Node.js version
node --version
# Should be 18 or higher

# Update dependencies
npm update
```

**Issue: API calls failing (CORS)**
```bash
# Verify backend is running on port 8000
curl http://localhost:8000/api/health

# Check vite.config.js proxy configuration
```

#### Database Issues

**Issue: MongoDB Atlas connection timeout**
- Verify IP address is whitelisted (0.0.0.0/0 for development)
- Check username and password
- Verify database name in connection string

**Issue: Authentication failed**
- Verify MongoDB user credentials
- Check database permissions
- Test connection string in MongoDB Compass

### Performance Issues

#### Slow API Responses
1. **Database Indexing**: Add indexes for frequently queried fields
2. **Query Optimization**: Review and optimize database queries
3. **Caching**: Implement caching for static data
4. **Connection Pooling**: Configure optimal connection pool size

#### Frontend Performance
1. **Bundle Size**: Analyze and optimize bundle size
2. **Lazy Loading**: Implement code splitting
3. **Image Optimization**: Optimize images and assets
4. **Caching**: Implement proper caching strategies

### Error Codes

#### HTTP Status Codes
- **200**: Success
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (invalid session)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error (server-side issue)

#### Custom Error Messages
```javascript
// Common error responses
{
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## ❓ FAQ

### General Questions

**Q: What browsers are supported?**
A: TaskMaster supports all modern browsers including Chrome, Firefox, Safari, and Edge. Internet Explorer is not supported.

**Q: Is TaskMaster free to use?**
A: Yes, TaskMaster is open-source and free to use. You can host it yourself or use the hosted version.

**Q: Can I use TaskMaster offline?**
A: TaskMaster has basic offline capabilities as a PWA, but full functionality requires an internet connection.

**Q: How do I backup my data?**
A: Data is automatically backed up in MongoDB Atlas. You can also export your data through the API.

### Technical Questions

**Q: What's the maximum team size?**
A: There's no hard limit on team size, but performance is optimized for teams of up to 50 members.

**Q: Can I integrate with other tools?**
A: Yes, TaskMaster provides a REST API that can be integrated with tools like Slack, GitHub, and Jira.

**Q: Is there a mobile app?**
A: Currently, TaskMaster is a responsive web application. Native mobile apps are planned for future releases.

**Q: How do I migrate data from other tools?**
A: Data migration tools are available for popular project management platforms. Contact support for assistance.

### Development Questions

**Q: How do I contribute to the project?**
A: Fork the repository, make your changes, and submit a pull request. See the contributing guidelines for details.

**Q: Can I customize the UI?**
A: Yes, the UI is built with Tailwind CSS and can be customized. You can also create custom themes.

**Q: How do I add new features?**
A: Follow the development guide to understand the architecture, then implement your feature and submit a pull request.

**Q: Is there a plugin system?**
A: A plugin system is planned for future releases to allow third-party extensions.

### Deployment Questions

**Q: Can I host TaskMaster on my own servers?**
A: Yes, TaskMaster can be self-hosted. See the deployment guide for instructions.

**Q: What are the hosting requirements?**
A: Minimum 2GB RAM, 10GB storage, and a MongoDB database.

**Q: How do I scale for more users?**
A: Use horizontal scaling with load balancers and multiple server instances. MongoDB Atlas handles database scaling automatically.

**Q: Is HTTPS required?**
A: HTTPS is required for production deployments to ensure security and enable PWA features.

---

## 📞 Support & Community

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this wiki for detailed information
- **Community Discord**: Join our Discord server for real-time help
- **Email Support**: Contact 21ketanraaz@gmail.com

### Contributing
- **Code Contributions**: Submit pull requests for bug fixes and features
- **Documentation**: Help improve documentation and tutorials
- **Testing**: Report bugs and test new features
- **Translation**: Help translate TaskMaster to other languages

---

*Last updated: January 2024*
*Version: 1.3.0*
