# Stage 1: Build the application
FROM maven:3.9.6-eclipse-temurin-23-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimalist JRE image to run the application
FROM eclipse-temurin:23-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
# Create default directory for xray uploads
RUN mkdir -p uploads/xrays
ENTRYPOINT ["java", "-jar", "app.jar"]
