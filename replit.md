# TaskMaster - Project Management Platform

## Overview

TaskMaster is a comprehensive project management platform built with a modern tech stack. It's designed to help teams organize projects, manage tasks, collaborate effectively, and track progress through intuitive interfaces including Kanban boards, analytics dashboards, and real-time collaboration features.

## System Architecture

### Frontend Architecture
- **React 18** with modern hooks and context API
- **Vite** as the build tool and development server
- **Tailwind CSS** for styling with custom utility classes
- **Framer Motion** for animations and micro-interactions
- **React Router** for client-side routing
- **Axios** for HTTP requests with interceptors for authentication

### Backend Architecture
- **Spring Boot 3.x** with Java 17
- **RESTful API** design with proper HTTP status codes
- **Maven** for dependency management and build automation
- **Cross-origin resource sharing (CORS)** configured for frontend integration

### Authentication & Authorization
- **Session-based authentication** using session tokens
- **localStorage** for client-side session persistence
- **JWT decoding** capabilities for token management
- **Context-based user state management** in React

## Key Components

### Data Models
- **User**: Manages user profiles, authentication, and user-specific data
- **Team**: Handles team creation, member management, and role-based access
- **Project**: Project lifecycle management with status tracking
- **Task**: Comprehensive task management with priorities, assignments, and due dates

### Core Features
- **Dashboard**: Real-time analytics with animated charts and metrics
- **Kanban Board**: Drag-and-drop task management with visual status columns
- **Team Management**: Role-based team collaboration with invitation system
- **Project Management**: Full project lifecycle with deadlines and progress tracking
- **Task Management**: Priority-based task system with assignments and status tracking
- **Real-time Updates**: Live collaboration with instant synchronization

### UI Components
- **Reusable UI Library**: Custom components built with Tailwind CSS
- **Animation System**: Smooth transitions using Framer Motion
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Loading States**: Skeleton screens and loading indicators
- **Form Validation**: Client-side validation with error handling

## Data Flow

### Authentication Flow
1. User login/register through MongoDB-based authentication
2. Session token storage in localStorage
3. Token inclusion in API requests via interceptors
4. Context-based user state management across components

### Task Management Flow
1. Tasks are created within projects
2. Tasks can be assigned to team members
3. Status updates trigger real-time UI updates
4. Drag-and-drop operations update task status
5. Changes are persisted to MongoDB

### Project Management Flow
1. Projects are created within teams
2. Team members can be assigned to projects
3. Project progress is calculated based on task completion
4. Real-time updates across all team members

## External Dependencies

### Database
- **MongoDB Atlas** for data persistence
- **Spring Data MongoDB** for database operations
- **Auto-indexing** enabled for performance optimization

### Frontend Dependencies
- **React DnD** for drag-and-drop functionality
- **Recharts** for analytics and data visualization
- **React Hot Toast** for notification system
- **Lucide React** for iconography
- **Date-fns** for date manipulation

### Backend Dependencies
- **Spring Boot Starter Web** for REST API
- **Spring Boot Starter Data MongoDB** for database integration
- **Spring Boot Starter Validation** for input validation

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server on port 5000
- **Backend**: Spring Boot on port 8000
- **Database**: MongoDB Atlas cloud instance

### Production Considerations
- **Environment Variables**: Separate configuration for different environments
- **CORS Configuration**: Properly configured for production domains
- **Session Management**: Secure session token handling
- **Error Handling**: Comprehensive error handling and logging

### Build Process
- **Frontend**: Vite build with optimized assets
- **Backend**: Maven build with Spring Boot packaging
- **Deployment**: Can be deployed to various cloud platforms

## Changelog

- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.