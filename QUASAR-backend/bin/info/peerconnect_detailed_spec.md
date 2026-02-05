  # PeerConnect Application Detailed Specification

## Application Overview

**PeerConnect** is a social networking platform designed specifically for college students to connect with peers, form teams, and collaborate on projects. The platform enables students to discover others with complementary skills, create project teams, and manage their collaborative work through an integrated team management system.

## Core Features

### 1. User Management & Authentication
- **Registration/Login**: Students can register using college email and password or LinkedIn OAuth
- **Profile Management**: Complete user profiles with skills, experience, bio, branch, and personal information
- **LinkedIn Integration**: Auto-populate skills and experience from LinkedIn profiles
- **JWT Authentication**: 1-day token expiration for secure session management

### 2. Student Discovery & Matching
- **Skill-Based Discovery**: Find students with complementary skills
- **Match Algorithm**: Calculate compatibility based on skills and experience levels
- **Search Functionality**: Search students by name and skills
- **Availability Status**: Track student availability for new projects

### 3. Project Creation & Team Formation
- **Project Creation**: Students create projects with title, description, required skills, team size, and category
- **Project Categories**: Organize projects by type (web development, mobile app, research, etc.)
- **Team Invitation System**: Send project invitations to potential team members
- **Request Management**: Accept/reject project invitations with notification system

### 4. Team Management
- **Role-Based Access**: Project Lead and Team Member roles
- **Team Communication**: Group chat for project teams
- **Member Management**: Leads can remove members, members can leave projects
- **Real-time Notifications**: Live updates for invitations, acceptances, and team changes

### 5. Communication & Notifications
- **In-App Notifications**: Project invites, request status updates
- **Real-time Updates**: WebSocket-based live notifications
- **Notification History**: Persistent storage of all notifications
- **Team Chat**: Project-specific group chat functionality

## Technical Architecture

### Backend Technology Stack
- **Framework**: Spring Boot 3.x
- **Database**: MySQL
- **Authentication**: JWT + OAuth2 (LinkedIn)
- **Real-time Communication**: WebSocket
- **API Documentation**: Swagger/OpenAPI 3
- **Build Tool**: Maven
- **Java Version**: 17+

### Frontend Integration
- **Framework**: React
- **Communication**: RESTful APIs + WebSocket
- **Authentication**: JWT token-based
- **CORS**: Configured for localhost:5173

### Database Design

#### Core Entities

**Users Table**
- id (UUID, Primary Key)
- email (String, Unique)
- password (String, Hashed)
- firstName (String)
- lastName (String)
- bio (Text)
- branch (String)
- graduationYear (Integer)
- availabilityStatus (Enum: AVAILABLE, BUSY, NOT_AVAILABLE)
- profilePictureUrl (String)
- isVerified (Boolean)
- isCollegeVerified (Boolean)
- linkedinId (String, Nullable)
- createdAt (Timestamp)
- updatedAt (Timestamp)

**Skills Table**
- id (UUID, Primary Key)
- name (String, Unique)
- category (String)
- isPredefined (Boolean)
- createdAt (Timestamp)

**UserSkills Table**
- id (UUID, Primary Key)
- userId (UUID, Foreign Key)
- skillId (UUID, Foreign Key)
- level (Enum: BEGINNER, INTERMEDIATE, ADVANCED)
- experience (String, Optional)
- createdAt (Timestamp)

