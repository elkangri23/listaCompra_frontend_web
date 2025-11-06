# casos_de_uso.md - Casos de uso del frontend listaCompra

## Estado del Proyecto: 🚧 En Desarrollo Activo

**Última actualización**: 9 de noviembre de 2025
**Progreso general**: ~70% completado
**Fase actual**: Fase 4.2 - Búsqueda y Filtros (En progreso)

---

## 1. Autenticación y Usuarios 🚧 (80% Completado)

- [x] **Como usuario, puedo registrarme con email y contraseña para tener una cuenta segura.**
  - ✅ Formulario de registro implementado con validación Zod
  - ✅ Página `/register` creada con diseño responsive
  - ✅ Integración con backend mediante auth-service
  
- [x] **Como usuario, puedo iniciar sesión de forma segura usando NextAuth.js y JWT.**
  - ✅ NextAuth.js v5 configurado con CredentialsProvider
  - ✅ LoginForm con validación y manejo de errores
  - ✅ Página `/login` con Suspense boundary
  - ✅ JWT tokens y refresh token implementados
  - ✅ Middleware de autenticación configurado
  
- [x] **Como usuario, puedo recuperar mi contraseña mediante email.**
  - ✅ ForgotPasswordForm implementado
  - ✅ Página `/forgot-password` creada
  - ✅ Validación de email con Zod
  
- [x] **Como usuario, puedo cerrar sesión de forma segura.**
  - ✅ Implementada función `signOut` de NextAuth.js
  - ✅ El estado de la sesión se limpia en el cliente
  - ✅ Redirección a la página de inicio tras cerrar sesión
  
- [ ] **Como usuario, puedo editar mi perfil, cambiar nombre, email o contraseña.**
  - 🔜 Pendiente: Página `/profile`
  - 🔜 Pendiente: Formulario de edición de perfil
  - 🔜 Pendiente: Cambio de contraseña
  
- [x] **Como usuario, puedo ver mi perfil desde cualquier dispositivo.**
  - ✅ Dashboard personalizado
  - 🔜 Pendiente: Vista de perfil responsive

## 2. Gestión de Listas Colaborativas 📋 (50% Completado)

- [x] **Como usuario autenticado, puedo crear una lista de la compra.**
  - ✅ Formulario de creación de listas
  - ✅ Integración con endpoint POST /lists
  
- [x] **Como usuario, puedo ver todas mis listas y sus productos asociados.**
  - ✅ Vista de listado de listas
  - ✅ Integración con endpoint GET /lists
  
- [ ] **Como usuario, puedo invitar a otros por email a una lista específica.**
  - 🔜 Pendiente: Modal de invitación
  - 🔜 Pendiente: Validación de emails
  
- [ ] **Como usuario, puedo aceptar o rechazar invitaciones de otras personas.**
  - 🔜 Pendiente: Centro de notificaciones
  - 🔜 Pendiente: Vista de invitaciones pendientes
  
- [ ] **Como propietario/admin, puedo asignar o quitar permisos a colaboradores en una lista.**
  - 🔜 Pendiente: Vista de gestión de colaboradores
  - 🔜 Pendiente: Sistema de roles y permisos
  
- [ ] **Como colaborador, puedo agregar, editar o eliminar productos en una lista compartida si tengo permiso.**
  - 🔜 Pendiente: Validación de permisos en frontend
  - 🔜 Pendiente: UI de gestión de productos
  
- [ ] **Como usuario, puedo ver cambios en tiempo real (reactivo) en una lista compartida si alguien la actualiza.**
  - 🔜 Pendiente: Implementar polling o SSE
  - 🔜 Pendiente: Optimistic updates

## 3. Gestión de Productos y Categorías 🛍️ (70% Completado)

- [x] **Como usuario, puedo agregar productos a una lista existente.**
  - ✅ Formulario accesible con validación Zod y soporte de categorías
  - ✅ Modal de creación rápida disponible en la vista de detalle de la lista

- [x] **Como usuario, puedo editar nombre, cantidad, y categoría de un producto.**
  - ✅ Modal de edición reutiliza el formulario con valores precargados
  - ✅ Validación inline y mensajes de error accesibles

- [x] **Como usuario, puedo eliminar productos de una lista.**
  - ✅ Acción directa desde la tabla con confirmación visual y estados de carga

