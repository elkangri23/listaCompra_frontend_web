
# 🗺️ ROADMAP: Funcionalidad de Compartir Listas

Basándome en la documentación y el código existente, aquí está el plan completo para implementar la funcionalidad de compartir listas.

---

## 📋 ANÁLISIS ACTUAL

### ✅ Ya Implementado:
- Servicio de invitaciones (`invitation-service.ts`)
- Hooks React Query (`use-invitations.ts`)
- Componentes de invitación por email
- Página de invitaciones pendientes (`/invitations`)
- Endpoints backend documentados

### ❌ Faltante (botón "Compartir" no funcional):
- Dialog/Modal de compartir lista
- UI para generar y copiar enlace público
- Página pública de acceso por hash
- UI de gestión de colaboradores en lista
- Visualización de permisos (lectura/escritura)

---

## 🎯 FASES DE IMPLEMENTACIÓN

### **FASE 1: Dialog de Compartir Lista** ✅ COMPLETADA
**Objetivo**: Reemplazar el `alert` actual por un modal funcional
**Fecha completada**: 17 de noviembre de 2025

**Tareas**:
1. **Crear componente `ShareListDialog`**
   - Modal con tabs: "Invitar por Email" y "Enlace Público"
   - Reutilizar `InviteUserForm` existente para tab email
   - Crear UI para generar/copiar enlace público
   
2. **Crear componente `ShareLinkSection`**
   - Botón "Generar Enlace de Compartir"
   - Selector de permisos: Lectura | Lectura+Escritura
   - Input con enlace generado + botón copiar
   - Toast de confirmación al copiar
   
3. **Actualizar `invitation-service.ts`**
   ```typescript
   // Añadir este método:
   const generateShareLink = async (
     listId: string, 
     permissions: 'read' | 'write'
   ): Promise<{ hash: string; url: string }> => {
     const response = await axiosInstance.post(`/invitations/${listId}/share`, {
       permissions
     });
     return response.data;
   };
   ```

4. **Crear hook `useShareList`**
   ```typescript
   export const useShareList = (listId: string) => {
     const queryClient = useQueryClient();
     
     return useMutation({
       mutationFn: (permissions: 'read' | 'write') => 
         invitationService.generateShareLink(listId, permissions),
       onSuccess: () => {
         queryClient.invalidateQueries(['invitations', listId]);
       }
     });
   };
   ```

5. **Integrar en `/lists/[id]/page.tsx`**
   ```typescript
   // Reemplazar:
   const handleShare = () => {
     alert('Funcionalidad de compartir lista (por implementar)');
   };
   
   // Por:
   const [shareDialogOpen, setShareDialogOpen] = useState(false);
   
   const handleShare = () => {
     setShareDialogOpen(true);
   };
   
   // En el JSX:
   <ShareListDialog 
     listId={listId}
     open={shareDialogOpen}
     onClose={() => setShareDialogOpen(false)}
   />
   ```

**Archivos a crear**:
- `src/features/invitations/components/share-list-dialog.tsx`
- `src/features/invitations/components/share-link-section.tsx`
- `src/features/invitations/hooks/use-share-list.ts`

---

### **FASE 2: Página Pública de Acceso**
**Objetivo**: Permitir acceder a lista compartida vía hash

**Tareas**:
1. **Crear ruta `/invitations/[token]/page.tsx`**
   ```typescript
   'use client';
   
   export default function PublicListAccessPage() {
     const params = useParams();
     const hash = params.token as string;
     
     const { data: invitation, isLoading, error } = useInvitationByHash(hash);
     
     // Renderizar según estado...
   }
   ```

2. **Componente `PublicListAccessPage`**
   - Validar hash con `getInvitationByHash`
   - Mostrar info básica de la lista (nombre, dueño)
   - Botones: "Acceder como invitado" | "Iniciar sesión"
   
