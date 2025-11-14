# 🔑 Credenciales de Prueba

## Usuario Registrado ✅

Usa estas credenciales para hacer login en la aplicación:

```
Email: usuario@ejemplo.com
Password: MiPassword123!
```

## Cómo Usar

1. Abre el navegador en: http://localhost:3000/login
2. Ingresa las credenciales de arriba
3. Haz clic en "Iniciar Sesión"

## Registrar Nuevos Usuarios

Puedes registrar más usuarios en: http://localhost:3000/register

**Requisitos de validación del backend:**
- Email: formato válido
- Password: mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos
- Nombre: entre 2 y 50 caracteres, solo letras
- Apellidos: entre 2 y 50 caracteres, solo letras y espacios (sin acentos)

**Ejemplos válidos:**
```
Nombre: Juan
Apellidos: Perez Garcia (✅ sin acento)
Apellidos: Pérez García (❌ con acento - no permitido)

Password válido: MiPassword123!
Password válido: Admin2024!
Password válido: Test123$
```

## Cambios Realizados

### 1. Estructura de la API
El backend devuelve:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "nombre": "...",
      "apellidos": "...",
      "nombreCompleto": "...",
      "rol": "USUARIO",
      "activo": true,
      "emailVerificado": false
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  },
  "message": "Autenticación exitosa",
  "timestamp": "..."
}
```

### 2. Frontend Actualizado
- ✅ Tipos TypeScript actualizados para manejar la estructura de la API
- ✅ Servicio de autenticación adaptado a `data.tokens.accessToken`
- ✅ NextAuth configurado para extraer datos del usuario de la respuesta
- ✅ Logging detallado para debugging

### 3. Logs de Debug
Revisa la consola del navegador y la terminal de Next.js para ver:
- 🔵 Login attempt (intento de login)
- 🟢 Login response (respuesta exitosa)
- ✅ Login successful
- 🔴 Login error (si hay errores)
