# 🛒 Lista de la Compra Colaborativa - Frontend

**Sistema frontend moderno y escalable** construido con **Next.js 15**, **TypeScript** y **Tailwind CSS** siguiendo **arquitectura limpia** y **principios SOLID**.

## � Estado del Proyecto

**Última actualización**: 6 de noviembre de 2025
**Progreso general**: ~70% completado
**Fase actual**: Fase 2 - Autenticación completa (100%) | Fase 3 - Gestión de Listas (85%)

### ✅ Completado
- ✅ Configuración base de Next.js 15 con TypeScript
- ✅ Sistema de diseño con Tailwind CSS 4.x y componentes shadcn/ui
- ✅ Integración de tipos del backend mediante MCP servers
- ✅ Sistema de autenticación completo con NextAuth.js v5
- ✅ Páginas de login, registro y recuperación de contraseña
- ✅ Dashboard protegido con información de usuario
- ✅ **Gestión de perfil completa (Sprint 2.3)** - NUEVO
- ✅ **Edición de perfil (nombre, email, bio)** - NUEVO
- ✅ **Cambio de contraseña con validaciones** - NUEVO
- ✅ CRUD completo de listas (crear, editar, eliminar, listar) - componentes y servicios
- ✅ Sistema de invitaciones a listas - componentes, hooks y servicios
- ✅ Gestión de categorías de productos - hooks y servicios
- ✅ CRUD de productos en listas - componentes, hooks y servicios completos
- ✅ Validación de formularios con Zod en todos los features
- ✅ Configuración de seguridad (CSP, headers)
- ✅ Testing setup (Jest + React Testing Library)
- ✅ React Query (TanStack Query) para estado asíncrono
- ✅ QueryClientProvider configurado en AppProviders
- ✅ SessionProvider de NextAuth configurado
- ✅ **Sistema de notificaciones Sonner (toasts)** - NUEVO
- ✅ Componentes de paginación reutilizables
- ✅ Corrección de errores de compilación (imports, props, providers)

### 🚧 En Progreso
- 🚧 Página detalle de lista completa (actualmente placeholder temporal)
- 🚧 Búsqueda y filtros en tiempo real de productos
- 🚧 Accesibilidad WCAG 2.2 completa

### 🔜 Próximamente
- 🔜 Funcionalidades avanzadas de productos (drag & drop, reordenamiento)
- 🔜 Tests unitarios de componentes
- 🔜 Funcionalidades de IA (categorización, recomendaciones)
- 🔜 Sistema de notificaciones en tiempo real
- 🔜 Tests E2E con Playwright

## �🚀 Descripción General

Frontend para la aplicación de "Lista de la Compra Colaborativa" que consume la API REST del backend. Construido con las últimas tecnologías web y siguiendo las mejores prácticas de la industria.

## ✨ Stack Tecnológico

- **Framework**: Next.js 15.5.6 (App Router)
- **Lenguaje**: TypeScript 5.9.3
- **Estilos**: Tailwind CSS 4.1.16 + PostCSS
- **Testing**: Jest + React Testing Library + Playwright (próximamente)
- **Autenticación**: NextAuth.js v5 (beta)
- **Validación**: Zod 3.25.76
- **HTTP Client**: Axios
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Formateo**: Prettier + ESLint
- **MCP Integration**: Model Context Protocol para compartir tipos con backend

## 📦 Instalación Rápida

