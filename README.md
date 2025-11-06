# 🛒 Lista de la Compra Colaborativa - Frontend

**Sistema frontend moderno y escalable** construido con **Next.js 15**, **TypeScript** y **Tailwind CSS** siguiendo **arquitectura limpia** y **principios SOLID**.

## � Estado del Proyecto

**Última actualización**: 6 de noviembre de 2025  
**Progreso general**: ~50% completado  
**Fase actual**: Fase 3 - Gestión de Listas 📋 (Pendiente)

### ✅ Completado
- ✅ Configuración base de Next.js 15 con TypeScript
- ✅ Sistema de diseño con Tailwind CSS 4.x y componentes shadcn/ui
- ✅ Integración de tipos del backend mediante MCP servers
- ✅ Sistema de autenticación con NextAuth.js v5
- ✅ Páginas de login, registro y recuperación de contraseña
- ✅ Validación de formularios con Zod
- ✅ Configuración de seguridad (CSP, headers)
- ✅ Testing setup (Jest + React Testing Library)
- ✅ Dashboard protegido

### 🚧 En Progreso
- 🚧 Accesibilidad WCAG 2.2

### 🔜 Próximamente
- 🔜 Gestión de listas colaborativas (CRUD)
- 🔜 Gestión de productos y categorías
- 🔜 Funcionalidades de IA (categorización, recomendaciones)
- 🔜 Sistema de notificaciones en tiempo real

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

### Fase 2: Autenticación y Autorización ✅ (Completada)

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

#### Sprint 2.2: Gestión de Sesión y Perfiles ✅ (Completada)
- [x] Implementar dashboard protegido (/dashboard)
- [x] Crear página de perfil de usuario (/profile)
- [x] Implementar edición de perfil (nombre, email)
- [x] Implementar cambio de contraseña
- [x] Crear componente ProtectedRoute
- [x] Implementar logout con limpieza de sesión en cliente
- [x] Persistencia de sesión con cookies seguras (HttpOnly, SameSite, Secure) por NextAuth
- [x] Tests E2E de flujos de autenticación

### Fase 3: Gestión de Listas 📋 (Pendiente)

#### Sprint 3.1: CRUD de Listas
- [ ] Implementar listado de listas del usuario
- [ ] Crear nueva lista
- [ ] Editar información de lista
- [ ] Eliminar lista
- [ ] Vista detalle de lista
- [ ] Filtros y búsqueda de listas
- [ ] Paginación de resultados
- [ ] Tests de componentes de listas

#### Sprint 3.2: Colaboración en Listas
- [ ] Invitar usuarios a lista (por email)
- [ ] Aceptar/rechazar invitaciones
- [ ] Gestionar permisos de colaboradores
- [ ] Eliminar colaboradores
- [ ] Vista de miembros de lista
- [ ] Notificaciones de invitaciones
- [ ] Tests de flujos colaborativos

### Fase 4: Gestión de Productos (Semanas 7-8)

#### Sprint 4.1: CRUD de Productos
- [ ] Agregar productos a lista
- [ ] Editar productos de lista
- [ ] Eliminar productos de lista
- [ ] Marcar productos como comprados/pendientes
- [ ] Cambiar cantidad de productos
- [ ] Asignar categorías a productos
- [ ] Arrastrar y soltar para reordenar
- [ ] Tests de gestión de productos

#### Sprint 4.2: Búsqueda y Filtros
- [ ] Buscador de productos en tiempo real
- [ ] Filtros por categoría
- [ ] Filtros por estado (comprado/pendiente)
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
- ✅ Buscar productos en lista

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
