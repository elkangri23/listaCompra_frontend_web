# 📊 Auditoría de Endpoints - Frontend vs Backend API

**Fecha:** 10 de noviembre de 2025  
**Estado:** 32 de 57 endpoints implementados (56%)

---

## 📋 Resumen Ejecutivo

El frontend tiene **funcionalidad PARCIAL (56%)**. Las funcionalidades core (auth, listas, productos, colaboradores) están al 100%, pero faltan implementar módulos completos como Tiendas, Blueprints, y funcionalidades avanzadas de IA.

### Distribución por Estado

| Estado | Cantidad | Porcentaje |
|--------|----------|------------|
| ✅ Implementados | 32 | 56% |
| ⚠️ Parcialmente | 8 | 14% |
| ❌ Faltantes | 25 | 44% |
| **TOTAL** | **57** | **100%** |

---

## ✅ IMPLEMENTADOS COMPLETAMENTE (32/57 endpoints)

### 1. **Autenticación** (5/5) - 100% ✅

| Método | Endpoint | Servicio/Función | Hook |
|--------|----------|------------------|------|
| POST | `/auth/register` | `auth-service.ts: registerUser()` | `useRegister()` |
| POST | `/auth/login` | `auth-service.ts: login()` | `useLogin()` |
| POST | `/auth/refresh` | `auth-service.ts: refreshAccessToken()` | N/A |
| GET | `/auth/me` | `auth-service.ts: getCurrentUser()` | `useProfile()` |
| PUT | `/auth/profile` | `auth-service.ts: updateProfile()` | `useUpdateProfile()` |
| PUT | `/auth/password` | `auth-service.ts: changePassword()` | `useChangePassword()` |

**Archivos:**
- `src/features/auth/services/auth-service.ts`
- `src/features/auth/hooks/use-profile.ts`

**Páginas implementadas:**
- `src/app/(unauth)/login/page.tsx`
- `src/app/(unauth)/register/page.tsx`
- `src/app/(unauth)/forgot-password/page.tsx`
- `src/app/(auth)/profile/page.tsx`

---

### 2. **Listas de Compra** (5/5) - 100% ✅

| Método | Endpoint | Servicio/Función | Hook |
|--------|----------|------------------|------|
| POST | `/lists` | `list-service.ts: createList()` | `useCreateList()` |
| GET | `/lists` | `list-service.ts: getLists()` | `useLists()` |
| GET | `/lists/:id` | `list-service.ts: getListById()` | `useList()` |
| PUT | `/lists/:id` | `list-service.ts: updateList()` | `useUpdateList()` |
| DELETE | `/lists/:id` | `list-service.ts: deleteList()` | `useDeleteList()` |

**Archivos:**
- `src/features/lists/services/list-service.ts`
- `src/features/lists/hooks/use-lists.ts`

**Páginas implementadas:**
- `src/app/(auth)/dashboard/page.tsx` - Vista de todas las listas
- `src/app/(auth)/lists/[id]/page.tsx` - Detalle de lista

---

### 3. **Productos** (6/5) - 120% ✅ (+ reorder)

| Método | Endpoint | Servicio/Función | Hook |
|--------|----------|------------------|------|
| POST | `/lists/:listId/products` | `product-service.ts: createProduct()` | `useCreateProduct()` |
| GET | `/lists/:listId/products` | `product-service.ts: getProducts()` | `useProducts()` |
| PUT | `/lists/:listId/products/:id` | `product-service.ts: updateProduct()` | `useUpdateProduct()` |
| PATCH | `/lists/:listId/products/:id/purchased` | `product-service.ts: togglePurchased()` | `useToggleProductPurchased()` |
| DELETE | `/lists/:listId/products/:id` | `product-service.ts: deleteProduct()` | `useDeleteProduct()` |
| PATCH | `/lists/:listId/products/reorder` | `product-service.ts: reorderProducts()` | `useReorderProducts()` |

**Archivos:**
- `src/features/products/services/product-service.ts`
- `src/features/products/hooks/use-products.ts`

**Páginas implementadas:**
- `src/app/(auth)/lists/[id]/page.tsx` - Gestión de productos dentro de lista