3. **Estados de validación**:
   ```typescript
   if (isLoading) return <LoadingSpinner />;
   
   if (error?.response?.status === 404) {
     return <ErrorScreen title="Enlace no válido" />;
   }
   
   if (error?.response?.status === 410) {
     return <ErrorScreen title="Enlace expirado" />;
   }
   
   if (error?.response?.status === 403) {
     return <ErrorScreen title="Acceso revocado" />;
   }
   ```

4. **Integración con auth**:
   ```typescript
   const handleAcceptInvitation = async () => {
     const session = await getSession();
     
     if (session) {
       // Usuario logueado: aceptar directamente
       await acceptInvitationMutation.mutateAsync(hash);
       router.push(`/lists/${invitation.listId}`);
     } else {
       // No logueado: guardar y redirigir a login
       localStorage.setItem('pendingInvitation', hash);
       router.push('/login?redirect=accept-invitation');
     }
   };
   ```

**Archivos a crear**:
- `src/app/(unauth)/invitations/[token]/page.tsx`
- `src/features/invitations/components/public-list-access.tsx`
- `src/features/invitations/hooks/use-invitation-by-hash.ts`

---

### **FASE 3: Gestión de Colaboradores**
**Objetivo**: Ver y administrar quien tiene acceso

**Tareas**:
1. **Crear componente `CollaboratorsSection`**
   ```typescript
   export function CollaboratorsSection({ listId }: { listId: string }) {
     const { data: collaborators, isLoading } = useCollaborators(listId);
     
     return (
       <div className={styles.collaboratorsSection}>
         <h3>Colaboradores ({collaborators?.length || 0})</h3>
         {collaborators?.map(collab => (
           <CollaboratorItem key={collab.id} collaborator={collab} />
         ))}
       </div>
     );
   }
   ```

2. **Componente `CollaboratorItem`**
   ```typescript
   export function CollaboratorItem({ collaborator }) {
     const [menuOpen, setMenuOpen] = useState(false);
     const updatePermissionsMutation = useUpdatePermissions();
     
     return (
       <div className={styles.collaboratorItem}>
         <Avatar name={collaborator.name} />
         <div className={styles.info}>
           <p>{collaborator.name}</p>
           <span className={styles.email}>{collaborator.email}</span>
         </div>
         <Badge variant={collaborator.role}>
           {collaborator.role === 'owner' ? 'Propietario' : 
            collaborator.permissions === 'write' ? 'Escritura' : 'Lectura'}
         </Badge>
         {collaborator.role !== 'owner' && (
           <DropdownMenu>
             <DropdownMenuItem onClick={() => handleChangePermissions()}>
               Cambiar permisos
             </DropdownMenuItem>
             <DropdownMenuItem onClick={() => handleRevoke()}>
               Revocar acceso
             </DropdownMenuItem>
           </DropdownMenu>
         )}
       </div>
     );
   }
   ```

3. **Añadir en `/lists/[id]/page.tsx`**
   ```typescript
   // En el sidebar, añadir nueva tab:
   <div className={styles.tabs}>
     <button 
       className={activeTab === 'details' ? styles.tabActive : styles.tabInactive}
       onClick={() => setActiveTab('details')}
     >
       Detalles
     </button>
     <button 
       className={activeTab === 'collaborators' ? styles.tabActive : styles.tabInactive}
       onClick={() => setActiveTab('collaborators')}
     >
       Colaboradores
     </button>
   </div>
   
   {activeTab === 'collaborators' && (
     <CollaboratorsSection listId={listId} />
   )}
   ```