### Requisitos Previos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Backend de listaCompra ejecutándose

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone https://github.com/elkangri23/listaCompra_frontend_web.git
cd listaCompra_frontend_web

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu configuración

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
```

## Recursos de Desarrollo

- Como desarrollador, puedes encontrar el código base de las páginas y una imagen de cómo se verían en la carpeta `infoDoc/moockup_funcionalidad`.
- Como desarrollador, puedes encontrar toda la información del proyecto, incluyendo el contexto del backend, en la carpeta `infoDoc/Docs`.

## ℹ️ Notas Técnicas Recientes

- Se eliminaron las dependencias de descarga de fuentes de Google en tiempo de build para garantizar compilaciones reproducibles sin acceso a internet.
- Los controles de paginación de productos ahora exponen estados deshabilitados accesibles y etiquetas para lectores de pantalla.

## 📁 Estructura del Proyecto

```
listaCompra_frontend_web/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/              # Grupo de rutas autenticadas
│   │   │   ├── dashboard/
│   │   │   ├── lists/
│   │   │   ├── products/
│   │   │   └── profile/
│   │   ├── (unauth)/            # Grupo de rutas públicas
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── api/                 # API Routes (proxy, webhooks)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── error.tsx
│   │
│   ├── components/              # Componentes globales
│   │   ├── ui/                  # Componentes atómicos (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   └── shared/              # Componentes compartidos
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── ProtectedRoute.tsx
│   │
│   ├── features/                # Módulos por funcionalidad (Clean Architecture)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── validators/
│   │   ├── lists/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── validators/
│   │   ├── products/
│   │   ├── notifications/
│   │   └── users/
│   │
│   ├── lib/                     # Utilidades y configuraciones
│   │   ├── api/                 # Cliente HTTP
│   │   │   ├── axios-instance.ts
│   │   │   ├── interceptors.ts
│   │   │   └── error-handler.ts
│   │   ├── auth/                # Configuración de autenticación
│   │   │   └── next-auth.config.ts
│   │   ├── utils/               # Funciones utilitarias
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── date.ts
│   │   └── constants/           # Constantes globales
│   │       └── index.ts
│   │
│   ├── hooks/                   # Custom hooks globales
│   │   ├── useAuth.ts
│   │   ├── useDebounce.ts
│   │   └── useMediaQuery.ts
│   │
│   ├── store/                   # Estado global (Zustand)
│   │   ├── auth-store.ts
│   │   ├── lists-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/                   # Tipos TypeScript globales
│   │   ├── api.types.ts
│   │   ├── entities.types.ts
│   │   └── common.types.ts
│   │
│   ├── styles/                  # Estilos globales
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   └── middleware.ts            # Middleware de Next.js
│
├── public/                      # Archivos estáticos
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/                       # Tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🗺️ Roadmap de Desarrollo

### Fase 1: Fundamentos y Configuración ✅ (Completada)

#### Sprint 1.1: Setup Inicial ✅
- [x] Inicializar proyecto Next.js 15 con TypeScript
- [x] Configurar Tailwind CSS 4.x con @tailwindcss/postcss
- [x] Configurar ESLint + Prettier
- [x] Configurar Jest + React Testing Library
- [x] Crear estructura de carpetas base (features, components, lib)
- [x] Configurar variables de entorno (.env.local, .env.example)
- [x] Implementar CSP y security headers
- [x] Configurar análisis de código estático
- [x] Integrar tipos del backend mediante MCP servers

#### Sprint 1.2: Sistema de Diseño Base ✅
- [x] Integrar shadcn/ui + Radix UI
- [x] Crear componentes atómicos (Button, Input, Card, Badge, Label, Heading, Text)
- [x] Implementar sistema de colores con CSS variables (HSL)
- [x] Configurar temas (light/dark mode) con ThemeToggle
- [x] Implementar tokens de diseño (designTokens)
- [x] Configurar Tailwind con custom utilities y theme extension
- [x] Página de demostración del sistema de diseño

### Fase 2: Autenticación y Autorización ✅ (100% Completada - 6 nov 2025)

#### Sprint 2.1: Sistema de Autenticación ✅
- [x] Instalar y configurar NextAuth.js v5 (beta)
- [x] Instalar Axios como HTTP client
- [x] Configurar CredentialsProvider para email/password
- [x] Implementar callbacks (jwt, session) con refresh token
- [x] Crear auth-service.ts con funciones login, refreshAccessToken
- [x] Implementar LoginForm con validación Zod
- [x] Implementar ForgotPasswordForm con validación
- [x] Crear páginas de login (/login) y registro (/register)
- [x] Crear página de recuperación de contraseña (/forgot-password)
- [x] Configurar route groups: (auth) y (unauth)
- [x] Implementar middleware de autenticación
- [x] Manejo de errores de autenticación con toast/mensajes
- [x] Suspense boundaries para useSearchParams

#### Sprint 2.2: Gestión de Sesión y Perfiles ✅ (100% Completada - 6 nov 2025)
- [x] Implementar dashboard protegido (/dashboard)
- [x] QueryClientProvider y SessionProvider configurados
- [x] Página de invitaciones (/invitations)
- [x] Componentes de sesión y navegación
- [x] Manejo de errores y loading states
- [x] Implementar logout con limpieza de sesión en cliente
- [x] Persistencia de sesión con cookies seguras (HttpOnly, SameSite, Secure) por NextAuth
- [x] Crear página de perfil de usuario (/profile) - **Completado Sprint 2.3**
- [x] Implementar edición de perfil (nombre, email) - **Completado Sprint 2.3**
- [x] Implementar cambio de contraseña - **Completado Sprint 2.3**

