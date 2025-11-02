# casos_de_uso.md - Casos de uso del frontend listaCompra

## 1. Autenticación y Usuarios

- [x] Como usuario, puedo registrarme con email y contraseña para tener una cuenta segura.
- [ ] Como usuario, puedo iniciar sesión y cerrar sesión de forma segura usando NextAuth.js y JWT.
- [ ] Como usuario, puedo recuperar mi contraseña mediante email.
- [ ] Como usuario, puedo editar mi perfil, cambiar nombre, email o contraseña.
- [ ] Como usuario, puedo ver mi perfil y cerrar sesión desde cualquier dispositivo.

## 2. Gestión de Listas Colaborativas

- [ ] Como usuario autenticado, puedo crear una lista de la compra.
- [ ] Como usuario, puedo ver todas mis listas y sus productos asociados.
- [ ] Como usuario, puedo invitar a otros por email a una lista específica.
- [ ] Como usuario, puedo aceptar o rechazar invitaciones de otras personas.
- [ ] Como propietario/admin, puedo asignar o quitar permisos a colaboradores en una lista.
- [ ] Como colaborador, puedo agregar, editar o eliminar productos en una lista compartida si tengo permiso.
- [ ] Como usuario, puedo ver cambios en tiempo real (reactivo) en una lista compartida si alguien la actualiza.

## 3. Gestión de Productos y Categorías

- [ ] Como usuario, puedo agregar productos a una lista existente.
- [ ] Como usuario, puedo editar nombre, cantidad, y categoría de un producto.
- [ ] Como usuario, puedo eliminar productos de una lista.
- [ ] Como usuario, puedo arrastrar y soltar productos para reordenarlos.
- [ ] Como usuario, puedo marcar productos como comprados o pendientes.
- [ ] Como usuario, puedo filtrar o buscar productos por nombre, estado o categoría.
- [ ] Como usuario, puedo consultar el histórico de productos comprados en listas pasadas.

## 4. Inteligencia Artificial en la Interfaz

- [ ] Como usuario, al añadir un producto, la IA categoriza automáticamente el producto y sugiere una categoría.
- [ ] Como usuario, recibo sugerencias de productos y listas frecuentes, gracias a IA.
- [ ] Como usuario, recibo recomendaciones personalizadas según mi historial.
- [ ] Como usuario, veo feedback visual cuando la IA categoriza productos o recomienda acciones.

## 5. Notificaciones y Colaboración

- [ ] Como usuario, recibo notificaciones en la aplicación cuando soy invitado a una lista o esta es modificada.
- [ ] Como usuario, veo un badge de notificaciones no leídas.
- [ ] Como usuario, puedo marcar notificaciones como leídas o eliminarlas.
- [ ] Como usuario, puedo gestionar mis preferencias de notificaciones.

## 6. Accesibilidad y Usabilidad

- [ ] Como usuario con discapacidad, puedo navegar el sitio completamente vía teclado y screen reader.
- [ ] Como usuario, recibo feedback accesible (aria-live, roles ARIA, colors WCAG 2.2 AAA).
- [ ] Como usuario, todas las imágenes presentan alt descriptivo.
- [ ] Como usuario, el enfoque (focus) es visible y no se pierde en ningún punto de la navegación.

## 7. Seguridad

- [x] Como usuario, todos mis datos están protegidos con HTTPS, CSP, protección XSS y CSRF.
- [ ] Como usuario, los formularios sanitizan y validan entrada del lado cliente antes de enviarse.
- [ ] Como usuario, los tokens y cookies se guardan de forma segura (HttpOnly, SameSite, Secure).

## 8. Tests, Calidad y Monitorización

- [x] Como desarrollador, puedo ejecutar tests unitarios, integración y E2E locales y en pipelines.
- [x] Como desarrollador, puedo ver métricas de cobertura de tests y recibir feedback para optimización.
- [ ] Como developer, sistemas de error tracking (Sentry) reportan errores de frontend automáticamente.

## 9. Performance y Optimización

- [ ] Como usuario, la aplicación carga rápido y responde ágilmente aun en conexiones lentas.
- [ ] Como usuario, puedo ver imágenes optimizadas y usar la app en móviles o desktop sin problemas.
- [ ] Como usuario, el sitio soporta dark mode y progresive enhancement (funciona sin JS crítico).

## 10. Recursos de Desarrollo

- [ ] Como desarrollador, puedo encontrar el código base de las páginas y una imagen de cómo se verían en la carpeta `infoDoc/moockup_funcionalidad`.
- [ ] Como desarrollador, puedo encontrar toda la información del proyecto, incluyendo el contexto del backend, en la carpeta `infoDoc/Docs`.

