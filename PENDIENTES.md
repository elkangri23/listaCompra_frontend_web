# 📋 RESUMEN DE TAREAS PENDIENTES

**Última actualización**: 7 de enero de 2025  
**Progreso del proyecto**: ~75% completado

---

## ✅ COMPLETADO

### Sprints Finalizados (8 sprints)
- ✅ Sprint 1.1 - Setup inicial
- ✅ Sprint 1.2 - Sistema de diseño
- ✅ Sprint 2.1 - Autenticación
- ✅ Sprint 2.3 - Gestión de perfil
- ✅ Sprint 3.1 - CRUD de listas
- ✅ Sprint 3.3 - Colaboración y permisos
- ✅ Sprint 4.1 - CRUD de productos
- ✅ Sprint 4.2 - Búsqueda y filtros
- ✅ Sprint 5.1 - Categorización IA (7 enero 2025)

---

## 🎯 PENDIENTE - Sprints Restantes (4-5 sprints)

### 🔥 ALTA PRIORIDAD (6-8 días)

#### 1. Sprint 5.2: Recomendaciones de Productos con IA ⬅️ **SIGUIENTE**
**Estimación**: 2-3 días

**Tareas**:
- [ ] Extender `ai-service.ts` con `getRecommendations(listId)`
- [ ] DTOs para `RecommendationDto` (productId, score, reason)
- [ ] Hook `useProductRecommendations(listId)` con React Query
- [ ] Crear componente `RecommendationsPanel`
- [ ] Cards con score y botón "Agregar"
- [ ] Badge "Recomendado por IA"
- [ ] Integrar panel en `/lists/[id]`
- [ ] Cache strategy (staleTime 15min)

**Archivos**:
- `src/features/ai/services/ai-service.ts` (modificar)
- `src/features/ai/hooks/use-ai.ts` (modificar)
- `src/features/ai/components/recommendations-panel.tsx` (nuevo)
- `src/types/dtos/ai/RecommendationDto.ts` (nuevo)
- `src/app/(auth)/lists/[id]/page.tsx` (modificar)

**Bloqueadores**:
- ⚠️ Requiere endpoint backend `/ai/recommendations` funcional
- ⚠️ Backend debe tener algoritmo de recomendación implementado

---

#### 2. Sprint 8.1: Testing Completo
**Estimación**: 4-5 días

**Tareas**:
- [ ] Tests unitarios de todos los formularios
- [ ] Tests de tablas (ProductsTable, ListsTable)
- [ ] Tests de modales (CreateListDialog, InviteUserDialog, etc.)
- [ ] Tests de hooks (use-profile, use-lists, use-products, use-ai)
- [ ] Tests de integración (flujos completos)
- [ ] Configurar Playwright para tests E2E
- [ ] Tests E2E: registro, login, crear lista, agregar productos
- [ ] Tests E2E: invitaciones, búsqueda, IA
- [ ] Tests de accesibilidad con axe-core
- [ ] Coverage > 80%

**Archivos**:
- `tests/unit/**/*.test.tsx` (múltiples)
- `tests/integration/**/*.test.tsx` (múltiples)
- `e2e/**/*.spec.ts` (Playwright)
- `playwright.config.ts`

---

### 📋 MEDIA PRIORIDAD (5-7 días)

#### 3. Sprint 6.1: Sistema de Notificaciones
**Estimación**: 3-4 días

**Tareas**:
- [ ] Servicio de notificaciones (`getNotifications`, `markAsRead`, `deleteNotification`)
- [ ] DTOs para Notification (id, type, message, read, createdAt)
- [ ] Hook `useNotifications()` con polling cada 30s
- [ ] Hook `useUnreadCount()` para badge
- [ ] Icono de campana en navbar con badge
- [ ] Dropdown con últimas 5 notificaciones
- [ ] Botón "Marcar todas como leídas"
- [ ] Página completa `/notifications` con paginación
- [ ] Filtros por tipo y estado (leída/no leída)
- [ ] Tipos: invitación, cambio en lista, producto agregado, comprado

**Archivos**:
- `src/features/notifications/services/notifications-service.ts`
- `src/features/notifications/hooks/use-notifications.ts`
- `src/features/notifications/components/notifications-dropdown.tsx`
- `src/features/notifications/components/notification-item.tsx`
- `src/app/(auth)/notifications/page.tsx`
- `src/types/dtos/notifications/NotificationDto.ts`