#### Sprint 2.3: Gestión de Perfil de Usuario ✅ (100% Completado - 6 nov 2025)

**Objetivo**: Completar la funcionalidad de gestión de perfil de usuario con edición de datos personales y cambio de contraseña siguiendo el diseño del mockup.

**Archivos Creados/Modificados**:
- ✅ `src/features/auth/validators/profile-schema.ts` - Validación Zod para perfil
- ✅ `src/features/auth/validators/password-schema.ts` - Validación Zod para contraseña
- ✅ `src/features/auth/services/auth-service.ts` - Ampliado con `getCurrentUser`, `updateProfile`, `changePassword`
- ✅ `src/features/auth/hooks/use-profile.ts` - Hooks con React Query
- ✅ `src/features/auth/components/profile-form.tsx` - Formulario con diseño del mockup
- ✅ `src/features/auth/components/change-password-form.tsx` - Formulario con card y diseño del mockup
- ✅ `src/app/(auth)/profile/page.tsx` - Página "Ajustes" con tabs horizontales estilo mockup
- ✅ `src/components/ui/textarea.tsx` - Componente Textarea (shadcn/ui)
- ✅ `src/components/ui/sonner.tsx` - Sistema de notificaciones toast
- ✅ `src/components/ui/tabs.tsx` - Componente Tabs (shadcn/ui)
- ✅ `src/components/providers/app-providers.tsx` - Actualizado con Toaster

