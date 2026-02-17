FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
WORKDIR /app/apps/api
RUN ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/apps/api/build/libs/api-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