- [x] **Como usuario, puedo arrastrar y soltar productos para reordenarlos.**
  - ✅ Soporte de drag & drop nativo con persistencia en backend
  - ✅ Indicadores visuales durante el arrastre

- [x] **Como usuario, puedo marcar productos como comprados o pendientes.**
  - ✅ Toggle accesible con badges de estado y seguimiento del backend

- [x] **Como usuario, puedo filtrar o buscar productos por nombre, estado o categoría.**
  - ✅ Barra de búsqueda con debounce a 400 ms
  - ✅ Filtros por estado (pendiente/comprado) y categoría

- [x] **Como usuario, puedo navegar productos paginados con controles accesibles.**
  - ✅ Enlaces de paginación con estados deshabilitados y etiquetas para lectores de pantalla
  - ✅ Prevención de cambios cuando se alcanza la primera o última página

- [ ] **Como usuario, puedo consultar el histórico de productos comprados en listas pasadas.**
  - 🔜 Pendiente: Vista de historial
  - 🔜 Pendiente: Estadísticas de compras

## 4. Inteligencia Artificial en la Interfaz 🤖 (0% Completado)

- [ ] **Como usuario, al añadir un producto, la IA categoriza automáticamente el producto y sugiere una categoría.**
  - 🔜 Pendiente: Integración con endpoint /ai/categorize
  - 🔜 Pendiente: UI de sugerencias de categoría
  
- [ ] **Como usuario, recibo sugerencias de productos y listas frecuentes, gracias a IA.**
  - 🔜 Pendiente: Widget de sugerencias
  - 🔜 Pendiente: Integración con endpoint /ai/suggestions
  
- [ ] **Como usuario, recibo recomendaciones personalizadas según mi historial.**
  - 🔜 Pendiente: Panel de recomendaciones
  - 🔜 Pendiente: Algoritmo de personalización
  
- [ ] **Como usuario, veo feedback visual cuando la IA categoriza productos o recomienda acciones.**
  - 🔜 Pendiente: Animaciones de IA trabajando
  - 🔜 Pendiente: Tooltips informativos

## 5. Notificaciones y Colaboración 🔔 (0% Completado)

- [ ] **Como usuario, recibo notificaciones en la aplicación cuando soy invitado a una lista o esta es modificada.**
  - 🔜 Pendiente: Centro de notificaciones
  - 🔜 Pendiente: Polling o SSE para updates
  
- [ ] **Como usuario, veo un badge de notificaciones no leídas.**
  - 🔜 Pendiente: Badge en navbar
  - 🔜 Pendiente: Contador en tiempo real
  
- [ ] **Como usuario, puedo marcar notificaciones como leídas o eliminarlas.**
  - 🔜 Pendiente: Acciones de notificación
  - 🔜 Pendiente: Batch operations
  
- [ ] **Como usuario, puedo gestionar mis preferencias de notificaciones.**
  - 🔜 Pendiente: Página de configuración
  - 🔜 Pendiente: Preferencias por tipo de notificación

## 6. Accesibilidad y Usabilidad ♿ (60% Completado)

- [x] **Como usuario con discapacidad, puedo navegar el sitio completamente vía teclado.**
  - ✅ Componentes focusables con Radix UI
  - ✅ Navegación por teclado implementada
  - 🔜 Pendiente: Atajos de teclado globales
  
- [x] **Como usuario, recibo feedback accesible (aria-live, roles ARIA, colors WCAG 2.2 AAA).**
  - ✅ Sistema de colores con contraste alto
  - ✅ Roles ARIA en componentes base
  - 🔜 Pendiente: Auditoría completa WCAG 2.2
  
- [x] **Como usuario, todas las imágenes presentan alt descriptivo.**
  - ✅ Alt text en componentes de imagen
  - ✅ Iconos con aria-labels
  
- [x] **Como usuario, el enfoque (focus) es visible y no se pierde en ningún punto de la navegación.**
  - ✅ Focus rings configurados en Tailwind
  - ✅ Focus management en modales
  - 🔜 Pendiente: Focus trap en overlays

## 7. Seguridad 🔒 (80% Completado)

- [x] **Como usuario, todos mis datos están protegidos con HTTPS, CSP, protección XSS y CSRF.**
  - ✅ CSP headers configurados en next.config.js
  - ✅ Security headers (X-Frame-Options, X-Content-Type-Options)
  - ✅ Protección XSS mediante escape de outputs
  - 🔜 Pendiente: Rate limiting en cliente
  
