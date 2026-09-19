FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /app/target/concessionaria-api.jar app.jar
RUN mkdir -p /app/uploads && chown -R spring:spring /app
USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
