# Etapa 1: Build
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Etapa 2: Runtime (Aquí es donde bajamos el peso)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Creamos un usuario sin privilegios por seguridad
RUN addgroup -S spring && adduser -S springuser -G spring
USER springuser

# Copiamos solo el JAR de la etapa anterior
COPY --from=build /app/target/irisa-authentication-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]