**Funcionalidades Implementadas**:
1. ✅ Página `/profile` con diseño responsive siguiendo mockup
2. ✅ Título "Ajustes" con tabs horizontales (Perfil/Seguridad)
3. ✅ Tabs con borde inferior y colores del mockup (#111418, #60708a, #dbdfe6)
4. ✅ ProfileForm con campos: nombre, email, bio (diseño plano estilo mockup)
5. ✅ Inputs con altura 56px (h-14), bordes #dbdfe6, placeholder #60708a
6. ✅ ChangePasswordForm dentro de card con borde
7. ✅ Botones azules (#4387f4) estilo mockup
8. ✅ Integración con endpoints PATCH `/users/me` y `/users/me/password`
9. ✅ Validaciones Zod completas:
   - Email único (backend)
   - Contraseña actual correcta
   - Nueva contraseña cumple requisitos (min 8 chars, mayúscula, minúscula, número)
   - Confirmación de contraseña coincide
   - Nueva contraseña diferente a la actual
10. ✅ Manejo de errores específicos (email duplicado, contraseña incorrecta)
11. ✅ Loading states y feedback visual con Sonner
12. ✅ Botones show/hide para contraseñas con Eye/EyeOff icons
13. ✅ React Query con invalidación de cache tras actualización
14. ✅ Actualización automática de sesión NextAuth tras cambio de perfil
15. ✅ Componentes accesibles (ARIA labels, navegación por teclado)

**Estimación**: 2-3 días de desarrollo
**Tiempo Real**: 1 día (6 nov 2025)

**Criterios de Aceptación**:
- ✅ Usuario puede ver su perfil actual
- ✅ Usuario puede editar nombre y email
- ✅ Usuario puede cambiar su contraseña
- ✅ Validaciones funcionan correctamente
- ✅ Mensajes de error/éxito son claros (Sonner toasts)
- ✅ Diseño coincide con mockup HTML (colores, espaciados, bordes)
- ✅ Componentes son accesibles (WCAG 2.2 AA)
- ⏳ Tests cubren casos principales (pendiente)

**Notas Técnicas**:
- Sistema de toasts migrado de `useToast` a Sonner (recomendación shadcn/ui)
- Toaster agregado a AppProviders para disponibilidad global
- Hooks de perfil con React Query (cache, invalidación, optimistic updates)
- Validación de regex para nombres (solo letras y espacios)
- Bio opcional con máximo 500 caracteres
- Password schema reutilizable para validación consistente
- Diseño visual adaptado al mockup manteniendo componentes shadcn/ui funcionales
- Colores corporativos: #111418 (texto principal), #60708a (texto secundario), #dbdfe6 (bordes), #4387f4 (primario)

### Fase 3: Gestión de Listas ✅ (85% Completada)

#### Sprint 3.1: CRUD de Listas ✅
- [x] Implementar listado de listas del usuario (/lists)
- [x] Crear nueva lista (CreateListDialog + CreateListForm)
- [x] Editar información de lista (EditListDialog + EditListForm)
- [x] Eliminar lista con confirmación
- [x] Vista detalle de lista (/lists/[id]) - placeholder temporal
- [x] Paginación de resultados (componente Pagination)
- [x] Servicio list-service.ts con todas las operaciones
- [x] Hooks use-lists.ts con React Query
- [x] Componente ListsTable con acciones inline

#### Sprint 3.2: Colaboración en Listas ✅ (100% Completado - 6 nov 2025)
- [x] Invitar usuarios a lista por email (InviteUserDialog + InviteUserForm)
- [x] Vista de invitaciones pendientes (/invitations)
- [x] Componente InvitationsList
- [x] Servicio invitation-service.ts completo
- [x] Hooks use-invitations.ts con React Query
- [x] Aceptar/rechazar invitaciones - ✅ Completado Sprint 3.3
- [x] Gestionar permisos de colaboradores - ✅ Completado Sprint 3.3
- [x] Eliminar colaboradores - ✅ Completado Sprint 3.3
- [x] Sistema de permisos completo - ✅ Completado Sprint 3.3

**Sprint 3.3: Colaboración Completa (6 nov 2025)**:
- ✅ Botones aceptar/rechazar con loading states y notificaciones
- ✅ Componente CollaboratorsList con gestión de roles
- ✅ Sistema de permisos (owner/editor/viewer)
- ✅ Hooks de permisos para validar acciones
- ✅ Página de lista con tabs (Productos/Colaboradores)
- ✅ Eliminación de colaboradores con confirmación

### Fase 4: Gestión de Productos 🚧 (70% Completada)

#### Sprint 4.1: CRUD de Productos ✅
- [x] Agregar productos a lista (CreateProductDialog + ProductForm)
- [x] Editar productos (EditProductDialog + ProductForm)
- [x] Eliminar productos con confirmación
- [x] Marcar como comprado/pendiente (toggle)
- [x] Componente ProductsTable con todas las acciones
- [x] Servicio product-service.ts completo
- [x] Hooks use-products.ts con React Query
- [x] Integración con categorías
- [x] Validación con Zod (product schemas)
- [x] Ajustar cantidad inline
- [x] Drag & drop para reordenar

#### Sprint 4.2: Búsqueda y Filtros 🚧 (En Progreso)
- [ ] Buscador de productos en tiempo real con debounce
- [ ] Filtros por categoría (select)
- [ ] Filtros por estado (comprado/pendiente)
- [ ] Ordenamiento (alfabético, fecha, categoría)
- [ ] Historial de productos comprados
- [ ] Sugerencias de productos
- [ ] Optimización de queries con React Query

#### Sprint 4.3: Página Detalle de Lista Completa 📋 (Próximo Sprint - 0% Completado)

**Objetivo**: Completar la página `/lists/[id]` con todas las funcionalidades de gestión de productos, filtros y colaboración.

**Contexto**: Actualmente es un placeholder temporal debido a 50+ errores de variables no definidas.

**Tareas Principales**:
1. [ ] Definir todos los estados necesarios:
   - `searchTerm`, `statusFilter`, `categoryFilter`
   - `page`, `totalPages`, `activeProductId`
   - Estados de loading y error
2. [ ] Implementar hooks personalizados:
   - `useProducts(listId)` - obtener productos de la lista
   - `useCategories()` - obtener categorías
   - `useListSummary(listId)` - resumen de la lista
3. [ ] Implementar handlers de productos:
   - `handleCreateProduct` - crear producto
   - `handleEditProduct` - editar producto
   - `handleDeleteProduct` - eliminar producto
   - `handleTogglePurchased` - marcar comprado/pendiente
   - `handleAdjustQuantity` - ajustar cantidad
   - `handleReorderProducts` - reordenar con drag & drop
4. [ ] Integrar componentes existentes:
   - `ProductsTable` con todos los props
   - `CreateProductDialog`
   - `InviteUserDialog`
   - `Pagination`
5. [ ] Implementar filtros y búsqueda:
   - Input de búsqueda con debounce
   - Selectores de categoría y estado
   - Función `resetPagination` cuando cambian filtros
6. [ ] Mostrar resumen de lista:
   - Productos comprados
   - Productos pendientes
   - Productos urgentes
   - Valor total estimado
7. [ ] Manejo de estados:
   - Loading mientras carga datos
   - Error si falla la carga
   - Empty state si no hay productos
8. [ ] Tests de integración de la página completa

**Estimación**: 3-4 días de desarrollo

**Dependencias**:
- ProductsTable (✅ Completado)
- CreateProductDialog (✅ Completado)
- Pagination (✅ Completado)
- use-products hook (✅ Completado)
- use-categories hook (✅ Completado)

**Criterios de Aceptación**:
- ✓ Página carga y muestra todos los productos de la lista
- ✓ Búsqueda y filtros funcionan correctamente
- ✓ CRUD de productos funciona desde la página
- ✓ Paginación funcional con navegación
- ✓ Resumen actualizado en tiempo real
- ✓ Invitaciones se pueden enviar desde la página
- ✓ Drag & drop para reordenar productos
- ✓ Loading states en todas las operaciones
- ✓ Manejo de errores claro y accesible
- [ ] Gestionar permisos de colaboradores
- [ ] Eliminar colaboradores
- [ ] Vista de miembros de lista
- [ ] Notificaciones de invitaciones
- [ ] Tests de flujos colaborativos

### Fase 4: Gestión de Productos (Semanas 7-8)

#### Sprint 4.1: CRUD de Productos ✅
- [x] Agregar productos a lista
- [x] Editar productos de lista
- [x] Eliminar productos de lista
- [x] Marcar productos como comprados/pendientes
- [x] Cambiar cantidad de productos
- [x] Asignar categorías a productos
- [x] Arrastrar y soltar para reordenar
- [x] Tests de gestión de productos

#### Sprint 4.2: Búsqueda y Filtros
- [x] Buscador de productos en tiempo real
- [x] Filtros por categoría
- [x] Filtros por estado (comprado/pendiente)
- [ ] Ordenamiento (alfabético, fecha, categoría)
- [ ] Historial de productos comprados
- [ ] Sugerencias de productos
- [ ] Tests de búsqueda y filtros

### Fase 5: Funcionalidades IA (Semanas 9-10)

#### Sprint 5.1: Categorización Inteligente
- [ ] Integrar endpoint de categorización IA
- [ ] Auto-categorizar productos al agregarlos
- [ ] Sugerencias de categorías
- [ ] Feedback visual de categorización
- [ ] Cache de categorías en cliente
- [ ] Manejo de errores de IA
- [ ] Tests de integración con IA

#### Sprint 5.2: Recomendaciones
- [ ] Integrar endpoint de recomendaciones
- [ ] Mostrar productos sugeridos
- [ ] Agregar productos recomendados con un click
- [ ] Personalización de recomendaciones
- [ ] Historial de recomendaciones
- [ ] Tests de recomendaciones

### Fase 6: Notificaciones (Semanas 11-12)

#### Sprint 6.1: Sistema de Notificaciones
- [ ] Centro de notificaciones en UI
- [ ] Notificaciones en tiempo real (polling/SSE)
- [ ] Marcar notificaciones como leídas
- [ ] Eliminar notificaciones
- [ ] Badge de notificaciones no leídas
- [ ] Filtros de notificaciones
- [ ] Tests de notificaciones

#### Sprint 6.2: Tipos de Notificaciones
- [ ] Notificaciones de invitaciones
- [ ] Notificaciones de cambios en listas
- [ ] Notificaciones de productos agregados
- [ ] Notificaciones de productos comprados
- [ ] Configuración de preferencias
- [ ] Tests de tipos de notificaciones

### Fase 7: Optimización y Performance (Semanas 13-14)

#### Sprint 7.1: Optimización Cliente
- [ ] Implementar lazy loading de componentes
- [ ] Optimizar imágenes con next/image
- [ ] Implementar debouncing en búsquedas
- [ ] Implementar virtual scrolling para listas largas
- [ ] Code splitting estratégico
- [ ] Análisis de bundle size
- [ ] Optimización de Lighthouse score
- [ ] Tests de performance

#### Sprint 7.2: Caching y Estado
- [ ] Implementar React Query/SWR
- [ ] Cache de requests HTTP
- [ ] Optimistic updates
- [ ] Background refetching
- [ ] Estado persistente con localStorage
- [ ] Manejo de stale data
- [ ] Tests de caching

### Fase 8: Accesibilidad (WCAG 2.2) (Semana 15)

#### Sprint 8.1: Implementación A11y
- [ ] Auditoría de accesibilidad completa
- [ ] Navegación por teclado completa
- [ ] Roles ARIA correctos
- [ ] Alt text en todas las imágenes
- [ ] Contraste de colores WCAG AAA
- [ ] Screen reader testing
- [ ] Focus management
- [ ] Tests de accesibilidad automatizados

### Fase 9: Seguridad OWASP Top 10 (Semana 16)

#### Sprint 9.1: Hardening de Seguridad
- [ ] Implementar CSP headers estrictos
- [ ] Input sanitization en todos los formularios
- [ ] Protección XSS
- [ ] Protección CSRF
- [ ] Rate limiting en cliente
- [ ] Validación de datos con Zod
- [ ] Secure cookies (HttpOnly, Secure, SameSite)
- [ ] Auditoría de dependencias
- [ ] Tests de seguridad

### Fase 10: Testing y Calidad (Semana 17)

#### Sprint 10.1: Cobertura de Tests
- [ ] Tests unitarios (componentes UI)
- [ ] Tests de integración (features)
- [ ] Tests E2E con Playwright
- [ ] Tests de accesibilidad
- [ ] Tests de performance
- [ ] Coverage > 80%
- [ ] CI/CD con tests automatizados

### Fase 11: Deploy y Monitoreo (Semana 18)

#### Sprint 11.1: Despliegue
- [ ] Configurar Vercel/Netlify
- [ ] Variables de entorno de producción
- [ ] Configurar dominios
- [ ] SSL/TLS
- [ ] CDN para assets estáticos
- [ ] Implementar error tracking (Sentry)
- [ ] Implementar analytics
- [ ] Monitoreo de performance (Web Vitals)
- [ ] Documentación de deploy

## 🎯 Funcionalidades Principales

### Autenticación y Usuarios
- ✅ Registro de usuarios con validación
- ✅ Login con email/password
- ✅ Recuperación de contraseña
- ✅ Gestión de perfil de usuario
- ✅ Cambio de contraseña
- ✅ Sesiones seguras con JWT

### Gestión de Listas
- ✅ Crear listas de compras
- ✅ Editar información de listas
- ✅ Eliminar listas
- ✅ Ver listado de todas las listas
- ✅ Buscar y filtrar listas
- ✅ Compartir listas con otros usuarios
- ✅ Gestionar permisos de colaboradores (admin, editor, viewer)

### Gestión de Productos
- ✅ Agregar productos a listas
- ✅ Editar productos
- ✅ Eliminar productos
- ✅ Marcar productos como comprados
- ✅ Cambiar cantidades
- ✅ Categorizar productos
- ✅ Reordenar con arrastrar y soltar
- ✅ Buscar productos en lista
- ✅ Navegar productos paginados con controles accesibles

### Inteligencia Artificial
- ✅ Categorización automática de productos
- ✅ Recomendaciones de productos
- ✅ Sugerencias inteligentes basadas en historial

### Notificaciones
- ✅ Notificaciones de invitaciones a listas
- ✅ Notificaciones de cambios en listas
- ✅ Centro de notificaciones
- ✅ Badges de notificaciones no leídas

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests de accesibilidad
npm run test:a11y
```

## 📚 Documentación

- [agents.md](./docs/agents.md) - Guía para desarrollo con Claude/Cursor
- [GEMINI.md](./docs/GEMINI.md) - Guía para desarrollo con Gemini CLI
- [casos_de_uso.md](./docs/casos_de_uso.md) - Casos de uso detallados
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura del proyecto
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) - Guía de contribución

## 🔒 Seguridad

Este proyecto implementa las mejores prácticas de seguridad siguiendo OWASP Top 10:

- ✅ Content Security Policy (CSP)
- ✅ HTTPS obligatorio
- ✅ Cookies seguras (HttpOnly, Secure, SameSite)
- ✅ Input sanitization
- ✅ Protección XSS
- ✅ Protección CSRF
- ✅ Rate limiting
- ✅ Validación de datos con Zod
- ✅ Dependencias auditadas

## 🎨 Principios de Diseño

- **Mobile-first**: Diseño responsivo desde móvil
- **Accesibilidad**: WCAG 2.2 Nivel AA
- **Performance**: Core Web Vitals optimizados
- **Progressive Enhancement**: Funciona sin JavaScript
- **Dark Mode**: Soporte de tema oscuro

## 📄 Licencia

MIT

## 🤝 Contribuir

Ver [CONTRIBUTING.md](./docs/CONTRIBUTING.md)

## 📧 Contacto

- GitHub: [@elkangri23](https://github.com/elkangri23)
- Backend: [listaCompra](https://github.com/elkangri23/listaCompra)
