# PeerConnect Spring Boot Application Architecture

## Project Structure

```
src/main/java/com/ADP/peerConnect/
├── PeerConnectApplication.java          # Main application class
├── config/                              # Configuration classes
│   ├── CorsConfig.java                  # CORS configuration
│   ├── JwtConfig.java                   # JWT configuration properties
│   ├── ModelMapperConfig.java           # ModelMapper bean configuration
│   ├── SwaggerConfig.java               # Swagger/OpenAPI configuration
│   └── WebSocketConfig.java             # WebSocket configuration
├── security/                            # Security related classes
│   ├── JwtAuthenticationEntryPoint.java # JWT authentication entry point
│   ├── JwtAuthenticationFilter.java     # JWT filter for requests
│   ├── JwtTokenProvider.java            # JWT token generation and validation
│   ├── SecurityConfig.java              # Main security configuration
│   └── UserPrincipal.java               # Custom user principal
├── model/                               # Domain model classes
│   ├── entity/                          # JPA entities
│   │   ├── User.java                    # User entity
│   │   ├── Skill.java                   # Skill definition
│   │   ├── UserSkill.java              # User-Skill mapping
│   │   ├── Project.java                # Project details
│   │   ├── ProjectSkill.java           # Project-Skill requirements
│   │   ├── ProjectMember.java          # Project team members
│   │   ├── ProjectInvitation.java      # Project invitations
│   │   ├── ProjectJoinRequest.java     # Join requests for projects
│   │   ├── Task.java                   # Project tasks
│   │   ├── Notification.java           # User notifications
│   │   └── ChatMessage.java            # Chat communications
│   ├── dto/                             # Data Transfer Objects
│   │   ├── request/                     # Request DTOs
│   │   └── response/                    # Response DTOs
│   └── enums/                           # Enumerations
├── repository/                          # Data access layer
│   ├── UserRepository.java
│   ├── SkillRepository.java
│   ├── UserSkillRepository.java
│   ├── ProjectRepository.java
│   ├── ProjectSkillRepository.java
│   ├── ProjectMemberRepository.java
│   ├── ProjectInvitationRepository.java
│   ├── ProjectJoinRequestRepository.java
│   ├── TaskRepository.java
│   ├── NotificationRepository.java
│   └── ChatMessageRepository.java
├── service/                             # Business logic layer
│   ├── AuthService.java                 # Authentication service
│   ├── UserService.java                 # User management
│   ├── SkillService.java               # Skill management
│   ├── ProjectService.java             # Project operations
│   ├── TeamService.java                # Team management
│   ├── TaskService.java                # Task management
│   ├── NotificationService.java        # Notification handling
│   ├── ChatService.java                # Chat functionality
│   └── FileUploadService.java          # File handling
├── controller/                          # REST API endpoints
│   ├── AuthController.java             # Authentication endpoints
│   ├── UserController.java             # User management
│   ├── SkillController.java            # Skill management
│   ├── ProjectController.java          # Project operations
│   ├── TeamController.java             # Team management
│   ├── JoinRequestController.java      # Project join requests
│   ├── NotificationController.java     # Notification handling
│   ├── ChatController.java             # Chat operations
│   └── StaticDataController.java       # Static data endpoints
├── websocket/                           # Real-time communication
│   ├── WebSocketController.java         # WebSocket endpoint handler
│   ├── NotificationWebSocketHandler.java # Real-time notifications
│   └── ChatWebSocketHandler.java        # Real-time chat
├── oauth2/                              # OAuth2 Authentication
│   ├── CustomOAuth2UserService.java     # Custom OAuth2 service
│   ├── LinkedInOAuth2UserInfo.java      # LinkedIn integration
│   └── OAuth2AuthenticationSuccessHandler.java # OAuth2 success handler
├── exception/                           # Exception handling
│   ├── GlobalExceptionHandler.java      # Central exception handler
│   ├── ResourceNotFoundException.java    # 404 exceptions
│   ├── BadRequestException.java         # 400 exceptions
│   ├── UnauthorizedException.java       # 401 exceptions
│   └── ConflictException.java           # 409 exceptions
└── util/                                # Utility classes
```

## Key Components and Their Responsibilities

### Authentication & Security
- JWT-based authentication
- OAuth2 integration with LinkedIn
- Role-based access control
- Secure WebSocket connections

### Project Management
- Project creation and management
- Team formation and management
- Task tracking and assignment
- Skill-based project matching
- Join requests and invitations

### Real-time Features
- WebSocket implementation for live updates
- Real-time chat functionality
- Instant notifications
- Live status updates

### User Management
- User profiles and authentication
- Skill management and validation
- Portfolio management
- Connection handling

### Data Access
- JPA repositories for data persistence
- Optimized database queries
- Transaction management
- Data integrity constraints

## Technology Stack
- Java 11
- Spring Boot 2.7.18
- Spring Security with JWT
- Spring Data JPA
- WebSocket
- OAuth2
- MySQL Database
- Maven
- Swagger/OpenAPI for documentation
