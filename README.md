
# TaskMaster - Advanced Project Management Platform

<div align="center">

![TaskMaster Logo](https://img.shields.io/badge/TaskMaster-Project%20Management-blue?style=for-the-badge)

A modern, full-stack project management platform built with React, Spring Boot, and MongoDB. Features real-time collaboration, Kanban boards, team management, and animated dashboards.

[![Java](https://img.shields.io/badge/Java-17+-orange?style=flat-square)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?style=flat-square)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18+-blue?style=flat-square)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC?style=flat-square)](https://tailwindcss.com/)

</div>

## 🚀 Features

### Core Functionality
- **🎯 Project Management**: Create, organize, and track projects with detailed timelines
- **📋 Task Management**: Comprehensive task creation with priorities, deadlines, and status tracking
- **👥 Team Collaboration**: Invite members, assign roles, and collaborate in real-time
- **📊 Kanban Boards**: Visual task management with drag-and-drop functionality
- **📈 Analytics Dashboard**: Real-time insights with animated charts and metrics
- **🔔 Notifications**: Smart notification system for team updates and deadlines
- **📅 Calendar Integration**: Built-in calendar for deadline and milestone tracking

### Advanced Features
- **🎨 Modern UI/UX**: Sleek interface with smooth animations using Framer Motion
- **🌓 Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- **⚡ Real-time Updates**: Live collaboration with instant synchronization
- **🔍 Smart Search**: Quick find functionality across projects, tasks, and teams
- **📱 Progressive Web App**: Install and use offline capabilities
- **🎭 Role-based Access**: Granular permissions for team members

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and context
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and micro-interactions
- **Lucide React** - Beautiful, customizable icons
- **Axios** - HTTP client for API communication

### Backend
- **Spring Boot 3.x** - Enterprise-grade Java framework
- **Java 17** - Latest LTS version with modern features
- **Maven** - Dependency management and build automation
- **Spring Data MongoDB** - Database abstraction layer
- **Spring Security** - Authentication and authorization

### Database & Infrastructure
- **MongoDB Atlas** - Cloud-native NoSQL database
- **Replit** - Cloud development and hosting platform

## 🚀 Quick Start

### Prerequisites
- Java 17+ installed
- Node.js 18+ installed
- Maven 3.6+ installed
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskmaster.git
   cd taskmaster
   ```

2. **Backend Setup**
   ```bash
   # Install dependencies and compile
   mvn clean install -DskipTests
   
   # Start the backend server
   mvn spring-boot:run -Dspring-boot.run.args="--server.port=8000"
   ```

3. **Frontend Setup**
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev -- --port 5000 --host 0.0.0.0
   ```

4. **Access the Application**
   - Frontend: `http://localhost:5000`
   - Backend API: `http://localhost:8000/api`

### Environment Configuration

Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/taskmaster
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:5000
```

## 📋 Usage Guide

### Getting Started
1. **Register**: Create your account on the registration page
2. **Create Team**: Set up your first team and invite members
3. **Start Project**: Create your first project and assign it to your team
4. **Add Tasks**: Break down your project into manageable tasks
5. **Track Progress**: Use the Kanban board and dashboard to monitor progress

### Key Workflows

#### Project Creation
```javascript
// Quick project creation with team assignment
const newProject = {
  name: "Website Redesign",
  description: "Complete overhaul of company website",
  teamId: "team_123",
  priority: "HIGH",
  deadline: "2024-12-31"
};
```

#### Task Management
- **Create**: Use the quick-add feature or detailed task form
- **Organize**: Drag and drop tasks between status columns
- **Assign**: Add team members and set priorities
- **Track**: Monitor progress with real-time updates

#### Team Collaboration
- **Invite Members**: Send email invitations with role assignments
- **Real-time Chat**: Built-in communication for team coordination
- **Notifications**: Stay updated with project changes and deadlines

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │────│  Spring Boot    │────│  MongoDB Atlas  │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema
- **Users**: Authentication, profiles, and user preferences
- **Teams**: Team information, member roles, and permissions
- **Projects**: Project details, timelines, and team assignments
- **Tasks**: Task information, status, priorities, and assignments

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

#### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

#### Tasks
- `GET /api/tasks` - List project tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task status/details
- `DELETE /api/tasks/{id}` - Delete task

#### Teams
- `GET /api/teams` - List user teams
- `POST /api/teams` - Create new team
- `POST /api/teams/{id}/invite` - Invite team member

## 🎨 UI Components

### Custom Components
- **QuickAddTask**: Inline task creation with smart defaults
- **KanbanBoard**: Drag-and-drop task management
- **AnimatedDashboard**: Real-time metrics with smooth animations
- **NotificationBell**: Smart notification system
- **TeamCalendar**: Integrated calendar for deadlines

### Design System
- **Colors**: Consistent color palette with theme support
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Systematic spacing scale
- **Animations**: Subtle micro-interactions for better UX

## 🔧 Development

### Available Scripts

#### Backend
```bash
mvn clean install        # Install dependencies
mvn spring-boot:run      # Start development server
mvn test                 # Run tests
mvn package             # Build for production
```

#### Frontend
```bash
npm install             # Install dependencies
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

### Project Structure
```
taskmaster/
├── src/main/java/              # Backend source code
│   └── com/taskmaster/
│       ├── controller/         # REST controllers
│       ├── model/             # Data models
│       ├── repository/        # Data access layer
│       └── service/           # Business logic
├── frontend/src/              # Frontend source code
│   ├── components/            # React components
│   ├── context/              # React context providers
│   ├── services/             # API services
│   └── utils/                # Utility functions
├── target/                   # Build artifacts
└── README.md                # Project documentation
```

## 🌟 Contributing

### Development Guidelines
1. **Code Style**: Follow established patterns and conventions
2. **Testing**: Write tests for new features and bug fixes
3. **Documentation**: Update documentation for API changes
4. **Git Flow**: Use feature branches and pull requests

### Getting Involved
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

### Troubleshooting

#### Common Issues
- **Port conflicts**: Ensure ports 5000 and 8000 are available
- **Database connection**: Verify MongoDB Atlas credentials
- **Build failures**: Check Java and Node.js versions

#### Getting Help
- 📧 Email: support@taskmaster.dev
- 💬 Discord: [TaskMaster Community](https://discord.gg/taskmaster)
- 📖 Documentation: [Wiki Pages](./WIKI.md)

## 🔄 Deployment

### Replit Deployment
This project is optimized for deployment on Replit:

1. **Fork the Repl**: Import from GitHub or create new Repl
2. **Environment Setup**: Configure secrets and environment variables
3. **Deploy**: Use Replit's one-click deployment feature

### Production Considerations
- Environment variables for sensitive data
- Database connection pooling
- Error monitoring and logging
- Performance optimization

## 📊 Roadmap

### Upcoming Features
- [ ] **Mobile App**: Native iOS and Android applications
- [ ] **Advanced Analytics**: Custom reports and data visualization
- [ ] **API Integration**: Connect with popular tools (Slack, GitHub, etc.)
- [ ] **Time Tracking**: Built-in time tracking for tasks and projects
- [ ] **File Management**: Document sharing and version control
- [ ] **Advanced Permissions**: Granular access control

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added Kanban boards and team collaboration
- **v1.2.0** - Introduced animated dashboard and notifications
- **v1.3.0** - Enhanced task management and calendar integration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot Team** - For the excellent framework
- **React Team** - For the powerful UI library
- **MongoDB** - For the flexible database solution
- **Replit** - For the amazing development platform
- **Open Source Community** - For inspiration and contributions

---

<div align="center">

**[🌟 Star this repo](https://github.com/yourusername/taskmaster)** • **[🐛 Report Bug](https://github.com/yourusername/taskmaster/issues)** • **[✨ Request Feature](https://github.com/yourusername/taskmaster/issues)**

Made with ❤️ by the TaskMaster Team

</div>