---

### 4. **Colaboradores** (3/3) - 100% ✅

| Método | Endpoint | Servicio/Función | Hook |
|--------|----------|------------------|------|
| GET | `/lists/:listId/collaborators` | `collaborator-service.ts: getCollaborators()` | `useCollaborators()` |
| DELETE | `/lists/:listId/collaborators/:userId` | `collaborator-service.ts: removeCollaborator()` | `useRemoveCollaborator()` |
| PATCH | `/lists/:listId/collaborators/:userId` | `collaborator-service.ts: updateCollaboratorRole()` | `useUpdateCollaboratorRole()` |

**Archivos:**
- `src/features/lists/services/collaborator-service.ts`
- `src/features/lists/hooks/use-collaborators.ts`

**Páginas implementadas:**
- Componente dentro de `src/app/(auth)/lists/[id]/page.tsx`

---

## ⚠️ PARCIALMENTE IMPLEMENTADOS (8/57 endpoints)

### 5. **Categorías** (1/6) - 17% ⚠️

| Estado | Método | Endpoint | Servicio/Función |
|--------|--------|----------|------------------|
| ✅ | GET | `/categories` | `category-service.ts: getCategories()` |
| ❌ | POST | `/categories` | **FALTA** |
| ❌ | PUT | `/categories/:id` | **FALTA** |
| ❌ | DELETE | `/categories/:id` | **FALTA** |
| ❌ | PATCH | `/categories/:id/toggle-status` | **FALTA** |
| ❌ | PUT | `/categories/:id/move-to-store` | **FALTA** |

**Archivos existentes:**
- `src/features/categories/services/category-service.ts` (solo GET)
- `src/features/categories/hooks/use-categories.ts`

**Pendiente:**
- Implementar CRUD completo (POST, PUT, DELETE)
- Implementar toggle de estado activo/inactivo
- Implementar mover categoría a otra tienda

---

### 6. **Invitaciones & Permisos** (4/7) - 57% ⚠️

| Estado | Método | Endpoint | Servicio/Función |
|--------|--------|----------|------------------|
| ✅ | POST | `/invitations/:listId/share` | `invitation-service.ts: inviteUser()` |
| ✅ | GET | `/invitations/pending` | `invitation-service.ts: getPendingInvitations()` |
| ✅ | POST | `/invitations/:id/accept` | `invitation-service.ts: acceptInvitation()` |
| ✅ | POST | `/invitations/:id/decline` | `invitation-service.ts: declineInvitation()` |
| ❌ | GET | `/invitations/:hash/access` | **FALTA** - Acceso público vía hash |
| ❌ | GET | `/invitations/:listId/list` | **FALTA** - Listar invitaciones activas de lista |
| ❌ | PUT | `/invitations/:listId/permissions/:userId` | **FALTA** - Cambiar permisos |

**Archivos existentes:**
- `src/features/invitations/services/invitation-service.ts`
- `src/features/invitations/hooks/use-invitations.ts`

**Páginas implementadas:**
- `src/app/(auth)/invitations/page.tsx` - Vista de invitaciones pendientes

**Pendiente:**
- Implementar acceso público vía hash (CU de invitación pública)
- Listar invitaciones activas por lista
- Gestión de permisos (cambiar rol de colaborador)

---

### 7. **Administración** (3/5) - 60% ⚠️

| Estado | Método | Endpoint | Servicio/Función |
|--------|--------|----------|------------------|
| ✅ | GET | `/admin/users` | `admin-service.ts: getAdminUsers()` |
| ✅ | PATCH | `/admin/users/:id/status` | `admin-service.ts: updateUserStatus()` |
| ✅ | GET | `/admin/audit-logs` | `admin-service.ts: getAuditLogs()` |
| ❌ | POST | `/admin/impersonate` | **FALTA** - Iniciar impersonación |
| ❌ | DELETE | `/admin/impersonate` | **FALTA** - Finalizar impersonación |

**Archivos existentes:**
- `src/features/admin/services/admin-service.ts`
- `src/features/admin/hooks/use-admin-users.ts`

