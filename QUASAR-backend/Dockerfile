# ===============================
# Build Stage
# ===============================
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests


# ===============================
# Runtime Stage
# ===============================
FROM eclipse-temurin:21-jre-jammy

# Create non-root user (SECURITY BEST PRACTICE)
RUN useradd -ms /bin/bash springuser

WORKDIR /app

# Copy jar
COPY --from=build /app/target/QUASAR-backend-0.0.1-SNAPSHOT.jar app.jar

# Change ownership
RUN chown -R springuser:springuser /app

# Switch to non-root user
USER springuser

# Expose port
EXPOSE 8080

# JVM tuning for containers
ENTRYPOINT ["java", \
"-XX:+UseContainerSupport", \
"-XX:MaxRAMPercentage=75.0", \
"-XX:+UseG1GC", \
"-jar", "app.jar"]