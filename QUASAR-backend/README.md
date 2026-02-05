# PeerConnect

PeerConnect is a collaboration platform that helps professionals find teammates, create and manage projects, and collaborate in real time. This README has been updated to reflect the project's current implementation as found in source: Spring Boot application with OAuth2 (GitHub and LinkedIn helpers), JWT authentication, WebSocket support, JPA/MySQL persistence, and SpringDoc (Swagger) API documentation.

## 🚀 Key Features

- Authentication & Authorization
  - OAuth2 client integrations (GitHub + LinkedIn helper present in codebase)
  - JWT-based authentication (jjwt 0.11.5)
  - Role-based access control
- User & Profile
  - Skill-based profiles and portfolio fields
  - Profile picture support and basic profile population helpers
- Project Collaboration
  - Project creation and management
  - Skill-based discovery and join/request flows
  - Task assignment stubs
- Real-time Communication
  - WebSocket support for real-time chat and notifications
- Infrastructure & Tooling
  - Spring Boot application (parent 2.7.18)
  - Spring Security, Spring Data JPA, Spring Web, WebSocket
  - MySQL-compatible datasource
  - SpringDoc OpenAPI (Swagger UI)
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

## 📁 Important files & packages

- Main application: `src/main/java/com/ADP/peerConnect/PeerConnectApplication.java`
- Security and JWT utilities: `src/main/java/com/ADP/peerConnect/security/`
- OAuth helpers / providers: `src/main/java/com/ADP/peerConnect/security/oauth2/` (includes a `LinkedInOAuth2UserInfo` helper)
- Configuration classes: `src/main/java/com/ADP/peerConnect/config/`
- WebSocket code: `src/main/java/com/ADP/peerConnect/websocket/`
- JPA repositories: `src/main/java/com/ADP/peerConnect/repository/`
- Application configuration: `src/main/resources/application.properties`

## ⚦ Configuration & Environment Variables

The application reads configuration from `src/main/resources/application.properties`, and many sensitive values are expected to be provided via environment variables for local or production runs. The code references the following environment variables (examples below):

- DB_URL (e.g. `jdbc:mysql://localhost:3306/peerconnect`)
- DB_USERNAME
- DB_PASSWORD
- APP_JWT_SECRET (secret used to sign/verify JWTs)
- APP_JWT_EXPIRATION (milliseconds; default in properties: 86400000)
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- CORS_ALLOWED_ORIGINS (comma-separated list)
- UPLOAD_DIR, MAX_FILE_SIZE (optional file upload settings)

Example `application.properties` snippets (placeholders only — do NOT commit real secrets):

```
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

app.jwt.secret=${APP_JWT_SECRET}
app.jwt.expiration=${APP_JWT_EXPIRATION:86400000}

spring.security.oauth2.client.registration.github.client-id=${GITHUB_CLIENT_ID}
spring.security.oauth2.client.registration.github.client-secret=${GITHUB_CLIENT_SECRET}
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS}
```

## OAuth2 setup notes (GitHub & LinkedIn)

- GitHub: register an OAuth App at https://github.com/settings/developers -> OAuth Apps. Set the Authorization callback URL to `http://localhost:8080/login/oauth2/code/github` (adjust base URL for your deployment) and provide the Client ID / Secret via environment variables.
- LinkedIn: the codebase contains a `LinkedInOAuth2UserInfo` helper and there are references in the design docs; LinkedIn OAuth setup varies by API and scopes — add Client ID/Secret and redirect URIs appropriate for your LinkedIn application.

## 🔧 Build & Run (Windows PowerShell)

1. Build the project using the included Maven wrapper:

   ```
   .\mvnw.cmd clean package
   ```

2. Run the application (option A: Spring Boot plugin):

   ```
   .\mvnw.cmd spring-boot:run
   ```

3. Or run the packaged jar (option B):

   ```
   java -jar target/peerConnect-0.0.1-SNAPSHOT.jar
   ```

The application starts on port 8080 by default (see `server.port` in `application.properties`).

## 📚 API Documentation (Swagger / OpenAPI)

When running locally the OpenAPI and Swagger UI are available at the configured paths from `application.properties`:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

These paths are set by `springdoc.api-docs.path` and `springdoc.swagger-ui.path` in `application.properties`.

## 🧪 Tests

Run the test suite with the Maven wrapper:

```
.\mvnw.cmd test
```

Unit and integration tests (where present) use Spring Boot's testing support.

## 🔒 Security & Secrets

- The project uses JWTs for API authentication and contains JWT utilities and filters. Ensure `APP_JWT_SECRET` is set and kept secret.
- OAuth client IDs/secrets (GitHub/LinkedIn) should be provided via environment variables or a secrets manager.
- The codebase contains a helper for LinkedIn and references to OAuth integrations. If any credentials or secret files were accidentally committed to the repository, remove them from history and rotate the credentials.

Recommended actions if you find secrets committed:
- Remove secrets from repo history (BFG or git filter-branch)
- Rotate the exposed credentials immediately
- Add `.env` / local-only config files to `.gitignore`

## 📦 Deployment

Build and deploy the packaged jar, providing required environment variables in your deployment environment. Example:

```
.\mvnw.cmd clean package; java -jar target/peerConnect-0.0.1-SNAPSHOT.jar
```

In production, use a managed database and a secure secrets store.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit and push your changes
4. Open a Pull Request

Please follow the existing code style and add tests for new functionality.

## 👥 Authors

- Vignesh — https://github.com/RasuriVIGNESH
- Raghukul — https://github.com/Raghukul777

## 🧰 Developer notes / where to look in source

- Security & JWT utilities: `src/main/java/com/ADP/peerConnect/security/`
- OAuth helpers & configuration: `src/main/java/com/ADP/peerConnect/security/oauth2/` and `src/main/java/com/ADP/peerConnect/config/`
- WebSocket: `src/main/java/com/ADP/peerConnect/websocket/`
- Application properties: `src/main/resources/application.properties`

---

If you'd like, I can also:
- Add a minimal CONTRIBUTING.md or LICENSE file
- Fix the POM inconsistency (declared Java 11 vs compiler target 16)
- Add a small sample .env.example with required environment variable names