**Páginas implementadas:**
- `src/app/(auth)/admin/users/page.tsx` - Gestión de usuarios (usa mock data, necesita conectar hook)

**Pendiente:**
- Implementar sistema de impersonación completo
- Conectar página de admin users con hooks reales
- Página de auditoría de logs

---

### 8. **Inteligencia Artificial - Categorización** (1/4) - 25% ⚠️

| Estado | Método | Endpoint | Servicio/Función |
|--------|--------|----------|------------------|
| ✅ | POST | `/ai/category-suggestions` | `ai-service.ts: categorizeProduct()` |
| ❌ | POST | `/ai/bulk-categorize` | **FALTA** - CU-29 |
| ❌ | GET | `/ai/health` | **FALTA** |
| ❌ | GET | `/ai/info` | **FALTA** - Telemetría (admin only) |

**Archivos existentes:**
- `src/features/ai/services/ai-service.ts`
- `src/features/ai/hooks/use-ai.ts`

**Pendiente:**
- Implementar categorización masiva (hasta 50 productos a la vez)
- Health check de IA
- Telemetría IA (solo admin)

---

## ❌ NO IMPLEMENTADOS (25/57 endpoints)

### 9. **Tiendas** (0/7) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/stores` | Crear tienda |
| GET | `/stores` | Listar tiendas con filtros |
| GET | `/stores/:id` | Detalle de tienda |
| PUT | `/stores/:id` | Actualizar tienda |
| DELETE | `/stores/:id` | Eliminar tienda |
| PATCH | `/stores/:id/toggle-status` | Cambiar estado activo/inactivo |
| GET | `/stores/:id/categories` | Obtener categorías de tienda |

**Pendiente crear:**
- `src/features/stores/services/store-service.ts`
- `src/features/stores/hooks/use-stores.ts`
- `src/app/(auth)/stores/page.tsx` - Gestión de tiendas
- `src/types/Tienda.types.ts` (ya existe)

---

### 10. **Blueprints/Plantillas** (0/8) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/blueprints` | Crear blueprint desde lista |
| GET | `/blueprints` | Mis blueprints |
| GET | `/blueprints/publicos` | Blueprints públicos |
| GET | `/blueprints/buscar` | Buscador avanzado |
| GET | `/blueprints/:id` | Detalle blueprint |
| PUT | `/blueprints/:id` | Actualizar blueprint |
| DELETE | `/blueprints/:id` | Eliminar blueprint |
| POST | `/blueprints/:id/crear-lista` | Crear lista desde blueprint |

**Pendiente crear:**
- `src/features/blueprints/services/blueprint-service.ts`
- `src/features/blueprints/hooks/use-blueprints.ts`
- `src/app/(auth)/templates/page.tsx` - Navegador de templates
- `src/types/Blueprint.types.ts` (ya existe)

**Nota:** Sistema completo de plantillas/templates reutilizables (CU importante)

---

### 11. **IA - Listas por Ocasión** (0/3) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/occasion-lists/occasions` | 20+ ocasiones disponibles |
| POST | `/occasion-lists/generate` | Generar lista por ocasión (barbacoa, cena romántica, etc.) |
| POST | `/occasion-lists/preview` | Preview sin guardar en DB |

**Pendiente crear:**
- `src/features/ai/services/occasion-service.ts`
- `src/features/ai/hooks/use-occasions.ts`
- Integrar en dashboard o página específica

**Nota:** CU-32 - Funcionalidad de listas inteligentes por ocasión

---

### 12. **IA - Recomendaciones Contextuales** (0/3) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/recommendations/:listId` | Recomendaciones generales para lista |
| GET | `/recommendations/:listId/for-product/:productId` | Recomendaciones por producto específico |
| GET | `/recommendations/context-examples` | Ejemplos de contexto |

**Pendiente crear:**
- `src/features/ai/services/recommendation-service.ts`
- `src/features/ai/hooks/use-recommendations.ts`
- Integrar en detalle de lista como sugerencias

**Nota:** CU-33 - Recomendaciones inteligentes basadas en contexto

---

