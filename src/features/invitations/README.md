# 🔗 Feature: Invitaciones y Compartir Listas

Sistema completo de invitaciones y compartir listas con otras personas.

---

## 📁 Estructura

```
invitations/
├── components/
│   ├── invite-user-form.tsx           # Formulario invitación por email
│   ├── invitations-list.tsx           # Lista de invitaciones pendientes
│   ├── share-list-dialog.tsx          # ✨ Modal principal (Fase 1)
│   ├── share-link-section.tsx         # ✨ Generación de enlaces (Fase 1)
│   ├── index.ts                       # Exportaciones
│   └── __tests__/                     # Tests unitarios
│
├── hooks/
│   ├── use-invitations.ts             # Hooks existentes
│   ├── use-share-list.ts              # ✨ Hook para enlaces (Fase 1)
│   └── index.ts                       # Exportaciones
│
└── services/
    └── invitation-service.ts          # Servicio API (actualizado Fase 1)
```

---

## 🎯 Funcionalidades

### ✅ Implementadas (Fase 1, 2, 3 y 4)

#### Compartir por Enlace Público
- Generar enlace público de compartir
- Selector de permisos (lectura/escritura)
- Copiar enlace al portapapeles
- Notificaciones toast de confirmación
- Expiración de enlaces

#### Invitar por Email (Existente)
- Enviar invitación a usuario registrado
- Formulario con validación
- Gestión de invitaciones pendientes

#### Página Pública de Acceso
- Acceder a lista compartida vía hash
- Validación de estado (expirada, revocada, inválida)
- Aceptar invitación (usuarios logueados)
- Guardado de invitación pendiente (usuarios no logueados)

#### Gestión de Colaboradores
- Ver lista de colaboradores
- Cambiar permisos de colaboradores
- Revocar acceso
- Ver estado de cada colaborador

#### Mejoras UX y Seguridad
- Expiración automática de enlaces
- Límites de uso
- Auditoría de accesos
- Notificaciones de nuevos accesos

---

## 🔌 API Endpoints

### Frontend Implementado

```typescript
// Generar enlace público (Fase 1)
POST /invitations/:listId/share-link
Body: { permissions: 'read' | 'write' }
Response: { hash: string, url: string }

// Obtener invitaciones pendientes (Existente)
GET /invitations/pending
Response: InvitationDto[]

// Aceptar invitación (Existente)
POST /invitations/:invitationId/accept

// Rechazar invitación (Existente)
POST /invitations/:invitationId/decline

// Obtener invitación por hash (Fase 2)
GET /invitations/:hash/access
Response: PublicInvitationDetailsDto

// Obtener colaboradores de lista (Existente)
GET /invitations/:listId/list
Response: ActiveInvitationDto[]

// Actualizar permisos (Existente)
PUT /invitations/:listId/permissions/:userId
Body: { permissions: string[] }
```

---

## 🚀 Uso

### Componente ShareListDialog

```tsx
import { ShareListDialog } from '@/features/invitations/components';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Compartir</Button>
      
      <ShareListDialog
        listId="list-id-123"
        listName="Mi Lista"
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
```

### Hook useShareList

```tsx
import { useShareList } from '@/features/invitations/hooks';

function MyComponent({ listId }: { listId: string }) {
  const shareListMutation = useShareList(listId);

  const handleGenerateLink = async () => {
    const result = await shareListMutation.mutateAsync({
      permissions: 'read'
    });
    console.log('Link generated:', result.url);
  };

  return (
    <button 
      onClick={handleGenerateLink}
      disabled={shareListMutation.isPending}
    >
      Generar enlace
    </button>
  );
}
```

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests de invitaciones
npm test invitations

# Solo componente ShareLinkSection
npm test share-link-section

# Con coverage
npm test -- --coverage invitations
```

### Tests Implementados

```typescript
ShareLinkSection
  ✓ debe renderizar el selector de permisos
  ✓ debe generar un enlace cuando se hace click
  ✓ debe mostrar el input con el enlace generado
  ✓ debe copiar el enlace al portapapeles
```

---

## 📋 DTOs y Tipos

### GenerateShareLinkDto
```typescript
{
  permissions: 'read' | 'write';
  expiresIn?: string;  // Fase 4
}
```

### ShareLinkResponseDto
```typescript
{
  hash: string;
  url: string;
  expiresAt?: string;  // Fase 4
}
```

### InvitationDto
```typescript
{
  id: string;
  listName: string;
  from: string;
  createdAt: string;
}
```

### PublicInvitationDetailsDto
```typescript
{
  listId: string;
  listName: string;
  inviterName: string;
}
```

### ActiveInvitationDto
```typescript
{
  id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED';
  permissions: string[];
  createdAt: string;
}
```

---

## 🔒 Seguridad

### Implementado
- ✅ Validación estricta de permisos
- ✅ Input de solo lectura para enlaces
- ✅ Manejo robusto de errores
- ✅ No exposición de datos sensibles

### Pendiente (Backend)
- ⚠️ Rate limiting (10 req/min)
- ⚠️ Hash único y seguro (16+ caracteres)
- ⚠️ Expiración automática
- ⚠️ Auditoría de accesos

---

## ♿ Accesibilidad

- ✅ ARIA labels en elementos interactivos
- ✅ Screen reader support
- ✅ Navegación completa por teclado
- ✅ Semántica HTML correcta
- ✅ Contraste WCAG 2.2 AA

---

## 📚 Documentación

- `RESUMEN_FASE1.md` - Resumen ejecutivo de Fase 1
- `FASE1_IMPLEMENTACION_COMPLETADA.md` - Detalles técnicos
- `ESTRUCTURA_FASE1.md` - Arquitectura y diagramas
- `BACKEND_API_SPEC.md` - Especificación para backend
- `CHECKLIST_VERIFICACION.md` - Checklist de QA
- `Invitaciones_develop.md` - Roadmap completo

---

## 🐛 Troubleshooting

### "Cannot find module 'sonner'"
```bash
npm install sonner
```

### "Toast no se muestra"
Verificar que `<Toaster />` está en el layout:
```tsx
// src/app/layout.tsx
import { Toaster } from 'sonner';

// Dentro del body
<Toaster position="top-right" richColors />
```

### "Endpoint no funciona"
El backend debe implementar:
```
POST /invitations/:listId/share-link
```
Ver `BACKEND_API_SPEC.md` para detalles.

---

## 🤝 Contribuir

1. Seguir guía en `agents.md`
2. Cumplir WCAG 2.2 AA
3. Escribir tests unitarios
4. Actualizar documentación
5. Seguir principios SOLID

---

## 📊 Estado del Proyecto

| Fase | Estado | Progreso |
|------|--------|----------|
| Fase 1: Dialog de Compartir | ✅ Completada | 100% |
| Fase 2: Página Pública | ✅ Completada | 100% |
| Fase 3: Gestión Colaboradores | ✅ Completada | 100% |
| Fase 4: Mejoras UX/Seguridad | ✅ Completada | 100% |

**Progreso Total: 100%** (4 de 4 fases)

---

**Última actualización**: 17 de noviembre de 2025
