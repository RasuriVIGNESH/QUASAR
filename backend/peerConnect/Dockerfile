#====================================================
#   AWS Lambda Container Image Support -> GaalVM Native Image
#====================================================

#FROM ghcr.io/graalvm/native-image-community:25 AS build
#
#WORKDIR /app
#
#RUN microdnf install -y maven && microdnf clean all
#
#COPY pom.xml .
#RUN mvn dependency:go-offline -B
#
#COPY src ./src
#RUN mvn -Pnative package -DskipTests
#
#FROM debian:bookworm-slim
#
## Lambda Web Adapter — lets a normal HTTP app run on Lambda unchanged
#COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter
#
#RUN useradd -ms /bin/bash springuser
#
#WORKDIR /app
#COPY --from=build /app/target/peer-connect .
#RUN chown -R springuser:springuser /app
#USER springuser
#
## Required by the adapter to know which port your app listens on
#ENV PORT=8080
#ENV AWS_LWA_PORT=8080
#
#EXPOSE 8080
#ENTRYPOINT ["./peer-connect"]

# =======================
#  GraalVM Native Image
# =======================
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
RUN useradd -ms /bin/bash springuser

WORKDIR /app
COPY --from=build /app/target/peer-connect .
RUN chown -R springuser:springuser /app
USER springuser
EXPOSE 8080
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