### 13. **Dashboard & Monitoreo** (0/4) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dashboard/metrics` | Métricas del sistema |
| GET | `/dashboard/health` | Estado de salud |
| GET | `/dashboard/alerts` | Alertas activas |
| GET | `/dashboard/performance` | Métricas de rendimiento |

**Pendiente crear:**
- `src/features/dashboard/services/dashboard-service.ts`
- `src/features/dashboard/hooks/use-dashboard.ts`
- `src/app/(auth)/dashboard/metrics/page.tsx` - Dashboard administrativo

**Nota:** Funcionalidad para administradores

---

### 14. **Cache Analytics** (0/5) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/analytics/cache/realtime` | Métricas en tiempo real |
| GET | `/analytics/cache/daily` | Historial diario |
| GET | `/analytics/cache/optimization` | Reporte de optimización |
| GET | `/analytics/cache/dashboard` | Dataset para dashboards |
| GET | `/analytics/cache/health` | Health del cache |

**Pendiente crear:**
- `src/features/analytics/services/cache-analytics-service.ts`
- `src/features/analytics/hooks/use-cache-analytics.ts`

**Nota:** Funcionalidad avanzada para monitoreo de cache (admin)

---

### 15. **Cache Integrity (Admin)** (0/5) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/admin/cache/integrity/scan` | Escanear integridad |
| POST | `/admin/cache/integrity/validate` | Validar clave específica |
| DELETE | `/admin/cache/integrity/cleanup` | Limpieza (con dryRun) |
| GET | `/admin/cache/integrity/stats` | Estadísticas y health |
| POST | `/admin/cache/integrity/repair` | Reparación selectiva |

**Pendiente crear:**
- `src/features/admin/services/cache-integrity-service.ts`
- `src/features/admin/hooks/use-cache-integrity.ts`

**Nota:** Funcionalidad solo para administradores, validación MD5/SHA256/SHA512

---

