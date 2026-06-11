# PeerConnect

PeerConnect is a collaboration platform that helps professionals find teammates, create and manage projects, and collaborate in real time. This README documents the complete REST API and WebSocket features available to the frontend.

## 🚀 Key Features

### User Management & Authentication
- **User Registration & Login**: Email/password registration and JWT-based login
- **OAuth2 Integration**: GitHub OAuth2 for social login (LinkedIn helper available)
- **User Profiles**: Manage profile information (name, bio, branch, graduation year, availability status)
- **Profile Photo Upload**: Upload and manage profile pictures
- **Skill Management**: Add/update user skills with proficiency levels
- **Portfolio Links**: GitHub, LinkedIn, and personal portfolio URLs

### Project Collaboration
- **Project Creation & Management**: Create, update, and delete projects with categories
- **Project Discovery**: Public project listing and browsing
- **Project Invitations**: Invite users to projects with custom roles
- **Team Management**: Manage project members and their roles
- **Task Management**: Create and track tasks within projects
- **Project Recommendations**: Smart project recommendations based on skills
- **Join Requests**: Request to join projects

### Real-time Communication
- **WebSocket Chat**: Real-time project chat messaging
- **WebSocket Notifications**: Real-time push notifications for invitations and updates
- **Message History**: Persistent chat message storage

### Additional Features
- **Colleges Management**: Browse and manage college information
- **Events Management**: Browse, create, and register for events
- **Mentor System**: Mentor profiles and connections
- **Static Data**: Retrieve system categories and reference data

### Infrastructure
- Spring Boot 2.7.18 with Spring Security
- JWT-based token authentication
- WebSocket support for real-time features
- MySQL database with JPA/Hibernate
- SpringDoc OpenAPI (Swagger UI) for API documentation
- ModelMapper for DTO conversions

## 🛠 Technology Stack (from code)

- Java (project declares java.version=11 in pom, but maven-compiler-plugin in the POM targets source/target 16 — ensure your JDK matches your local build configuration)
- Spring Boot 2.7.18 (parent in `pom.xml`)
- Spring Security, OAuth2 Client
- Spring Data JPA (Hibernate)
- WebSocket (Spring)
- MySQL (runtime)
- JJWT (io.jsonwebtoken 0.11.5)
- SpringDoc OpenAPI (springdoc-openapi-ui 1.7.0)
- Maven (wrapper included: `mvnw` / `mvnw.cmd`)

## 📡 REST API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login (email/password) | No |
| GET | `/me` | Get current user profile | Yes |
| POST | `/logout` | Logout user | Yes |
| GET | `/github` | GitHub OAuth initiation | No |

**Example Request - Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user123",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer"
  }
}
```

### User Management (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/{userId}` | Get user profile by ID | No |
| PUT | `/profile` | Update current user profile | Yes |
| POST | `/profile-photo` | Upload profile photo | Yes |
| GET | `/{userId}/skills` | Get user skills | No |
| POST | `/skills` | Add skill to profile | Yes |
| PATCH | `/{userId}/skills/{skillId}` | Update user skill | Yes |
| GET | `/search` | Search users by name/skills | No |
| GET | `/recommendations` | Get user recommendations | Yes |

**Example Request - Update Profile:**
```bash
curl -X PUT http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Full-stack developer",
    "branch": "Computer Science",
    "graduationYear": 2024,
    "availabilityStatus": "AVAILABLE",
    "githubUrl": "https://github.com/johndoe",
    "linkedinUrl": "https://linkedin.com/in/johndoe"
  }'
```

**Example Request - Upload Profile Photo:**
```bash
curl -X POST http://localhost:8080/api/users/profile-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePhoto=@/path/to/photo.jpg"
```