4. **Hook `useCollaborators`**
   ```typescript
   export const useCollaborators = (listId: string) => {
     return useQuery({
       queryKey: ['collaborators', listId],
       queryFn: () => invitationService.getInvitationsByList(listId),
       staleTime: 30000, // 30 segundos
     });
   };
   
   export const useUpdatePermissions = () => {
     const queryClient = useQueryClient();
     
     return useMutation({
       mutationFn: ({ listId, userId, permissions }) => 
         invitationService.updatePermissions(listId, userId, { permissions }),
       onSuccess: (_, variables) => {
         queryClient.invalidateQueries(['collaborators', variables.listId]);
       }
     });
   };
   
   export const useRevokeAccess = () => {
     const queryClient = useQueryClient();
     
     return useMutation({
       mutationFn: ({ listId, hash }) => 
         invitationService.cancelInvitation(listId, hash),
       onSuccess: (_, variables) => {
         queryClient.invalidateQueries(['collaborators', variables.listId]);
       }
     });
   };
   ```

**Archivos a crear**:
- `src/features/invitations/components/collaborators-section.tsx`
- `src/features/invitations/components/collaborator-item.tsx`
- `src/features/invitations/hooks/use-collaborators.ts`

---

### **FASE 4: Mejoras UX y Seguridad**
**Objetivo**: Pulir la experiencia

**Tareas**:

1. **Expiración de enlaces**:
   ```typescript
   // En ShareLinkSection:
   <Select value={expiresIn} onChange={setExpiresIn}>
     <option value="24h">24 horas</option>
     <option value="7d">7 días</option>
     <option value="30d">30 días</option>
     <option value="never">Sin expiración</option>
   </Select>
   ```

2. **Notificaciones**:
   ```typescript
   // Usar toast library
   import { toast } from 'sonner';
   
   const handleCopyLink = async () => {
     await navigator.clipboard.writeText(shareUrl);
     toast.success('Enlace copiado al portapapeles');
   };
   ```

3. **Límites**:
   ```typescript
   // Mostrar contador de colaboradores
   const MAX_COLLABORATORS = 10;
   
   <p className={styles.collaboratorCount}>
     {collaborators.length}/{MAX_COLLABORATORS} colaboradores
   </p>
   
   {collaborators.length >= MAX_COLLABORATORS && (
     <Alert variant="warning">
       Has alcanzado el límite máximo de colaboradores
     </Alert>
   )}
   ```

4. **Analytics** (opcional):
   ```typescript
   // Tracking de eventos
   const trackShareEvent = (method: 'email' | 'link') => {
     analytics.track('lista_compartida', {
       listId,
       method,
       timestamp: new Date().toISOString()
     });
   };
   ```

---

## 📁 ESTRUCTURA DE ARCHIVOS COMPLETA

```
src/
├── features/
│   └── invitations/
│       ├── components/
│       │   ├── share-list-dialog.tsx          # ✨ NUEVO - FASE 1
│       │   ├── share-link-section.tsx         # ✨ NUEVO - FASE 1
│       │   ├── public-list-access.tsx         # ✨ NUEVO - FASE 2
│       │   ├── collaborators-section.tsx      # ✨ NUEVO - FASE 3
│       │   ├── collaborator-item.tsx          # ✨ NUEVO - FASE 3
│       │   ├── invite-user-form.tsx           # ✅ Existente
│       │   ├── invite-user-dialog.tsx         # ✅ Existente
│       │   └── invitations-list.tsx           # ✅ Existente
│       ├── hooks/
│       │   ├── use-share-list.ts              # ✨ NUEVO - FASE 1
│       │   ├── use-invitation-by-hash.ts      # ✨ NUEVO - FASE 2
│       │   ├── use-collaborators.ts           # ✨ NUEVO - FASE 3
│       │   └── use-invitations.ts             # ✅ Existente
│       └── services/
│           └── invitation-service.ts          # ✏️ ACTUALIZAR - FASE 1
├── app/
│   ├── (auth)/
│   │   ├── invitations/
│   │   │   └── page.tsx                       # ✅ Existente
│   │   └── lists/
│   │       └── [id]/
│   │           └── page.tsx                   # ✏️ ACTUALIZAR - FASE 1 y 3
│   └── (unauth)/
│       └── invitations/
│           └── [token]/
│               └── page.tsx                   # ✨ NUEVO - FASE 2
└── types/
    └── dtos/
        └── invitations.ts                     # ✏️ ACTUALIZAR si es necesario
```