### 16. **Dev Utilities** (0/3) - 0% ❌

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/dev/events` | Listar eventos |
| DELETE | `/dev/events` | Limpiar eventos |
| POST | `/dev/events/test` | Publicar evento de prueba |

**Pendiente crear:**
- `src/features/dev/services/dev-service.ts`
- `src/features/dev/hooks/use-dev-utils.ts`

**Nota:** Solo para entornos dev/test, no para producción

---

## 📊 Tabla Resumen por Categoría

| Categoría | Implementados | Total | % Completado | Prioridad |
|-----------|--------------|-------|--------------|-----------|
| **Auth** | 6 | 5 | 120% | ✅ CORE |
| **Listas** | 5 | 5 | 100% | ✅ CORE |
| **Productos** | 6 | 5 | 120% | ✅ CORE |
| **Colaboradores** | 3 | 3 | 100% | ✅ CORE |
| **Categorías** | 1 | 6 | 17% | 🔥 ALTA |
| **Invitaciones** | 4 | 7 | 57% | 🔥 ALTA |
| **Admin** | 3 | 5 | 60% | 🔶 MEDIA |
| **IA Core** | 1 | 4 | 25% | 🔶 MEDIA |
| **Tiendas** | 0 | 7 | 0% | 🔥 ALTA |
| **Blueprints** | 0 | 8 | 0% | 🔥 ALTA |
| **IA Ocasiones** | 0 | 3 | 0% | 🔶 MEDIA |
| **IA Recomendaciones** | 0 | 3 | 0% | 🔶 MEDIA |
| **Dashboard** | 0 | 4 | 0% | 🔵 BAJA |
| **Cache Analytics** | 0 | 5 | 0% | 🔵 BAJA |
| **Cache Integrity** | 0 | 5 | 0% | 🔵 BAJA |
| **Dev Utils** | 0 | 3 | 0% | 🔵 BAJA |
| **TOTAL** | **32** | **57** | **56%** | - |

---

## 🎯 Plan de Implementación Recomendado

### Fase 1: Completar Funcionalidades Core (ALTA PRIORIDAD)

#### 1.1 Completar Categorías (5 endpoints faltantes)
- [ ] POST `/categories` - Crear categoría
- [ ] PUT `/categories/:id` - Actualizar categoría
- [ ] DELETE `/categories/:id` - Eliminar categoría
- [ ] PATCH `/categories/:id/toggle-status` - Toggle estado
- [ ] PUT `/categories/:id/move-to-store` - Mover a tienda

**Archivos a crear/modificar:**
- Expandir `src/features/categories/services/category-service.ts`
- Expandir `src/features/categories/hooks/use-categories.ts`
- Crear `src/app/(auth)/categories/page.tsx` (gestión completa)

---

#### 1.2 Implementar Tiendas (7 endpoints)
- [ ] POST `/stores` - Crear tienda
- [ ] GET `/stores` - Listar tiendas
- [ ] GET `/stores/:id` - Detalle tienda
- [ ] PUT `/stores/:id` - Actualizar tienda
- [ ] DELETE `/stores/:id` - Eliminar tienda
- [ ] PATCH `/stores/:id/toggle-status` - Toggle estado
- [ ] GET `/stores/:id/categories` - Categorías asociadas

**Archivos a crear:**
- `src/features/stores/services/store-service.ts`
- `src/features/stores/hooks/use-stores.ts`
- `src/app/(auth)/stores/page.tsx` - Gestión de tiendas
- `src/types/dtos/stores/` (DTOs)

---

#### 1.3 Completar Invitaciones (3 endpoints faltantes)
- [ ] GET `/invitations/:hash/access` - Acceso público vía hash
- [ ] GET `/invitations/:listId/list` - Listar invitaciones activas
- [ ] PUT `/invitations/:listId/permissions/:userId` - Cambiar permisos

**Archivos a modificar:**
- Expandir `src/features/invitations/services/invitation-service.ts`
- Expandir `src/features/invitations/hooks/use-invitations.ts`
- Crear `src/app/(unauth)/invitations/[hash]/page.tsx` (acceso público)

---

### Fase 2: Blueprints/Plantillas (ALTA PRIORIDAD)

#### 2.1 Implementar Sistema de Blueprints (8 endpoints)
- [ ] POST `/blueprints` - Crear blueprint
- [ ] GET `/blueprints` - Mis blueprints
- [ ] GET `/blueprints/publicos` - Blueprints públicos
- [ ] GET `/blueprints/buscar` - Búsqueda avanzada
- [ ] GET `/blueprints/:id` - Detalle
- [ ] PUT `/blueprints/:id` - Actualizar
- [ ] DELETE `/blueprints/:id` - Eliminar
- [ ] POST `/blueprints/:id/crear-lista` - Crear lista desde blueprint

**Archivos a crear:**
- `src/features/blueprints/services/blueprint-service.ts`
- `src/features/blueprints/hooks/use-blueprints.ts`
- `src/app/(auth)/templates/page.tsx` - Navegador de templates
- `src/app/(auth)/templates/[id]/page.tsx` - Detalle de template
- `src/types/dtos/blueprints/` (DTOs)

---

### Fase 3: Funcionalidades de IA (MEDIA PRIORIDAD)

#### 3.1 Completar IA Core (3 endpoints faltantes)
- [ ] POST `/ai/bulk-categorize` - Categorización masiva (CU-29)
- [ ] GET `/ai/health` - Health check IA
- [ ] GET `/ai/info` - Telemetría (admin)

**Archivos a modificar:**
- Expandir `src/features/ai/services/ai-service.ts`
- Expandir `src/features/ai/hooks/use-ai.ts`

---

#### 3.2 IA - Listas por Ocasión (3 endpoints) - CU-32
- [ ] GET `/occasion-lists/occasions` - Ocasiones disponibles
- [ ] POST `/occasion-lists/generate` - Generar lista
- [ ] POST `/occasion-lists/preview` - Preview

**Archivos a crear:**
- `src/features/ai/services/occasion-service.ts`
- `src/features/ai/hooks/use-occasions.ts`
- Integrar en dashboard con botón "Crear lista por ocasión"
- `src/types/dtos/occasions/` (DTOs)

---

#### 3.3 IA - Recomendaciones (3 endpoints) - CU-33
- [ ] GET `/recommendations/:listId` - Recomendaciones generales
- [ ] GET `/recommendations/:listId/for-product/:productId` - Por producto
- [ ] GET `/recommendations/context-examples` - Ejemplos

**Archivos a crear:**
- `src/features/ai/services/recommendation-service.ts`
- `src/features/ai/hooks/use-recommendations.ts`
- Integrar en `src/app/(auth)/lists/[id]/page.tsx` como panel de sugerencias
- `src/types/dtos/recommendations/` (DTOs)

---

### Fase 4: Admin Avanzado (MEDIA-BAJA PRIORIDAD)

#### 4.1 Completar Admin (2 endpoints faltantes)
- [ ] POST `/admin/impersonate` - Iniciar impersonación
- [ ] DELETE `/admin/impersonate` - Finalizar impersonación

**Archivos a modificar:**
- Expandir `src/features/admin/services/admin-service.ts`
- Expandir `src/features/admin/hooks/use-admin-users.ts`
- Agregar componente de impersonación en layout de admin

---

#### 4.2 Dashboard & Monitoreo (4 endpoints)
- [ ] GET `/dashboard/metrics`
- [ ] GET `/dashboard/health`
- [ ] GET `/dashboard/alerts`
- [ ] GET `/dashboard/performance`

**Archivos a crear:**
- `src/features/dashboard/services/dashboard-service.ts`
- `src/features/dashboard/hooks/use-dashboard.ts`
- `src/app/(auth)/admin/dashboard/page.tsx` - Dashboard administrativo

---

### Fase 5: Observabilidad (BAJA PRIORIDAD - Solo Admin)

#### 5.1 Cache Analytics (5 endpoints)
#### 5.2 Cache Integrity (5 endpoints)
#### 5.3 Dev Utilities (3 endpoints)

**Nota:** Estas funcionalidades son avanzadas y solo para administradores. Implementar después de completar todas las funcionalidades core y de usuario.

---

## 📝 Notas Importantes

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
```

