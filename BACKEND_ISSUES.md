# 🐛 Problemas Conocidos del Backend

Este documento registra bugs y limitaciones del backend que afectan al frontend.

---

## 🚨 CRÍTICO: Colaboradores no pueden ver productos de listas compartidas

**Fecha**: 17 de noviembre de 2025  
**Estado**: 🔴 BLOQUEANTE  
**Endpoint**: `GET /api/v1/lists/:listId/products`  
**Código de error**: 404 Not Found

### Descripción del Problema
Cuando un usuario es invitado a una lista como colaborador (con permisos de lectura o lectura-escritura), **NO puede obtener los productos de esa lista**. El backend devuelve un 404 porque está validando si eres el **propietario** de la lista en lugar de validar si tienes **permisos de acceso** como colaborador.

### Ejemplo de Error
```bash
# Usuario A crea lista y la comparte con Usuario B
POST /invitations/1e9c1222-9d45-4765-979d-622abef8a915/share

# Usuario B intenta ver productos de la lista compartida
GET /lists/1e9c1222-9d45-4765-979d-622abef8a915/products?page=1&limit=200
# ❌ Respuesta: 404 Not Found
```

### Comportamiento Esperado (según documentación)
Según **casos-uso-completos.md (CU-16)**:
> "Se proporciona acceso a la lista según permisos asignados"  
> "Se devuelve la lista completa con productos según permisos"

El endpoint **DEBERÍA**:
1. Validar el JWT del usuario autenticado ✅
2. Verificar si tiene permisos sobre la lista (propietario O colaborador) ❌
3. Si tiene permisos de lectura → devolver productos ❌
4. Si tiene permisos de escritura → permitir modificar productos ❌

### Comportamiento Actual (bug)
El endpoint **ACTUALMENTE**:
1. Valida el JWT del usuario autenticado ✅
2. Verifica solo si es el propietario de la lista ❌
3. Si no es propietario → devuelve 404 ❌
4. Ignora completamente la tabla de permisos/colaboradores ❌

### Impacto
- **Severidad**: 🔴 Crítico
- **Funcionalidad bloqueada**: Toda la colaboración en listas
- **Casos de uso afectados**: CU-16, CU-17
- **Usuarios afectados**: Todos los colaboradores invitados

### Endpoints Afectados (probablemente)
```
❌ GET    /lists/:listId/products
❌ POST   /lists/:listId/products
❌ PUT    /lists/:listId/products/:productId
❌ PATCH  /lists/:listId/products/:productId/purchase
❌ DELETE /lists/:listId/products/:productId
```

### Solución Requerida en Backend

**Archivo backend**: `src/modules/products/products.controller.ts` (probablemente)

**Cambio necesario**:
```typescript
// ❌ MAL - Solo valida propietario
@UseGuards(JwtAuthGuard, ListOwnerGuard)
@Get(':listId/products')
async getProducts() { ... }

// ✅ BIEN - Valida propietario O colaborador con permisos
@UseGuards(JwtAuthGuard, ListAccessGuard) // Nuevo guard
@Get(':listId/products')
async getProducts() { ... }
```

**Nuevo Guard sugerido**:
```typescript
// list-access.guard.ts
@Injectable()
export class ListAccessGuard implements CanActivate {
  async canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const listId = request.params.listId;
    
    // 1. Verificar si es propietario
    const list = await this.listRepository.findOne({ 
      where: { id: listId, propietarioId: user.id } 
    });
    if (list) return true;
    
    // 2. Verificar si es colaborador con permisos activos
    const permission = await this.permissionRepository.findOne({
      where: { 
        listaId: listId, 
        usuarioId: user.id,
        activo: true 
      }
    });
    if (permission) {
      // Guardar tipo de permiso en request para validaciones posteriores
      request.userPermission = permission.tipoPermiso; // 'LECTURA' | 'ESCRITURA'
      return true;
    }
    
    return false; // Sin acceso
  }
}
```

### Workaround Temporal (Frontend)
**NO HAY WORKAROUND POSIBLE**. Este es un bug crítico del backend que debe ser corregido ahí.

Mientras tanto, el frontend:
1. ✅ Muestra correctamente la página de invitación
2. ✅ Permite al usuario "acceder" a la lista
3. ✅ Redirige a `/lists/:listId`
4. ❌ **FALLA al cargar productos** → Muestra estado de error

### Testing Sugerido (Backend)
```bash
# 1. Usuario A crea lista
POST /lists
{ "nombre": "Lista Test", "tiendaId": "..." }
# Guarda: listId

# 2. Usuario A agrega productos
POST /lists/:listId/products
{ "nombre": "Manzanas", "cantidad": 2 }

# 3. Usuario A comparte con Usuario B (lectura)
POST /invitations/:listId/share
{ "email": "usuarioB@test.com", "permiso": "LECTURA" }
# Guarda: hash

# 4. Usuario B accede con hash (autenticado como B)
GET /invitations/:hash/access
# ✅ Debe devolver info de lista

# 5. Usuario B intenta ver productos (autenticado como B)
GET /lists/:listId/products
# ✅ DEBE devolver productos (actualmente falla con 404)

# 6. Usuario B intenta agregar producto (autenticado como B, solo lectura)
POST /lists/:listId/products
# ❌ DEBE devolver 403 Forbidden (sin permisos de escritura)

# 7. Usuario A cambia permisos de B a escritura
PUT /invitations/:listId/permissions/:usuarioB
{ "nuevoTipoPermiso": "ESCRITURA" }

# 8. Usuario B intenta agregar producto (autenticado como B, ahora con escritura)
POST /lists/:listId/products
# ✅ DEBE permitir crear producto
```

### Referencias
- API_Testing_Guide.md - Endpoints documentados
- casos-uso-completos.md - CU-16: Acceder a Lista Compartida
- casos-uso-completos.md - CU-17: Gestionar Permisos

### Siguiente Paso
🔴 **NOTIFICAR AL EQUIPO BACKEND INMEDIATAMENTE**

Este bug bloquea completamente la funcionalidad de colaboración, que es una feature core de la aplicación.

---

## 📝 Otros Issues Conocidos

### 2. Endpoint `/accept` no existe (RESUELTO)
**Estado**: ✅ Resuelto en frontend  
**Commit**: f1a0d68

El endpoint `POST /invitations/:id/accept` no existía. Se corrigió eliminando esa lógica del frontend y usando el flujo correcto: acceder directamente a la lista después de validar el hash.

---

**Última actualización**: 17 de noviembre de 2025
