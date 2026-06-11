# ===========================================================================
# MODE 1 — GraalVM Native Image (ACTIVE)
# Build : docker build -t peer-connect .
# Result: ~80–150 MB image, ~100ms startup
# ===========================================================================

# ===============================
# Build Stage — Native
# ===============================
FROM ghcr.io/graalvm/native-image-community:25 AS build

WORKDIR /app

# Install Maven
RUN microdnf install -y maven && microdnf clean all

# Cache dependencies first (layer cache — only re-runs if pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build native binary
COPY src ./src
RUN mvn -Pnative package -DskipTests

FROM debian:bookworm-slim

# Create non-root user (SECURITY BEST PRACTICE)
RUN useradd -ms /bin/bash springuser

WORKDIR /app

# Copy native binary
COPY --from=build /app/target/peer-connect .

# Change ownership
RUN chown -R springuser:springuser /app

# Switch to non-root user
USER springuser

EXPOSE 8080

# Native binary runs directly — no JVM flags needed
ENTRYPOINT ["./peer-connect"]


# ===========================================================================
# MODE 2 — Normal JVM JAR (COMMENTED)
# To switch: comment out MODE 1 above, uncomment everything below
# Build : docker build -t peer-connect .
# Result: ~300–500 MB image, 3–8s startup
# ===========================================================================

#FROM maven:3.9.9-eclipse-temurin-21 AS build
#WORKDIR /app
## Cache dependencies
#COPY pom.xml .
#RUN mvn dependency:go-offline -B
#
## Copy source and build
#COPY src ./src
#RUN mvn clean package -DskipTests
#FROM eclipse-temurin:21-jre-jammy
#RUN useradd -ms /bin/bash springuser
#
#WORKDIR /app
#
## Copy jar
#COPY --from=build /app/target/peerConnect-0.0.1-SNAPSHOT.jar app.jar
#
## Change ownership
#RUN chown -R springuser:springuser /app
#
## Switch to non-root user
#USER springuser
#
## Expose port
#EXPOSE 8080
#
## JVM tuning for containers
#ENTRYPOINT ["java", \
#"-XX:+UseContainerSupport", \
#"-XX:MaxRAMPercentage=75.0", \
#"-XX:+UseG1GC", \
#"-jar", "app.jar"]