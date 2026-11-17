# syntax=docker/dockerfile:1.7

FROM ghcr.io/graalvm/native-image-community:25 AS build

WORKDIR /app

RUN microdnf install -y maven && microdnf clean all

# Cache Maven dependencies before copying source.
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -ntp dependency:go-offline

# Build the GraalVM native executable.
COPY src ./src

RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -ntp -Pnative package -DskipTests

FROM debian:bookworm-slim AS runtime

RUN useradd \
    --system \
    --create-home \
    --uid 10001 \
    springuser

WORKDIR /app

COPY --from=build /app/target/peer-connect /app/peer-connect

RUN chown -R springuser:springuser /app

USER springuser

EXPOSE 8080

ENTRYPOINT ["/app/peer-connect"]
