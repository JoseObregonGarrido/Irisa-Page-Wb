# Guía de Desarrollo Local - Backend IRISA

## Inicio rápido

### 1. Ejecutar el backend en modo desarrollo

```bash
cd irisa_2/irisa/authentication_irisa/irisa-authentication
mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

O si tienes Maven instalado globalmente:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

El servidor estará disponible en: `http://localhost:8080`

### 2. Credenciales por defecto (desarrollo)

**Usuario:** `admin`  
**Contraseña:** `admin123`

### 3. Endpoint de login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Respuesta esperada:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Usar el token en el frontend

- Copia el `token` de la respuesta
- En el formulario de login del frontend (`http://localhost:5173`), ingresa:
  - **Usuario:** `admin`
  - **Contraseña:** `admin123`
- El frontend almacenará el token en `localStorage` automáticamente

### 5. Consola H2 (opcional)

Puedes acceder a la base de datos en memoria en: `http://localhost:8080/h2-console`

**Credenciales H2:**
- Driver: `org.h2.Driver`
- URL: `jdbc:h2:mem:irisa_db`
- Usuario: `sa`
- Contraseña: (dejar en blanco)

## Estructura de credenciales

Las credenciales se inicializan automáticamente en el arranque gracias a `DataInitializer.java`. Si necesitas agregar más usuarios:

1. Accede a la consola H2
2. Ejecuta SQL de inserción (las contraseñas deben estar codificadas con BCrypt)
3. O modifica `DataInitializer.java` para crear más usuarios por defecto

## Troubleshooting

**Error de puerto 8080 en uso:**
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

**CORS bloqueado en frontend:**
- Verifica que el frontend esté corriendo en `http://localhost:5173`
- Actualiza `cors.allowed.origins` en `application-dev.properties` si es necesario

## Flujo de autenticación

1. Frontend envía credenciales a `/auth/login`
2. Backend valida contra la base de datos H2
3. Backend genera JWT y lo retorna
4. Frontend almacena JWT en `localStorage`
5. Frontend incluye JWT en header `Authorization: Bearer <token>` para peticiones protegidas

## Notas de configuración

- Se ha creado `application-dev.properties` con configuración para usar H2 en memoria.
- Las credenciales de prueba son `admin`/`admin123`.
- CORS está habilitado para el frontend en `localhost:5173`.
- Para más detalles, consulta el archivo `README_DEV.md`.