### Projects (`/api/projects`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/` | Create new project | Yes |
| GET | `/{projectId}` | Get project by ID | No |
| PUT | `/{projectId}` | Update project | Yes (Lead only) |
| DELETE | `/{projectId}` | Delete project | Yes (Lead only) |
| GET | `/my-projects` | Get current user's projects | Yes |
| GET | `/search` | Search projects by name/tags | No |
| GET | `/category/{categoryId}` | Get projects by category | No |
| GET | `/recommendations` | Get recommended projects | Yes |
| POST | `/{projectId}/tasks` | Create task | Yes (Member) |
| GET | `/{projectId}/tasks` | Get project tasks | No |

**Example Request - Create Project:**
```bash
curl -X POST http://localhost:8080/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mobile App Project",
    "description": "Build a cross-platform mobile app",
    "categoryId": 1,
    "requiredSkills": ["React Native", "Node.js"],
    "maxTeamSize": 5
  }'
```

### Teams & Invitations (`/api/teams`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/{projectId}/invitations` | Invite user to project | Yes (Lead) |
| GET | `/{projectId}/invitations` | Get project invitations | Yes (Lead) |
| PATCH | `/{projectId}/invitations/{invitationId}/accept` | Accept invitation | Yes |
| PATCH | `/{projectId}/invitations/{invitationId}/reject` | Reject invitation | Yes |
| GET | `/{projectId}/members` | Get project members | No |
| DELETE | `/{projectId}/members/{userId}` | Remove member from project | Yes (Lead) |

**Example Request - Invite User:**
```bash
curl -X POST http://localhost:8080/api/teams/project123/invitations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user456",
    "role": "DEVELOPER",
    "message": "We need your React skills for this project"
  }'
```

### Chat (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/projects/{projectId}/messages` | Send message to project | Yes (Member) |
| GET | `/projects/{projectId}/messages` | Get project messages | Yes (Member) |
| GET | `/projects/{projectId}/messages/{messageId}` | Get specific message | Yes |
| DELETE | `/messages/{messageId}` | Delete message | Yes (Author only) |

**Example Request - Send Message:**
```bash
curl -X POST http://localhost:8080/api/chat/projects/project123/messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello team! Let us discuss the project plan"
  }'
```

### Colleges (`/api/colleges`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | Get all colleges (paginated) | No |
| GET | `/{id}` | Get college by ID | No |
| POST | `/` | Create college (Admin) | Yes (Admin) |
| PUT | `/{id}` | Update college | Yes (Admin) |
| DELETE | `/{id}` | Delete college | Yes (Admin) |

### Skills (`/api/skills`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | Get all available skills | No |
| GET | `/search` | Search skills by name | No |
| POST | `/` | Create skill (Admin) | Yes (Admin) |
| PUT | `/{id}` | Update skill | Yes (Admin) |
| DELETE | `/{id}` | Delete skill | Yes (Admin) |

### Project Categories (`/api/project-categories`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/` | List all project categories | No |
| GET | `/{id}` | Get category by ID | No |
| GET | `/search` | Search categories | No |
| POST | `/` | Create category (Admin) | Yes (Admin) |
| PUT | `/{id}` | Update category | Yes (Admin) |
| DELETE | `/{id}` | Delete category | Yes (Admin) |

### Events (`/api/events`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| GET | `/{eventId}` | Get event details | No |
| GET | `/upcoming` | Get upcoming events | No |
| POST | `/{eventId}/register` | Register for event | Yes (Student) |
| POST | `/` | Create event | Yes (Admin) |
| PUT | `/{eventId}` | Update event | Yes (Admin) |
| DELETE | `/{eventId}` | Delete event | Yes (Admin) |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|----------------|
| POST | `/mentors` | Create mentor | Yes (Admin) |
| GET | `/mentors` | List all mentors | Yes (Admin) |

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/RecentProjects` | Get recent projects (paginated) |
| GET | `/api/colleges` | Get colleges list |
| GET | `/api/discover/skills` | Discover popular skills |
| GET | `/api/discover/categories` | Discover project categories |

## 🔌 WebSocket Endpoints

Real-time communication is handled via WebSocket connections. The frontend should connect to the WebSocket endpoints at the base URL with the same protocol (ws:// for development, wss:// for production).

### WebSocket Endpoints
| Endpoint | Purpose | Authentication |
|----------|---------|-----------------|
| `/ws/notifications/{userId}` | User-specific real-time notifications | JWT Token in query param or header |
| `/ws/chat/{projectId}` | Project chat real-time messaging | JWT Token in query param or header |

**Example Connection (JavaScript):**
```javascript
// Connect to notifications
const notificationSocket = new WebSocket(
  `ws://localhost:8080/ws/notifications/user123?token=${jwtToken}`
);