### Patrón de Implementación Establecido

Para cada nuevo endpoint seguir esta estructura:

1. **Service Layer** (`src/features/[feature]/services/[feature]-service.ts`)
   ```typescript
   export const [featureService] = {
     methodName: async (params) => {
       const response = await axiosInstance.method('/endpoint', data);
       return response.data;
     }
   };
   ```

2. **Hook Layer** (`src/features/[feature]/hooks/use-[feature].ts`)
   ```typescript
   export const useMethodName = () => {
     return useMutation({
       mutationFn: [featureService].methodName,
       onSuccess: () => {
         queryClient.invalidateQueries(['query-key']);
       }
     });
   };
   ```

3. **UI Layer** (`src/app/(auth)/[feature]/page.tsx`)
   - Usar hooks de react-query
   - Manejar loading/error states
   - Aplicar CSS modules (no utility classes)

### Testing Pendiente

Según `PENDIENTES.md`:
- [ ] Tests unitarios: admin users (Jest + RTL)
- [ ] E2E: flujo de invitación (Playwright)

---

## 🔗 Referencias

- **API Testing Guide:** `InfoDoc/API_Testing_Guide.md`
- **Postman Collection:** `InfoDoc/postman_collection.json` (v2.0.0 - 57 endpoints)
- **Frontend Docs:** `InfoDoc/Docs/frontend.md`
- **API Endpoints:** `InfoDoc/Docs/api-endpoints-frontend.md`
- **Casos de Uso:** `InfoDoc/Docs/casos-uso-completos.md`

---

## ✅ Checklist de Verificación

Antes de marcar como completo cada módulo:

- [ ] Service implementado con todos los métodos
- [ ] Hooks de react-query creados
- [ ] Tipos TypeScript (DTOs) definidos
- [ ] Página/componente UI integrado
- [ ] CSS modules aplicados (no utility classes)
- [ ] Manejo de errores implementado
- [ ] Loading states implementados
- [ ] Tests unitarios agregados
- [ ] Documentación actualizada
- [ ] Build exitoso (`npm run build`)
- [ ] ESLint sin errores críticos

---

**Última actualización:** 10 de noviembre de 2025  
**Próximos pasos:** Fase 1.1 - Completar CRUD de Categorías
