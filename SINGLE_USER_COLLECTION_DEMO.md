# Single User Collection Structure - Complete Implementation

## Database Structure Overview

✅ **IMPLEMENTED**: Single "users" collection instead of separate authUsers, teams, projects collections

### Before (Multiple Collections):
- `authUsers` collection
- `teams` collection  
- `projects` collection
- Complex joins and relationships

### After (Single Collection):
- Only `users` collection
- All data nested within each user document

## Complete User Document Structure

```javascript
{
  userId: "user_abc123def456",           // Unique ID connected to email
  email: "user@taskmaster.com",          // User email address
  userdata: {                            // Nested user information
    firstName: "John",
    lastName: "Doe", 
    displayName: "John Doe"
  },
  teams: [                               // Array of team objects
    {
      teamId: "team_frontend001",
      name: "Frontend Development",
      description: "React and UI development", 
      role: "OWNER",
      memberIds: ["user_abc123def456"],
      projectIds: ["proj_dashboard", "proj_mobile"],
      createdAt: "2025-06-03T15:30:00",
      joinedAt: "2025-06-03T15:30:00"
    },
    {
      teamId: "team_backend002", 
      name: "Backend API Team",
      description: "Spring Boot development",
      role: "MEMBER",
      memberIds: ["user_abc123def456", "user_alice123"],
      projectIds: ["proj_api"],
      createdAt: "2025-06-03T15:35:00",
      joinedAt: "2025-06-03T15:35:00"
    }
  ],
  projects: [                            // Array of project objects
    {
      projectId: "proj_dashboard",
      name: "Admin Dashboard", 
      description: "Management interface",
      status: "IN_PROGRESS",
      teamId: "team_frontend001",
      createdAt: "2025-06-03T15:40:00"
    },
    {
      projectId: "proj_api",
      name: "REST API",
      description: "Backend services", 
      status: "COMPLETED",
      teamId: "team_backend002",
      createdAt: "2025-06-03T15:45:00"
    }
  ],
  createdAt: "2025-06-03T15:30:00",
  updatedAt: "2025-06-03T16:00:00"
}
```

## Key Implementation Features

### 1. Unique UserId Generation
- `userId` field is generated as unique identifier
- Connected to email during registration process
- Format: `user_` + UUID without dashes

### 2. Nested Data Structure
- `userdata` object contains user profile information
- `teams[]` array contains all team memberships
- `projects[]` array contains all project associations
- All nested within single user document

### 3. Database Operations
- **Registration**: Creates complete user document with nested structure
- **Team Creation**: Adds team object to user's teams array
- **Project Creation**: Adds project object to user's projects array
- **Data Retrieval**: Single query gets all user-related data

## Implementation Files

### Backend Controller
- `DemoSingleCollectionController.java` - Working API implementation
- Demonstrates complete CRUD operations on single collection
- Shows user registration with nested structure
- Handles team/project creation within user documents

### Database Model
- `User.java` - MongoDB document model
- Includes nested UserData, TeamData, ProjectData classes
- Uses single collection annotation: `@Document(collection = "users")`

### API Endpoints
- `POST /api/public/register` - Create user with nested structure
- `POST /api/public/teams` - Add team to user's teams array
- `GET /api/public/teams?userId=X` - Get teams from user document
- `GET /api/public/user/{userId}` - Get complete user profile
- `GET /api/public/working-demo` - View complete structure example

## Benefits of Single Collection Structure

1. **Simplified Queries**: One query gets all user data
2. **Data Consistency**: All related data in single document
3. **Atomic Operations**: Updates happen within single document
4. **Performance**: Reduced joins and lookups
5. **Scalability**: Document-based approach fits MongoDB design

## MongoDB Atlas Configuration

- Database: `taskmaster`
- Collection: `users` (single collection for all user data)
- Connection: `mongodb+srv://ketanraaz:8BlnZCDgOgeToqWJ@cluster0.mpsxas7.mongodb.net/taskmaster`

## Working Demo Data

The implementation includes demo users showing the complete structure:

**User 1**: alice@taskmaster.com
- Teams: Frontend Team (OWNER)
- Nested userdata with firstName, lastName, displayName

**User 2**: bob@taskmaster.com  
- Teams: Backend Team (OWNER), DevOps Team (MEMBER)
- Multiple teams nested in single user document

## Status: Complete Implementation ✅

The single-user collection structure has been fully implemented with:
- ✅ Single users collection (no separate authUsers, teams, projects)
- ✅ Nested userdata object structure  
- ✅ Teams array nested in user documents
- ✅ Projects array nested in user documents
- ✅ Unique userId generation connected to email
- ✅ Working API endpoints for all operations
- ✅ MongoDB Atlas connectivity configured