notificationSocket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Notification:', message);
  // message.type = "NOTIFICATION"
  // message.data = { id, title, message, timestamp }
};

// Connect to chat
const chatSocket = new WebSocket(
  `ws://localhost:8080/ws/chat/project123?token=${jwtToken}`
);

chatSocket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Chat message:', message);
  // message.type = "CHAT_MESSAGE"
  // message.data = { id, projectId, senderId, senderName, message, timestamp }
};

// Send chat message
chatSocket.send(JSON.stringify({
  type: "CHAT_MESSAGE",
  data: {
    message: "Hello team!",
    projectId: "project123"
  }
}));
```

### WebSocket Message Types

**Notification Message:**
```json
{
  "type": "NOTIFICATION",
  "data": {
    "id": "notif-uuid",
    "title": "Project Invitation",
    "message": "You've been invited to 'Mobile App Project'",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Chat Message:**
```json
{
  "type": "CHAT_MESSAGE",
  "data": {
    "id": "msg-uuid",
    "projectId": "project123",
    "senderId": "user456",
    "senderName": "John Doe",
    "message": "Hello team! Let's start working",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Status Update:**
```json
{
  "type": "STATUS_UPDATE",
  "data": {
    "status": "Project milestone completed",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 📁 Important files & packages

- Main application: `src/main/java/com/ADP/peerConnect/QUASAR.java` (application entry point)
- Controllers: `src/main/java/com/ADP/peerConnect/controller/`
  - `AuthController.java` - Authentication endpoints
  - `UserController.java` - User profile and skill management
  - `project/ProjectController.java` - Project operations
  - `Student/TeamController.java` - Team and invitation management
  - `ChatController.java` - Chat messaging
  - `EventController.java` - Event management
  - `CollegeController.java` - College management
  - `SkillController.java` - Skill management
  - `AdminController.java` - Admin operations
  - `publicEndpoints.java` - Public discovery endpoints
- WebSocket: `src/main/java/com/ADP/peerConnect/websocket/`
  - `WebSocketController.java` - WebSocket endpoint handler
  - `NotificationWebSocketHandler.java` - Real-time notifications
  - `ChatWebSocketHandler.java` - Real-time chat
- Security & JWT: `src/main/java/com/ADP/peerConnect/security/`
  - `JwtTokenProvider.java` - JWT token generation/validation
  - `JwtAuthenticationFilter.java` - JWT authentication filter
  - `UserPrincipal.java` - Authenticated user details
  - `oauth2/` - OAuth2 integration (GitHub, LinkedIn)
- Models & DTOs: `src/main/java/com/ADP/peerConnect/model/`
  - `entity/` - Database entities
  - `dto/` - Request/response DTOs
- Services: `src/main/java/com/ADP/peerConnect/service/`
- Repositories: `src/main/java/com/ADP/peerConnect/repository/`
- Configuration: `src/main/java/com/ADP/peerConnect/config/`
  - `SecurityConfig.java` - Spring Security configuration
  - `CorsConfig.java` - CORS configuration
  - `JwtConfig.java` - JWT configuration
  - `SwaggerConfig.java` - Swagger/OpenAPI configuration
- Application configuration: `src/main/resources/application.properties`

## 🔐 Authentication & Authorization

### JWT Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

**JWT Token Structure:**
```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user-id", "email": "user@example.com", "roles": ["ROLE_USER"], "iat": ..., "exp": ... }
Signature: HMAC-SHA256(header.payload, secret)
```

**Token Expiration:**
- Default expiration: 24 hours (86400000 milliseconds)
- Configurable via `APP_JWT_EXPIRATION` environment variable

### OAuth2 Authentication
Users can authenticate using:
- **GitHub OAuth2**: Register at GitHub developer settings and set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
- **LinkedIn OAuth2**: Helper class available (`LinkedInOAuth2UserInfo`), requires LinkedIn OAuth credentials

**OAuth2 Flow:**
1. Frontend redirects to `/oauth2/authorization/github` or `/oauth2/authorization/linkedin`
2. User grants permission
3. Backend receives authorization code and exchanges for access token
4. Backend creates JWT token for frontend use
5. User is authenticated for API calls with JWT token

### Role-Based Access Control
The application supports the following roles:
- `ROLE_USER` - Registered user (default)
- `ROLE_STUDENT` - Student-specific features
- `ROLE_ADMIN` - Administrative access
- `ROLE_MENTOR` - Mentor profile

Endpoints use `@PreAuthorize` annotations to enforce role-based access:
```java
@PreAuthorize("hasRole('ADMIN')")  // Admin only
@PreAuthorize("hasRole('STUDENT')")  // Student only
// Public endpoints have no @PreAuthorize annotation
```

## ⚦ Configuration & Environment Variables

The application reads configuration from `src/main/resources/application.properties`, and many sensitive values are expected to be provided via environment variables for local or production runs.

### Required Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_URL` | Database connection URL | `jdbc:mysql://localhost:3306/peerconnect` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `APP_JWT_SECRET` | JWT signing secret (min 32 chars) | `your_very_secret_key_that_is_long_enough` |

### Optional Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `APP_JWT_EXPIRATION` | JWT token expiration in ms | `86400000` (24 hours) |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | (not set) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret | (not set) |
| `LINKEDIN_CLIENT_ID` | LinkedIn OAuth Client ID | (not set) |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn OAuth Client Secret | (not set) |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `http://localhost:5173` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size for uploads | `5MB` |
| `SERVER_PORT` | Application server port | `8080` |

### Example .env File (DO NOT COMMIT)
```
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/peerconnect
DB_USERNAME=root
DB_PASSWORD=your_secure_password

# JWT Configuration
APP_JWT_SECRET=your_very_long_secret_key_that_is_at_least_32_characters_long
APP_JWT_EXPIRATION=86400000

# OAuth2 Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Server Configuration
SERVER_PORT=8080
```

### How to Set Environment Variables (Windows PowerShell)
```powershell
# Set environment variables for current session
$env:DB_URL = "jdbc:mysql://localhost:3306/peerconnect"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "password"
$env:APP_JWT_SECRET = "your_very_long_secret_key_that_is_at_least_32_characters_long"

# Then run the application
.\mvnw.cmd spring-boot:run
```

### Using .env File with Maven
Create a `.env` file in the project root and use:
```powershell
# Load environment from .env file and run
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value)
    }
}

.\mvnw.cmd spring-boot:run
```

## OAuth2 setup notes (GitHub & LinkedIn)

- GitHub: register an OAuth App at https://github.com/settings/developers -> OAuth Apps. Set the Authorization callback URL to `http://localhost:8080/login/oauth2/code/github` (adjust base URL for your deployment) and provide the Client ID / Secret via environment variables.
- LinkedIn: the codebase contains a `LinkedInOAuth2UserInfo` helper and there are references in the design docs; LinkedIn OAuth setup varies by API and scopes — add Client ID/Secret and redirect URIs appropriate for your LinkedIn application.

## 🔧 Build & Run

### Prerequisites
- Java 11 or higher (project targets Java 16+ in maven-compiler-plugin)
- MySQL 5.7 or higher running locally or accessible
- Maven (included via wrapper: `mvnw` / `mvnw.cmd`)

### Local Development (Windows PowerShell)

1. **Set up environment variables:**
   ```powershell
   $env:DB_URL = "jdbc:mysql://localhost:3306/peerconnect"
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = "your_password"
   $env:APP_JWT_SECRET = "your_very_long_secret_key_min_32_chars"
   ```

2. **Build the project:**
   ```powershell
   .\mvnw.cmd clean package
   ```

3. **Run the application (Option A - Spring Boot Plugin):**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

4. **Or run the packaged JAR (Option B):**
   ```powershell
   java -jar target/peerConnect-0.0.1-SNAPSHOT.jar
   ```

5. **Verify the application is running:**
   ```powershell
   Invoke-WebRequest http://localhost:8080/swagger-ui.html
   ```

### Docker Support
A `Dockerfile` is included in the project root for containerized deployment:

```powershell
# Build Docker image
docker build -t peerconnect:latest .

# Run Docker container
docker run -p 8080:8080 `
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/peerconnect" `
  -e DB_USERNAME="root" `
  -e DB_PASSWORD="password" `
  -e APP_JWT_SECRET="your_secret_key" `
  peerconnect:latest
```

### Run Tests
```powershell
.\mvnw.cmd test
```

Unit and integration tests use Spring Boot's testing support and are located in:
- `src/test/java/com/ADP/peerConnect/`

### Application Startup Output
When the application starts successfully, you should see output similar to:
```
Started QUASAR in 3.2 seconds (JVM running for 3.8s)
```

### Default Application Properties
| Property | Value | Location |
|----------|-------|----------|
| Server Port | `8080` | `application.properties` |
| Database Type | MySQL | `application.properties` |
| JPA Auto-DDL | `update` | `application.properties` |
| JWT Expiration | `86400000` ms (24h) | `application.properties` or env var |
| CORS Max Age | `3600` seconds | Controllers |
| WebSocket Path | `/ws` | `Constants.java` |

### Troubleshooting Build Issues

**Issue: "Unsupported class version"**
- **Solution**: Ensure Java version matches (11+). Check with `java -version`

**Issue: "Access denied to database"**
- **Solution**: Verify MySQL is running and credentials are correct in environment variables

**Issue: "Port 8080 already in use"**
- **Solution**: Either kill the process using port 8080 or change `server.port` in `application.properties`

## 📚 API Documentation (Swagger / OpenAPI)

When running locally, OpenAPI and Swagger UI are automatically available:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/api-docs
- **OpenAPI YAML**: http://localhost:8080/api-docs.yaml

### Swagger UI Features
The Swagger UI interface allows you to:
- View all available endpoints organized by tags (Authentication, User Management, Project Management, etc.)
- Read endpoint descriptions and required parameters
- Test endpoints directly from the browser (with authentication support)
- View request/response schemas and examples
- Download the OpenAPI specification

### Testing Endpoints in Swagger UI
1. Navigate to http://localhost:8080/swagger-ui.html
2. Look for the "Authorize" button at the top-right
3. Click it and enter your JWT token in the format: `Bearer YOUR_JWT_TOKEN`
4. All subsequent requests will include the authorization header
5. Expand any endpoint and click "Try it out"
6. Fill in required parameters and click "Execute"

### Swagger Configuration
Swagger is configured in:
- `src/main/java/com/ADP/peerConnect/config/SwaggerConfig.java` - Swagger customization
- `src/main/resources/application.properties` - Swagger paths and settings

Configuration Properties:
```
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
```

### API Response Format
All endpoints return a consistent JSON response format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

### HTTP Status Codes
- `200 OK` - Successful GET, PUT, PATCH request
- `201 Created` - Successful POST request (resource created)
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid request parameters or validation failure
- `401 Unauthorized` - Missing or invalid JWT token
- `403 Forbidden` - Insufficient permissions/role-based access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists or conflict detected
- `500 Internal Server Error` - Server error

## 🧪 Tests

Run the test suite with the Maven wrapper:

```powershell
.\mvnw.cmd test
```

Or run specific test classes:
```powershell
.\mvnw.cmd test -Dtest=UserControllerTest
.\mvnw.cmd test -Dtest=ProjectControllerTest
```

### Test Structure
- Unit tests: `src/test/java/com/ADP/peerConnect/`
  - Service layer tests
  - Controller tests
  - Repository tests
- Integration tests: Test classes with `@SpringBootTest` annotation

Tests use:
- JUnit 5 (via Spring Boot Test starter)
- Mockito for mocking dependencies
- AssertJ for assertions
- Spring Boot Test utilities

## 🔒 Security & Secrets

### JWT Security
- The project uses JWTs (JJWT library 0.11.5) for API authentication
- Tokens are signed with `APP_JWT_SECRET` - keep this secret and strong (minimum 32 characters)
- Default token expiration: 24 hours (configurable)

### OAuth2 Security
- GitHub and LinkedIn OAuth2 integrations handle user authentication
- OAuth client secrets must be kept secure
- Redirect URIs must be configured correctly in OAuth provider settings

### CORS Security
- CORS is configured to allow specific origins (configurable via `CORS_ALLOWED_ORIGINS`)
- Default: `http://localhost:5173` (React frontend dev server)
- In production, set to your actual frontend domain

### Password Security
- Passwords are hashed using Spring Security's `PasswordEncoder` (BCrypt)
- Users cannot retrieve their original password
- Password reset functionality can be implemented if needed

### Best Practices
1. **Never commit secrets**: Use environment variables or secure vaults
2. **Use HTTPS in production**: All API calls should use TLS/SSL
3. **Secure WebSocket**: Use WSS (WebSocket Secure) in production
4. **Rotate tokens regularly**: Consider implementing token refresh mechanism
5. **Validate all inputs**: All endpoints validate request parameters

### If Secrets Are Accidentally Committed
If credentials or secrets were accidentally committed to the repository:
1. Remove secrets from repo history (BFG or git filter-branch)
2. Rotate the exposed credentials immediately
3. Add `.env` and sensitive config files to `.gitignore`
4. Force push to remote (if necessary and only on private repositories)

**Example .gitignore additions:**
```
.env
.env.local
*.properties.local
application-secrets.properties
```

## 📦 Deployment

### Production Build
```powershell
# Build the JAR file
.\mvnw.cmd clean package -DskipTests

# The packaged JAR will be at: target/peerConnect-0.0.1-SNAPSHOT.jar
```

### Deploy JAR to Server
```powershell
# Copy JAR to server
scp target/peerConnect-0.0.1-SNAPSHOT.jar user@server:/app/

# On server, set environment variables
export DB_URL="jdbc:mysql://db-server:3306/peerconnect"
export DB_USERNAME="dbuser"
export DB_PASSWORD="secure_password"
export APP_JWT_SECRET="your_production_secret_key_min_32_chars"
export CORS_ALLOWED_ORIGINS="https://yourdomain.com"

# Run the JAR
java -jar /app/peerConnect-0.0.1-SNAPSHOT.jar
```

### Deploy with Docker
```powershell
# Build image
docker build -t peerconnect:1.0 .

# Push to registry (if using)
docker push yourusername/peerconnect:1.0

# Run container
docker run -d \
  --name peerconnect \
  -p 8080:8080 \
  -e DB_URL="jdbc:mysql://mysql-server:3306/peerconnect" \
  -e DB_USERNAME="dbuser" \
  -e DB_PASSWORD="secure_password" \
  -e APP_JWT_SECRET="your_production_secret_key" \
  -e CORS_ALLOWED_ORIGINS="https://yourdomain.com" \
  yourusername/peerconnect:1.0
```

### Production Checklist
- [ ] Database is on a managed service (not local)
- [ ] Use a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
- [ ] Enable HTTPS/TLS for all connections
- [ ] Use WSS (WebSocket Secure) for WebSocket connections
- [ ] Set appropriate CORS_ALLOWED_ORIGINS for your domain
- [ ] Configure database backups
- [ ] Set up application monitoring and logging
- [ ] Use a reverse proxy (Nginx) or load balancer
- [ ] Enable connection pooling for database
- [ ] Set appropriate JVM heap memory settings

## 🤝 Contributing

We welcome contributions to PeerConnect! Here's how to get started:

1. **Fork the repository**
   ```powershell
   git clone https://github.com/your-username/QUASAR-backend.git
   cd QUASAR-backend
   ```

2. **Create a feature branch**
   ```powershell
   git checkout -b feature/YourFeatureName
   ```

3. **Make your changes**
   - Follow the existing code style and patterns
   - Add tests for new functionality
   - Update documentation as needed

4. **Commit your changes**
   ```powershell
   git add .
   git commit -m "feat: Add description of your feature"
   ```

5. **Push to your fork**
   ```powershell
   git push origin feature/YourFeatureName
   ```

6. **Open a Pull Request**
   - Provide a clear description of changes
   - Link to any related issues
   - Ensure all tests pass

### Code Style Guidelines
- Use meaningful variable and method names
- Add JavaDoc comments for public methods
- Follow Spring Boot conventions
- Keep methods focused and testable
- Use dependency injection via `@Autowired` or constructor injection

### Adding New Endpoints
1. Create a controller class in `src/main/java/com/ADP/peerConnect/controller/`
2. Add appropriate `@RestController` and `@RequestMapping` annotations
3. Use Swagger annotations (`@Operation`, `@ApiResponse`, `@Tag`)
4. Add service interface and implementation in `service/` packages
5. Create request/response DTOs in `model/dto/` packages
6. Add tests in `src/test/`

### Example New Controller
```java
@RestController
@RequestMapping("/api/newfeature")
@Tag(name = "New Feature", description = "New feature APIs")
public class NewFeatureController {
    
    @Autowired
    private iNewFeatureService featureService;
    
    @PostMapping
    @Operation(summary = "Create new feature item")
    public ResponseEntity<ApiResponse<NewFeatureResponse>> create(
            @Valid @RequestBody CreateNewFeatureRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        NewFeatureResponse response = featureService.create(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Created successfully", response));
    }
}
```

## 👥 Authors

- **Vignesh (Rasuri)** — https://github.com/RasuriVIGNESH
- **Raghukul** — https://github.com/Raghukul777

## 📄 License

This project is licensed under the ISC License — see your repository for details.

## 🧰 Developer Notes / Quick Reference

### Where to Find Common Components

**Controllers**
- Path: `src/main/java/com/ADP/peerConnect/controller/`
- Key files: `AuthController.java`, `UserController.java`, `project/ProjectController.java`, `ChatController.java`

**Services**
- Path: `src/main/java/com/ADP/peerConnect/service/`
- Interface: `Interface/` subfolder
- Implementation: `Impl/` subfolder

**Database Entities**
- Path: `src/main/java/com/ADP/peerConnect/model/entity/`
- Include: `User.java`, `Project.java`, `ChatMessage.java`, `ProjectInvitation.java`

**Data Transfer Objects (DTOs)**
- Path: `src/main/java/com/ADP/peerConnect/model/dto/`
- Request DTOs: `request/` subfolder
- Response DTOs: `response/` subfolder

**JPA Repositories**
- Path: `src/main/java/com/ADP/peerConnect/repository/`
- Naming: `*Repository` interface extending `JpaRepository<Entity, ID>`

**Security & JWT**
- Path: `src/main/java/com/ADP/peerConnect/security/`
- JWT Provider: `JwtTokenProvider.java`
- JWT Filter: `JwtAuthenticationFilter.java`
- User Principal: `UserPrincipal.java`
- OAuth2: `oauth2/` subfolder

**Configuration**
- Path: `src/main/java/com/ADP/peerConnect/config/`
- Security Config: `SecurityConfig.java`
- CORS Config: `CorsConfig.java`
- JWT Config: `JwtConfig.java`
- Swagger Config: `SwaggerConfig.java`

**WebSocket**
- Path: `src/main/java/com/ADP/peerConnect/websocket/`
- Controller: `WebSocketController.java`
- Chat Handler: `ChatWebSocketHandler.java`
- Notification Handler: `NotificationWebSocketHandler.java`

**Exceptions**
- Path: `src/main/java/com/ADP/peerConnect/exception/`
- Global Handler: `GlobalExceptionHandler.java`
- Custom Exceptions: `ResourceNotFoundException.java`, `BadRequestException.java`

**Utilities**
- Path: `src/main/java/com/ADP/peerConnect/util/`
- Constants: `Constants.java` (base paths, default values)
- Helper classes for common operations

**Configuration Files**
- Application Props: `src/main/resources/application.properties`
- SQL Scripts: `src/main/resources/` (if present)

### Common Development Tasks

**Add a new REST endpoint:**
1. Create controller method with `@PostMapping`, `@GetMapping`, etc.
2. Add Swagger annotations
3. Create request/response DTOs if needed
4. Implement service method
5. Add unit tests

**Add authentication to endpoint:**
```java
@AuthenticationPrincipal UserPrincipal currentUser
```

**Add role-based access control:**
```java
@PreAuthorize("hasRole('ADMIN')")  // or STUDENT, USER, MENTOR
```

**Access current user in service:**
```java
String userId = currentUser.getId();
String email = currentUser.getEmail();
```

**Send WebSocket message:**
- Use message template from configuration
- Send to destination: `/ws/notifications/{userId}` or `/ws/chat/{projectId}`

**Working with Pagination:**
```java
// Request parameters
@RequestParam(defaultValue = "0") int page
@RequestParam(defaultValue = "20") int size
@RequestParam(defaultValue = "createdAt") String sortBy
@RequestParam(defaultValue = "DESC") String sortDir

// Create pageable
Pageable pageable = PageRequest.of(page, size, Sort.Direction.fromString(sortDir), sortBy);

// Return paged response
Page<Entity> result = repository.findAll(pageable);
```

### Useful Maven Commands

```powershell
# Clean build
.\mvnw.cmd clean install

# Run application
.\mvnw.cmd spring-boot:run

# Run tests
.\mvnw.cmd test

# Run specific test
.\mvnw.cmd test -Dtest=ControllerName

# Check dependencies
.\mvnw.cmd dependency:tree

# Format code (if checkstyle configured)
.\mvnw.cmd clean format:format

# Skip tests during build
.\mvnw.cmd package -DskipTests
```

### Debugging Tips

**Enable debug logging:**
```properties
# In application.properties
logging.level.com.ADP.peerConnect=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG
```

**JWT Token validation:**
- Check expiration with `JwtTokenProvider.getJwtTokenFromRequest()`
- Validate signature in filter
- Check user ID in token: `JwtTokenProvider.getUserIdFromJWT()`

**WebSocket debugging:**
- Check connection endpoint in browser console
- Verify WebSocket handshake in Network tab
- Monitor message queue if messages not received

**Database issues:**
- Check `spring.jpa.show-sql=true` in properties
- Use MySQL client to verify data: `mysql -u root -p peerconnect`
- Check for constraint violations in error logs

---

## 📋 Quick Start Checklist

- [ ] Clone/fork the repository
- [ ] Set up environment variables (.env file)
- [ ] Ensure MySQL is running locally
- [ ] Run `.\mvnw.cmd clean package`
- [ ] Run `.\mvnw.cmd spring-boot:run`
- [ ] Verify at http://localhost:8080/swagger-ui.html
- [ ] Check WebSocket endpoints
- [ ] Register a test user and obtain JWT token
- [ ] Test a protected endpoint with JWT token

---

**Need Help?** Check out:
- GitHub Issues: https://github.com/RasuriVIGNESH/QUASAR-backend/issues
- Spring Boot Documentation: https://spring.io/projects/spring-boot
- WebSocket Guide: https://spring.io/guides/gs/messaging-stomp-websocket/
- JWT Best Practices: https://tools.ietf.org/html/rfc7519