- [x] **Como usuario, los formularios sanitizan y validan entrada del lado cliente antes de enviarse.**
  - ✅ Validación con Zod en todos los formularios
  - ✅ Sanitización de inputs
  - ✅ Manejo de errores de validación
  
- [x] **Como usuario, los tokens y cookies se guardan de forma segura (HttpOnly, SameSite, Secure).**
  - ✅ NextAuth configurado con cookies seguras
  - ✅ Tokens en cookies HttpOnly
  - 🔜 Pendiente: Implementar SameSite=Strict

## 8. Tests, Calidad y Monitorización 🧪 (40% Completado)

- [x] **Como desarrollador, puedo ejecutar tests unitarios, integración y E2E locales y en pipelines.**
  - ✅ Jest configurado
  - ✅ React Testing Library configurado
  - ✅ Scripts de test en package.json
  - 🔜 Pendiente: Playwright para E2E
  - 🔜 Pendiente: CI/CD pipeline
  
- [x] **Como desarrollador, puedo ver métricas de cobertura de tests y recibir feedback para optimización.**
  - ✅ Coverage reports con Jest
  - 🔜 Pendiente: Coverage threshold (80%)
  - 🔜 Pendiente: Tests de componentes UI
  
- [ ] **Como developer, sistemas de error tracking (Sentry) reportan errores de frontend automáticamente.**
  - 🔜 Pendiente: Integración con Sentry
  - 🔜 Pendiente: Source maps en producción
  - 🔜 Pendiente: Error boundaries

## 9. Performance y Optimización ⚡ (30% Completado)

- [x] **Como usuario, la aplicación carga rápido y responde ágilmente.**
  - ✅ Next.js con App Router (SSR/SSG)
  - ✅ Code splitting automático
  - 🔜 Pendiente: Lazy loading de componentes
  - 🔜 Pendiente: React Query para caching
  
- [ ] **Como usuario, puedo ver imágenes optimizadas y usar la app en móviles o desktop sin problemas.**
  - 🔜 Pendiente: next/image optimization
  - 🔜 Pendiente: Responsive design completo
  - 🔜 Pendiente: PWA capabilities
  
- [x] **Como usuario, el sitio soporta dark mode.**
  - ✅ ThemeToggle implementado
  - ✅ CSS variables para temas
  - ✅ Persistencia de preferencia
  
- [ ] **Como usuario, la app funciona sin JS crítico (progressive enhancement).**
  - 🔜 Pendiente: Server Components donde sea posible
  - 🔜 Pendiente: Fallbacks sin JS

## 10. Recursos de Desarrollo 📚 (100% Completado)

- [x] **Como desarrollador, puedo encontrar el código base de las páginas y una imagen de cómo se verían en la carpeta `infoDoc/moockup_funcionalidad`.**
  - ✅ Mockups disponibles en `/InfoDoc/moockup_funcionalidad/`
  - ✅ HTML de referencia para cada página
  
- [x] **Como desarrollador, puedo encontrar toda la información del proyecto, incluyendo el contexto del backend, en la carpeta `infoDoc/Docs`.**
  - ✅ Documentación completa en `/InfoDoc/Docs/`
  - ✅ API endpoints documentados
  - ✅ Guías de contribución y deployment
  - ✅ Diagramas de arquitectura

---

## 📊 Resumen de Progreso por Módulo

| Módulo | Progreso | Estado |
|--------|----------|--------|
| 1. Autenticación | 80% | 🚧 En progreso |
| 2. Listas | 50% | 🚧 En progreso |
| 3. Productos | 0% | 🔜 Pendiente |
| 4. IA | 0% | 🔜 Pendiente |
| 5. Notificaciones | 0% | 🔜 Pendiente |
| 6. Accesibilidad | 60% | 🚧 En progreso |
| 7. Seguridad | 80% | 🚧 En progreso |
| 8. Tests | 40% | 🚧 En progreso |
| 9. Performance | 30% | 🚧 En progreso |
| 10. Recursos | 100% | ✅ Completado |

**Progreso Total**: ~60% completado

---

## 🎯 Próximos Pasos (Sprint Actual)

### Sprint 3.2: Colaboración en Listas
1. Invitar usuarios a lista (por email)
2. Aceptar/rechazar invitaciones
3. Gestionar permisos de colaboradores
4. Eliminar colaboradores
5. Vista de miembros de lista