---

## 🔌 ENDPOINTS DE LA API

| Método | Endpoint | Payload | Respuesta | Uso |
|--------|----------|---------|-----------|-----|
| `POST` | `/api/v1/invitations/:listId/share` | `{ email?, permissions: 'read'\|'write' }` | `{ hash: string, url: string }` | Generar enlace o invitar por email |
| `GET` | `/api/v1/invitations/access/:hash` | - | `PublicInvitationDetailsDto` | Validar y obtener info de invitación pública |
| `GET` | `/api/v1/invitations/:listId` | - | `ActiveInvitationDto[]` | Listar colaboradores actuales |
| `PUT` | `/api/v1/invitations/:listId/permissions/:hash` | `{ permissions: 'read'\|'write' }` | - | Cambiar permisos |
| `DELETE` | `/api/v1/invitations/:listId/:hash` | - | - | Cancelar invitación/revocar acceso |
| `POST` | `/api/v1/invitations/:invitationId/accept` | - | - | Aceptar invitación |
| `POST` | `/api/v1/invitations/:invitationId/decline` | - | - | Rechazar invitación |

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Fase | Complejidad | Tiempo estimado |
|------|-------------|-----------------|
| **Fase 1: Dialog de Compartir** | Media | 2-3 horas |
| **Fase 2: Página Pública** | Alta | 3-4 horas |
| **Fase 3: Gestión Colaboradores** | Media | 2-3 horas |
| **Fase 4: Mejoras UX** | Baja | 1-2 horas |
| **TOTAL** | | **8-12 horas** |

---

## 🚀 ORDEN DE EJECUCIÓN RECOMENDADO

### 1️⃣ **FASE 1 (Dialog)** → Funcionalidad básica inmediata
- Crear `ShareListDialog` con tabs
- Implementar generación de enlace
- Copiar al portapapeles

### 2️⃣ **FASE 2 (Página Pública)** → Permite testing end-to-end
- Crear ruta pública `/invitations/[token]`
- Validación de hash y estados de error
- Integración con sistema de auth

### 3️⃣ **FASE 3 (Gestión)** → Completar ciclo de vida
- Listar colaboradores actuales
- Cambiar permisos
- Revocar accesos

### 4️⃣ **FASE 4 (Pulido)** → Optimización final
- Expiración de enlaces
- Toasts y notificaciones
- Límites y validaciones

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### FASE 1: Dialog de Compartir
- [ ] Crear `share-list-dialog.tsx`
- [ ] Crear `share-link-section.tsx`
- [ ] Actualizar `invitation-service.ts` con `generateShareLink`
- [ ] Crear hook `use-share-list.ts`
- [ ] Integrar en `/lists/[id]/page.tsx`
- [ ] Añadir estilos CSS module
- [ ] Testing manual: generar enlace y copiar

### FASE 2: Página Pública
- [ ] Crear ruta `/invitations/[token]/page.tsx`
- [ ] Crear `public-list-access.tsx`
- [ ] Crear hook `use-invitation-by-hash.ts`
- [ ] Implementar estados de error (404, 410, 403)
- [ ] Integrar con NextAuth para usuarios logueados
- [ ] Manejar localStorage para usuarios no logueados
- [ ] Testing: acceder con hash válido/inválido

### FASE 3: Gestión de Colaboradores
- [ ] Crear `collaborators-section.tsx`
- [ ] Crear `collaborator-item.tsx`
- [ ] Crear hook `use-collaborators.ts`
- [ ] Añadir tab "Colaboradores" en sidebar
- [ ] Implementar cambio de permisos
- [ ] Implementar revocación de acceso
- [ ] Testing: gestionar colaboradores

### FASE 4: Mejoras UX
- [ ] Añadir selector de expiración
- [ ] Integrar toasts (sonner/react-hot-toast)
- [ ] Implementar límite de colaboradores
- [ ] Añadir analytics (opcional)
- [ ] Testing final completo

