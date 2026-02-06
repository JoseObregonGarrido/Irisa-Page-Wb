# Etapa 1: Compilación con Maven y Java 21
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw package -DskipTests

# Etapa 2: Ejecución con JRE 21
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
RUN addgroup --system spring && adduser --system --ingroup spring springuser
USER springuser

COPY --from=build /app/target/irisa-authentication-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