**Bloqueadores**:
- ⚠️ Requiere endpoints backend `/notifications` (GET, PATCH, DELETE)

---

#### 4. Sprint 4.3: Mejorar Página Detalle de Lista (OPCIONAL)
**Estimación**: 2-3 días

**Nota**: La página `/lists/[id]` ya funciona, estas son mejoras opcionales.

**Tareas**:
- [ ] Cards con estadísticas mejoradas (comprados/pendientes/urgentes/total)
- [ ] Gráfico de progreso circular
- [ ] Estimación de presupuesto total
- [ ] Filtros avanzados (por precio, urgencia)
- [ ] Tabs de vista (Productos/Colaboradores/Historial)

**Archivos**:
- `src/app/(auth)/lists/[id]/page.tsx` (modificar)
- Nuevos componentes de estadísticas

---

### ⚡ BAJA PRIORIDAD (2-3 días)

#### 5. Sprint 7.1: Optimización y Performance
**Estimación**: 2-3 días

**Tareas**:
- [ ] Lazy load de rutas pesadas
- [ ] Dynamic imports para modales grandes
- [ ] Suspense boundaries en páginas
- [ ] Prefetch de datos en hover
- [ ] Optimistic updates en mutaciones
- [ ] Reducir overfetching con select en queries
- [ ] Next/Image para avatares y logos
- [ ] Bundle analysis y reducción
- [ ] useMemo en cálculos pesados
- [ ] useCallback en handlers de eventos
- [ ] React.memo en componentes pesados
- [ ] Auditoría con Lighthouse
- [ ] Fixes de ARIA labels faltantes
- [ ] Navegación por teclado completa

**Criterios**:
- Lighthouse score > 90 en Performance
- Lighthouse score > 95 en Accessibility
- Bundle size reducido en 20%
- FCP < 1.5s
- TTI < 3.5s

---

## 📊 RESUMEN EJECUTIVO

### Estimación Total Restante
- **Alta prioridad**: 6-8 días
- **Media prioridad**: 5-7 días
- **Baja prioridad**: 2-3 días
- **TOTAL**: ~13-18 días de desarrollo

### Progreso por Módulo
| Módulo | Progreso | Estado |
|--------|----------|--------|
| Autenticación | 100% | ✅ Completado |
| Listas | 100% | ✅ Completado |
| Productos | 100% | ✅ Completado |
| IA | 40% | 🚧 5.1 ✅, 5.2 pendiente |
| Notificaciones | 0% | 🔜 Pendiente |
| Tests | 20% | 🔜 8.1 pendiente |
| Performance | 70% | 🚧 7.1 pendiente |

---

## 🚧 BLOQUEADORES BACKEND

### Endpoints Requeridos
1. **`/ai/recommendations`** - GET con listId
   - Necesario para Sprint 5.2
   - Debe devolver productos recomendados con score

2. **`/notifications`** - GET, PATCH, DELETE
   - Necesario para Sprint 6.1
   - GET: lista de notificaciones
   - PATCH /:id/read: marcar como leída
   - DELETE /:id: eliminar notificación

3. **Algoritmo de recomendación**
   - ML o basado en reglas
   - Análisis de historial de compras
   - Personalización por usuario

---

## 🎯 PRÓXIMO SPRINT RECOMENDADO

### Sprint 5.2: Recomendaciones de Productos con IA

**Razones**:
- ✅ Complementa Sprint 5.1 completado
- ✅ Alto valor para usuarios (personalización)
- ✅ Infraestructura IA ya existe (ai-service, hooks)
- ✅ Scoped y manejable (2-3 días)
- ✅ Demuestra capacidades IA end-to-end

**Alternativa si backend no está listo**:
- Sprint 8.1 (Testing) - No tiene bloqueadores
- Sprint 7.1 (Optimización) - No tiene bloqueadores

---

## 📝 TECH DEBT

- [ ] Añadir tests unitarios a sprints anteriores
- [ ] Mejorar error boundaries
- [ ] Documentar componentes con JSDoc
- [ ] Considerar Storybook para documentación de componentes (opcional)
- [ ] Auditoría de dependencias npm
- [ ] Actualizar dependencias a últimas versiones estables
