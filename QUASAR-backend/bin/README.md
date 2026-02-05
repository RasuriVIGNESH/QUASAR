# PeerConnect

PeerConnect is a robust collaboration platform designed to connect professionals and facilitate project-based teamwork. It enables users to create projects, find team members based on skills, and collaborate effectively using real-time communication features.

## 🚀 Features

- **User Management**
  - LinkedIn OAuth2 Integration
  - Skill-based Profile Management
  - Portfolio Showcasing

- **Project Collaboration**
  - Project Creation and Management
  - Skill-based Team Formation
  - Task Assignment and Tracking
  - Join Requests and Invitations System

- **Real-time Communication**
  - Instant Chat Messaging
  - Real-time Notifications
  - Project Updates
  - Team Collaboration Tools

- **Security**
  - JWT Authentication
  - Role-based Access Control
  - Secure WebSocket Connections

## 🛠️ Technology Stack

- **Backend**
  - Java 11
  - Spring Boot 2.7.18
  - Spring Security
  - Spring Data JPA
  - WebSocket
  - OAuth2

- **Database**
  - MySQL

- **Documentation**
  - Swagger/OpenAPI

- **Build Tool**
  - Maven

## 🏗️ Architecture

The application follows a layered architecture pattern with clear separation of concerns. For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md).

## 🚦 Prerequisites

- JDK 11 or later
- Maven 3.6+
- MySQL 8.0+
- Git

## ⚙️ Configuration

1. Clone the repository:
```bash
git clone https://github.com/yourusername/peerConnect.git
cd peerConnect
```

2. Configure MySQL database in `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/peerconnect
spring.datasource.username=your_username
spring.datasource.password=your_password
```

3. Configure LinkedIn OAuth2 (optional):
```properties
spring.security.oauth2.client.registration.linkedin.client-id=your_client_id
spring.security.oauth2.client.registration.linkedin.client-secret=your_client_secret
```

## 🚀 Running the Application

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The application will be available at `http://localhost:8080`

## 📚 API Documentation

Once the application is running, access the API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 🔒 Security

- JWT-based authentication
- OAuth2 integration with LinkedIn
- Role-based access control
- Secure WebSocket connections

## 🧪 Testing

Run the tests using:
```bash
mvn test
```

## 📦 Deployment

The application can be deployed using:
```bash
java -jar target/peerConnect-0.0.1-SNAPSHOT.jar
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGitHubUsername](https://github.com/YourGitHubUsername)

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- The open-source community for various libraries used in this project
