# 🔍 Diagnóstico de Autenticación

## ✅ Estado del Sistema

### Backend
- ✅ Backend corriendo en `http://localhost:3333`
- ✅ Endpoint `/api/v1/auth/login` responde correctamente

### Frontend
- ✅ Configuración de axios correcta
- ✅ Variables de entorno configuradas
- ✅ NextAuth configurado correctamente

## ❌ Problema Identificado

**Las credenciales que estás usando NO existen en la base de datos.**

### Prueba realizada
```powershell
# Credenciales probadas: admin@test.com / Admin123!
# Respuesta del backend:
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Credenciales inválidas",
  "timestamp": "2025-11-14T12:17:45.478Z"
}
```

## ✅ Soluciones

### Opción 1: Registrar un nuevo usuario (RECOMENDADO)

#### Desde Postman/Thunder Client:
```http
POST http://localhost:3333/api/v1/auth/register
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiPassword123!",
  "nombre": "Juan",
  "apellidos": "Pérez García"
}
```

#### Desde PowerShell:
```powershell
$body = @{
  email = 'usuario@ejemplo.com'
  password = 'MiPassword123!'
  nombre = 'Juan'
  apellidos = 'Pérez García'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3333/api/v1/auth/register' -Method POST -Body $body -ContentType 'application/json'
```

#### Desde el frontend:
1. Navega a http://localhost:3000/register
2. Completa el formulario con:
   - Email: `usuario@ejemplo.com`
   - Password: `MiPassword123!`
   - Nombre: `Juan`
   - Apellidos: `Pérez García`
3. Después de registrarte, ve a login y usa esas credenciales

### Opción 2: Verificar usuarios existentes en la base de datos

Necesitas acceder a tu base de datos y ver qué usuarios ya existen:

```sql
-- Para PostgreSQL
SELECT id, email, nombre, apellidos, rol 
FROM usuarios 
LIMIT 10;

-- Para MySQL
SELECT id, email, nombre, apellidos, rol 
FROM usuarios 
LIMIT 10;
```

### Opción 3: Usar seeder del backend

Si tu backend tiene un seeder o script de inicialización, ejecútalo:

```bash
cd ../listaCompra_backend  # o donde esté tu backend
npm run seed              # o el comando que tengas configurado
```

## 🔧 Logging Adicional

He agregado logs detallados en el código. Cuando intentes hacer login, verás en la consola:

```
🔵 [auth-service] Login attempt: { email, passwordLength, baseURL, endpoint }
🟢 [auth-service] Login response: { status, hasToken, tokenType, responseKeys }
✅ [auth-service] Login successful
```

O en caso de error:
```
🔴 [auth-service] Login error: { error, isAxiosError, response }
```

## 📝 Próximos Pasos

1. **Primero**: Registra un usuario nuevo desde el frontend en `/register`
2. **Segundo**: Intenta hacer login con esas credenciales
3. **Tercero**: Revisa los logs en la consola del navegador y la terminal de Next.js

## 🐛 Si sigue fallando

Si después de registrar un usuario nuevo sigue fallando, revisa:

1. **Base de datos**: ¿Está corriendo?
2. **Backend**: ¿Hay errores en los logs del backend?
3. **Network**: Abre DevTools → Network y ve la request/response completa
4. **CORS**: ¿El backend permite requests desde localhost:3000?

## 📞 Comandos de Diagnóstico

```powershell
# Verificar backend activo
Test-NetConnection -ComputerName localhost -Port 3333

# Probar registro directamente
$body = @{email='test@test.com';password='Test123!';nombre='Test';apellidos='User'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3333/api/v1/auth/register' -Method POST -Body $body -ContentType 'application/json'

# Probar login con usuario recién registrado
$body = @{email='test@test.com';password='Test123!'} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3333/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
```