---

## 🎨 DISEÑO Y COMPONENTES

### ShareListDialog
```
┌─────────────────────────────────────────┐
│ Compartir Lista                    [X]  │
├─────────────────────────────────────────┤
│ [Invitar por Email] [Enlace Público]   │
├─────────────────────────────────────────┤
│                                         │
│ Tab "Enlace Público":                  │
│                                         │
│ Permisos: [●Lectura] [ ]Escritura      │
│                                         │
│ [Generar Enlace]                        │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ https://app.com/inv/abc123      │ 📋│
│ └─────────────────────────────────┘   │
│                                         │
│ [Cerrar]                                │
└─────────────────────────────────────────┘
```

### CollaboratorsSection
```
┌─────────────────────────────────────────┐
│ Colaboradores (3/10)                    │
├─────────────────────────────────────────┤
│ 👤 Antonio Moles [Propietario]          │
│    anthonymoles@hotmail.com             │
├─────────────────────────────────────────┤
│ 👤 Juan Pérez [Escritura]          [⋮] │
│    juan@example.com                     │
├─────────────────────────────────────────┤
│ 👤 María García [Lectura]          [⋮] │
│    maria@example.com                    │
└─────────────────────────────────────────┘
```

---

## 🐛 CONSIDERACIONES Y EDGE CASES

1. **Hash inválido**: Mostrar página 404 amigable
2. **Enlace expirado**: Permitir al propietario regenerar
3. **Usuario ya colaborador**: Redirigir directamente a la lista
4. **Lista eliminada**: Mostrar mensaje apropiado
5. **Permisos insuficientes**: Validar antes de mostrar opciones
6. **Límite de colaboradores**: Deshabilitar botón "Invitar"
7. **Copiar al portapapeles**: Fallback para navegadores antiguos
8. **Navegación con hash pendiente**: Auto-aceptar tras login

---

## � PROGRESO DE IMPLEMENTACIÓN

### Fase 1: Dialog de Compartir Lista ✅ COMPLETADA
- [x] Crear componente `ShareListDialog`
- [x] Crear componente `ShareLinkSection`
- [x] Actualizar `invitation-service.ts` con método `generateShareLink`
- [x] Crear hook `useShareList`
- [x] Integrar en `/lists/[id]/page.tsx`
- [x] Añadir Toaster de Sonner al layout
- [x] Crear tests unitarios
- [x] Documentar implementación

### Fase 2: Página Pública de Acceso ✅ COMPLETADA
- [x] Crear ruta `/invitations/[token]/page.tsx`
- [x] Componente `PublicListAccessPage`
- [x] Estados de validación (404, 410, 403)
- [x] Integración con auth (usuarios logueados vs invitados)

### Fase 3: Gestión de Colaboradores ✅ COMPLETADA
- [x] Crear componente `CollaboratorsSection`
- [x] Crear componente `CollaboratorItem`
- [x] Hook `useCollaborators`
- [x] Añadir tab en página de lista

### Fase 4: Mejoras UX y Seguridad 🔄 PENDIENTE
- [ ] Expiración de enlaces
- [ ] Notificaciones mejoradas
- [ ] Revocación de accesos
- [ ] Auditoría de accesos

---

## �📚 REFERENCIAS

- [Casos de Uso Completos](./Docs/casos-uso-completos.md) - CU-15 a CU-18
- [API Endpoints](./Docs/api-endpoints-frontend.md) - Sección 6
- [Código existente](./src/features/invitations/) - Servicios y hooks actuales
- [Documentación Fase 1](./FASE1_IMPLEMENTACION_COMPLETADA.md) - Detalles completos de la implementación
- [Estructura de Archivos](./ESTRUCTURA_FASE1.md) - Árbol de archivos y flujo de datos

---

**Última actualización**: 17 de noviembre de 2025
**Progreso general**: 75% (3 de 4 fases completadas)