**Projects Table**
- id (UUID, Primary Key)
- title (String)
- description (Text)
- category (String)
- maxTeamSize (Integer)
- currentTeamSize (Integer)
- status (Enum: OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
- leaderId (UUID, Foreign Key)
- createdAt (Timestamp)
- updatedAt (Timestamp)

**ProjectSkills Table**
- id (UUID, Primary Key)
- projectId (UUID, Foreign Key)
- skillId (UUID, Foreign Key)
- required (Boolean)
- createdAt (Timestamp)

**ProjectMembers Table**
- id (UUID, Primary Key)
- projectId (UUID, Foreign Key)
- userId (UUID, Foreign Key)
- role (Enum: LEAD, MEMBER)
- joinedAt (Timestamp)

**ProjectInvitations Table**
- id (UUID, Primary Key)
- projectId (UUID, Foreign Key)
- senderId (UUID, Foreign Key)
- receiverId (UUID, Foreign Key)
- status (Enum: PENDING, ACCEPTED, REJECTED)
- message (Text, Optional)
- createdAt (Timestamp)
- respondedAt (Timestamp, Nullable)

**Notifications Table**
- id (UUID, Primary Key)
- userId (UUID, Foreign Key)
- type (Enum: PROJECT_INVITATION, INVITATION_ACCEPTED, INVITATION_REJECTED, MEMBER_JOINED, MEMBER_LEFT)
- title (String)
- message (Text)
- isRead (Boolean)
- relatedEntityId (UUID, Optional)
- relatedEntityType (String, Optional)
- createdAt (Timestamp)

**ChatMessages Table**
- id (UUID, Primary Key)
- projectId (UUID, Foreign Key)
- senderId (UUID, Foreign Key)
- message (Text)
- messageType (Enum: TEXT, SYSTEM)
- createdAt (Timestamp)

### API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
GET    /api/auth/me                - Get current user info
GET    /api/auth/linkedin          - LinkedIn OAuth initiation
POST   /api/auth/linkedin/callback - LinkedIn OAuth callback
POST   /api/auth/forgot-password   - Password reset request
POST   /api/auth/reset-password    - Password reset confirmation
```

#### User Management Endpoints
```
GET    /api/users/{userId}         - Get user profile
PUT    /api/users/{userId}         - Update user profile
GET    /api/users/search           - Search users by name/skills
GET    /api/users/discover         - Discover students with complementary skills
POST   /api/users/{userId}/profile-picture - Upload profile picture
DELETE /api/users/{userId}/profile-picture - Remove profile picture
```

#### Skills Management Endpoints
```
GET    /api/skills/predefined      - Get predefined skills list
GET    /api/skills/categories      - Get skill categories
POST   /api/skills                 - Create custom skill
GET    /api/user-skills/{userId}   - Get user skills
POST   /api/user-skills           - Add skill to user
PUT    /api/user-skills/{skillId}  - Update user skill
DELETE /api/user-skills/{skillId}  - Remove user skill
GET    /api/user-skills/search     - Search skills
```

#### Project Management Endpoints
```
GET    /api/projects               - Get projects (paginated)
GET    /api/projects/{projectId}   - Get project details
POST   /api/projects               - Create new project
PUT    /api/projects/{projectId}   - Update project
DELETE /api/projects/{projectId}   - Delete project
GET    /api/projects/search        - Search projects
GET    /api/projects/discover      - Discover projects needing skills
GET    /api/projects/my-projects   - Get current user's projects
```

#### Team Management Endpoints
```
GET    /api/projects/{projectId}/team        - Get team members
POST   /api/projects/{projectId}/invitations - Send project invitation
GET    /api/projects/{projectId}/invitations - Get project invitations
PUT    /api/invitations/{invitationId}       - Accept/reject invitation
DELETE /api/projects/{projectId}/members/{userId} - Remove team member
POST   /api/projects/{projectId}/leave       - Leave project
```

#### Chat Endpoints
```
GET    /api/projects/{projectId}/chat        - Get chat messages (paginated)
POST   /api/projects/{projectId}/chat        - Send chat message
```

#### Notification Endpoints
```
GET    /api/notifications          - Get user notifications (paginated)
PUT    /api/notifications/{notificationId}/read - Mark notification as read
PUT    /api/notifications/read-all - Mark all notifications as read
DELETE /api/notifications/{notificationId} - Delete notification
```

#### Static Data Endpoints
```
GET    /api/data/branches          - Get available branches
GET    /api/data/graduation-years  - Get graduation year options
GET    /api/data/project-categories - Get project categories
```

### Real-time Features (WebSocket)

#### WebSocket Endpoints
```
/ws/notifications/{userId}  - User-specific notifications
/ws/chat/{projectId}        - Project-specific chat
```

#### WebSocket Message Types

Notification Message example:
```json
{
  "type": "NOTIFICATION",
  "data": {
    "id": "notification-id",
    "title": "New Project Invitation",
    "message": "John Doe invited you to join 'Mobile App Project'",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

Chat Message example:
```json
{
  "type": "CHAT_MESSAGE",
  "data": {
    "id": "message-id",
    "projectId": "project-id",
    "senderId": "user-id",
    "senderName": "John Doe",
    "message": "Hello team!",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Security Configuration

#### JWT Configuration
- **Token Expiration**: 24 hours
- **Secret Key**: Environment variable
- **Refresh Token**: Optional (can be implemented later)

#### CORS Configuration
- **Allowed Origins**: http://localhost:5173
- **Allowed Methods**: GET, POST, PUT, DELETE
- **Allowed Headers**: Authorization, Content-Type

#### LinkedIn OAuth Configuration
- **Client ID**: Environment variable
- **Client Secret**: Environment variable
- **Redirect URI**: http://localhost:8080/api/auth/linkedin/callback
- **Scopes**: r_liteprofile, r_emailaddress

### Data Validation Rules

#### User Registration
- Email: Valid email format, unique
- Password: Minimum 8 characters
- First Name: Required, 2-50 characters
- Last Name: Required, 2-50 characters
- Graduation Year: 2020-2030 range
- Branch: Required, predefined list

#### Project Creation
- Title: Required, 5-100 characters
- Description: Required, 10-1000 characters
- Max Team Size: 2-10 members
- Category: Required, predefined list
- Required Skills: At least 1 skill

#### Skill Management
- Skill Name: 2-50 characters, unique per user
- Level: Required enum value
- Experience: Optional, max 500 characters

### Error Response Format

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/users",
  "validationErrors": [
    {
      "field": "email",
      "message": "Email is already taken"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Pagination Response Format

```json
{
  "content": [],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "by": "createdAt",
      "direction": "DESC"
    }
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false,
  "numberOfElements": 20
}
```

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=peerconnect
DB_USERNAME=root
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=86400000

# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Application Configuration
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_DIR=uploads/
```

## Deployment Considerations

### Development Setup
1. MySQL server running on localhost:3306
2. Spring Boot application on localhost:8080
3. React frontend on localhost:5173
4. LinkedIn OAuth app configured with proper redirect URIs

### Production Considerations
- Database connection pooling
- File storage strategy (local vs cloud)
- WebSocket scaling considerations
- Rate limiting implementation
- Monitoring and logging setup
- Security headers configuration

## Future Enhancements (Not in Current Scope)

- Project progress tracking and task management
- File sharing within projects
- Advanced analytics and reporting
- Mobile application support
- Integration with other social platforms
- Advanced matching algorithms with ML
- Video/voice chat integration
- Project showcase and portfolio features

This specification provides the complete foundation for building the PeerConnect Spring Boot backend that seamlessly integrates with your React frontend.