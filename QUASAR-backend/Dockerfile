# ===============================
# Build Stage
# ===============================
FROM maven:3.9.9-eclipse-temurin-23 AS build

WORKDIR /app

# Copy pom.xml first (dependency caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build Spring Boot jar
RUN mvn clean package -DskipTests


# ===============================
# Runtime Stage
# ===============================
FROM eclipse-temurin:23-jre

WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/peerConnect-0.0.1-SNAPSHOT.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# JVM optimized for containers
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-jar", "app.jar"]
