# 📋 Sprints Pendientes - Lista de Compra Frontend

**Fecha de creación**: 6 de noviembre de 2025  
**Última actualización**: 6 de noviembre de 2025
**Estado actual**: Sprint 2.3 completado ✅, planificando próximos sprints

---

## ✅ Sprint 2.3: Gestión de Perfil de Usuario (COMPLETADO - 6 nov 2025)

**Prioridad**: Alta  
**Estimación**: 2-3 días  
**Tiempo real**: 1 día
**Dependencias**: NextAuth configurado ✅  

### Tareas Completadas

#### 1. Crear página de perfil (`/profile`) ✅
- [x] Crear archivo `src/app/(auth)/profile/page.tsx`
- [x] Diseño responsive siguiendo mockup
- [x] Tabs horizontales para "Perfil" y "Seguridad"
- [x] Título "Ajustes" con estilo corporativo
- [x] Navegación por anclas (#perfil, #seguridad)

**Archivos creados**:
- ✅ `src/app/(auth)/profile/page.tsx`

#### 2. Formulario de edición de perfil ✅
- [x] Crear `src/features/auth/components/profile-form.tsx`
- [x] Campos: nombre, email, bio (opcional)
- [x] Validación con Zod (regex para nombres, email format)
- [x] Diseño adaptado al mockup (inputs h-14, bordes #dbdfe6)
- [x] Botones con colores corporativos (#4387f4)
- [x] Loading states y feedback con Sonner

**Archivos creados**:
- ✅ `src/features/auth/components/profile-form.tsx`
- ✅ `src/features/auth/validators/profile-schema.ts`

#### 3. Formulario de cambio de contraseña ✅
- [x] Crear `src/features/auth/components/change-password-form.tsx`
- [x] Campos: contraseña actual, nueva contraseña, confirmar
- [x] Validación de requisitos (min 8, mayúscula, minúscula, número)
- [x] Mostrar/ocultar contraseña con Eye/EyeOff icons
- [x] Card con borde estilo mockup
- [x] Validación de que nueva contraseña sea diferente a la actual

**Archivos creados**:
- ✅ `src/features/auth/components/change-password-form.tsx`
- ✅ `src/features/auth/validators/password-schema.ts`

#### 4. Servicios de usuario ✅
- [x] Ampliar `src/features/auth/services/auth-service.ts`
- [x] Función `getCurrentUser()` → GET `/users/me`
- [x] Función `updateProfile(data)` → PATCH `/users/me`
- [x] Función `changePassword(data)` → PATCH `/users/me/password`
- [x] Manejo de errores específicos (email duplicado, contraseña incorrecta)

**Archivos modificados**:
- ✅ `src/features/auth/services/auth-service.ts`

#### 5. Hooks personalizados ✅
- [x] Hook `useProfile()` para obtener datos del usuario
- [x] Hook `useUpdateProfile()` con React Query mutation
- [x] Hook `useChangePassword()` con React Query mutation
- [x] Invalidar cache de perfil al actualizar
- [x] Actualizar sesión de NextAuth tras cambios

**Archivos creados**:
- ✅ `src/features/auth/hooks/use-profile.ts`

#### 6. Componentes UI adicionales ✅
- [x] Instalar y configurar Textarea (shadcn/ui)
- [x] Instalar y configurar Sonner para toasts
- [x] Instalar y configurar Tabs (shadcn/ui)
- [x] Agregar Toaster a AppProviders

**Archivos creados/modificados**:
- ✅ `src/components/ui/textarea.tsx`
- ✅ `src/components/ui/sonner.tsx`
- ✅ `src/components/ui/tabs.tsx`
- ✅ `src/components/providers/app-providers.tsx`

#### 7. Tests ⏳ (Pendiente)
- [ ] Tests unitarios de ProfileForm
- [ ] Tests unitarios de ChangePasswordForm
- [ ] Tests de validación de schemas
- [ ] Tests de integración del flujo completo

### Criterios de Aceptación
- ✅ Usuario puede ver su perfil actual
- ✅ Usuario puede editar nombre y email
- ✅ Usuario puede cambiar su contraseña
- ✅ Validaciones funcionan correctamente
- ✅ Mensajes de error/éxito son claros (Sonner toasts)
- ✅ Diseño coincide con mockup (colores, espaciados, bordes)
- ✅ Componentes son accesibles (ARIA labels, navegación por teclado)
- ⏳ Tests cubren casos principales (pendiente)

**Resultado**: ✅ Sprint completado exitosamente con diseño fiel al mockup

---

## 🎯 Sprint 4.3: Página Detalle de Lista Completa

**Prioridad**: Alta  
**Estimación**: 3-4 días  
**Dependencias**: ProductsTable ✅, CreateProductDialog ✅, Pagination ✅  

### Tareas

#### 1. Reescribir `/lists/[id]/page.tsx`
- [ ] Eliminar placeholder actual
- [ ] Definir todos los estados necesarios
- [ ] Implementar lógica de filtrado y búsqueda
- [ ] Integrar todos los componentes

**Archivos a modificar**:
- `src/app/(auth)/lists/[id]/page.tsx`

#### 2. Estados y hooks
```typescript
// Estados necesarios
const [searchTerm, setSearchTerm] = useState('')
const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'purchased'>('all')
const [categoryFilter, setCategoryFilter] = useState('')
const [page, setPage] = useState(1)
const [activeProductId, setActiveProductId] = useState<string | null>(null)

// Hooks personalizados
const { data: products, isLoading: isLoadingProducts, error: hasProductsError } = useProducts(listId, {
  search: searchTerm,
  category: categoryFilter,
  status: statusFilter,
  page,
})
const { data: categories } = useCategories()
const { data: resumen } = useListSummary(listId)
```

#### 3. Handlers de productos
- [ ] `handleCreateProduct(data)` - crear producto en la lista
- [ ] `handleEditProduct(id, data)` - editar producto existente
- [ ] `handleDeleteProduct(id)` - eliminar con confirmación
- [ ] `handleTogglePurchased(id)` - marcar comprado/pendiente
- [ ] `handleAdjustQuantity(id, delta)` - incrementar/decrementar
- [ ] `handleReorderProducts(products)` - guardar nuevo orden

#### 4. Filtros y búsqueda
- [ ] Input de búsqueda con `useDebounce` (300ms)
- [ ] Select de categorías dinámico
- [ ] Select de estado (todos/pendiente/comprado)
- [ ] Función `resetPagination()` al cambiar filtros
- [ ] Clear filters button

#### 5. Resumen de lista (cards)
- [ ] Card de productos comprados (count)
- [ ] Card de productos pendientes (count)
- [ ] Card de productos urgentes (count)
- [ ] Card de valor total estimado (suma precios)

#### 6. Integración de componentes
- [ ] ProductsTable con todos los props conectados
- [ ] CreateProductDialog con categorías
- [ ] InviteUserDialog en header
- [ ] Pagination funcional

#### 7. Estados de la UI
- [ ] Loading skeleton mientras carga productos
- [ ] Empty state cuando no hay productos
- [ ] Error state con retry
- [ ] Optimistic updates en mutaciones

#### 8. Tests
- [ ] Tests de integración de la página
- [ ] Tests de filtros y búsqueda
- [ ] Tests de handlers de productos
- [ ] Tests de paginación

### Criterios de Aceptación
- ✓ Página carga y muestra todos los productos
- ✓ Búsqueda en tiempo real funciona
- ✓ Filtros por categoría y estado funcionan
- ✓ CRUD de productos funciona desde la página
- ✓ Paginación con navegación funcional
- ✓ Resumen actualizado en tiempo real
- ✓ Drag & drop para reordenar
- ✓ Loading states en todas las operaciones

---

## 🎯 Sprint 3.3: Completar Colaboración en Listas

**Prioridad**: Media  
**Estimación**: 2 días  
**Dependencias**: Sprint 3.2 ✅  

### Tareas

#### 1. UI de aceptar/rechazar invitaciones
- [ ] Botones de acción en InvitationsList
- [ ] Modal de confirmación para aceptar
- [ ] Modal de confirmación para rechazar
- [ ] Loading states en botones

**Archivos a modificar**:
- `src/features/invitations/components/invitations-list.tsx`

#### 2. Gestión de colaboradores
- [ ] Crear `CollaboratorsList` component
- [ ] Mostrar colaboradores en `/lists/[id]`
- [ ] Botón de eliminar colaborador
- [ ] Modal de gestión de permisos
- [ ] Indicador de rol (owner/editor/viewer)

**Archivos a crear**:
- `src/features/lists/components/collaborators-list.tsx`
- `src/features/lists/components/manage-permissions-dialog.tsx`

#### 3. Sistema de permisos
- [ ] Crear constantes de permisos
- [ ] Hook `useCanEditList(listId)`
- [ ] Hook `useCanDeleteList(listId)`
- [ ] Deshabilitar acciones según permisos
- [ ] Mostrar mensajes informativos

**Archivos a crear**:
- `src/lib/permissions/list-permissions.ts`
- `src/features/lists/hooks/use-permissions.ts`

### Criterios de Aceptación
- ✓ Usuario puede aceptar invitaciones
- ✓ Usuario puede rechazar invitaciones
- ✓ Propietario puede ver colaboradores
- ✓ Propietario puede eliminar colaboradores
- ✓ Permisos se validan correctamente
- ✓ UI refleja permisos del usuario

---

## 🎯 Sprint 5.1: Funcionalidades de IA - Categorización

**Prioridad**: Media-Baja  
**Estimación**: 2-3 días  
**Dependencias**: Backend IA endpoints disponibles  

### Tareas

#### 1. Servicio de IA
- [ ] Crear `src/features/ai/services/ai-service.ts`
- [ ] Función `categorizeProduct(name)` → POST `/ai/categorize`
- [ ] Función `getSuggestions(listId)` → GET `/ai/suggestions`
- [ ] Manejo de timeouts y errores

**Archivos a crear**:
- `src/features/ai/services/ai-service.ts`

#### 2. Hook de categorización automática
- [ ] Hook `useAutoCategorize(productName)`
- [ ] Llamada automática al escribir nombre de producto
- [ ] Debounce de 500ms
- [ ] Mostrar sugerencia en UI

**Archivos a crear**:
- `src/features/ai/hooks/use-auto-categorize.ts`

#### 3. UI de sugerencias
- [ ] Badge de "Sugerido por IA" en categoría
- [ ] Botón de aceptar sugerencia
- [ ] Animación al categorizar
- [ ] Tooltip explicativo

**Archivos a modificar**:
- `src/features/products/components/product-form.tsx`

#### 4. Panel de recomendaciones
- [ ] Crear `RecommendationsPanel` component
- [ ] Mostrar productos recomendados
- [ ] Botón de agregar rápido
- [ ] Actualizar en tiempo real

**Archivos a crear**:
- `src/features/ai/components/recommendations-panel.tsx`

### Criterios de Aceptación
- ✓ Productos se categorizan automáticamente
- ✓ Usuario puede aceptar o rechazar sugerencias
- ✓ Recomendaciones se muestran correctamente
- ✓ Feedback visual cuando IA trabaja
- ✓ Timeouts manejados gracefully

---

## 📊 Resumen de Prioridades

### Alta Prioridad (Completar primero)
1. **Sprint 2.3**: Perfil de usuario (2-3 días)
2. **Sprint 4.3**: Página detalle de lista (3-4 días)

### Media Prioridad
3. **Sprint 3.3**: Colaboración completa (2 días)
4. **Sprint 4.2**: Búsqueda y filtros (2 días)

### Baja Prioridad (Features avanzadas)
5. **Sprint 5.1**: IA - Categorización (2-3 días)
6. **Sprint 6.1**: Notificaciones (3 días)
7. **Sprint 7.1**: Optimización y Performance (2 días)

---

## 📝 Notas

### Sprints Completados Recientemente
- ✅ Sprint 1.1 - Setup inicial
- ✅ Sprint 1.2 - Sistema de diseño
- ✅ Sprint 2.1 - Autenticación
- ✅ Sprint 2.2 - Sesión y navegación (70%)
- ✅ Sprint 3.1 - CRUD de listas
- ✅ Sprint 3.2 - Invitaciones (85%)
- ✅ Sprint 4.1 - CRUD de productos

### Estimación Total Restante
- **Alta prioridad**: 5-7 días
- **Media prioridad**: 4 días
- **Baja prioridad**: 5-6 días
- **Total**: ~15-17 días de desarrollo

### Próximo Sprint Recomendado
👉 **Sprint 2.3: Gestión de Perfil de Usuario** (2-3 días)

**Justificación**: 
- Cierra completamente la Fase 2 de Autenticación
- Feature esperada por usuarios
- No tiene dependencias bloqueantes
- Relativamente simple de implementar
