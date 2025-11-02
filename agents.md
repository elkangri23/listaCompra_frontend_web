# agents.md - Guía de desarrollo frontend Next.js para colaboradores y agentes CLI

## 1. Principios Fundamentales

- **SOLID**: Aplica los principios SOLID en componentes, hooks y servicios. Mantén cada módulo enfocado en una responsabilidad.
- **Clean Code**: Refactoriza, nombra con intención y reduce duplicidad de código.
- **Accesibilidad**: Cumple WCAG 2.2 AA, usa semantic HTML, alt text, roles ARIA, navegación por teclado y gestiona el foco.
- **Seguridad**: Cumple OWASP Top 10, sanitiza entradas, usa CSP headers, protege contra XSS/CSRF, y audita dependencias.

## 2. Buenas Prácticas

- **Estructura escalable**: Usa grupos de rutas (Next.js App Router), componentes atómicos y carpetas separadas por dominio.
- **Componentes desacoplados**: Cada componente solo debe recibir los props mínimos y no tener lógica de negocio interna.
- **Hooks personalizados**: Implementa lógica reutilizable en custom hooks con estado desacoplado.
- **Estilos en Tailwind**: Usa utilidades de Tailwind y evita CSS global. Utiliza shadcn/ui, daisyUI o Radix UI para componentes accesibles.
- **Testing**: Aplica tests unitarios con Jest y React Testing Library, tests E2E con Playwright. Cobertura mínima 80%.
- **Deploy seguro**: Deploy en Vercel/Netlify con HTTPS. Usa variables .env.local y bloquea secretos.
- **CI/CD**: Automatiza lint, tests y auditoría de dependencias en cada push.

## 3. Accesibilidad y Usabilidad

- Etiqueta correctamente: Usar <main>, <nav>, <header>, <footer>, roles ARIA.
- Administrar foco: Implementa manejo de foco en modales y overlays.
- Contraste alto: Escala de colores aceptable por WCAG AAA.
- Alt text: Todas las imágenes y iconos deben tener texto alternativo descriptivo.
- Navegación con teclado: Sin trampas de foco ni elementos inaccesibles.
- Responsive: Mobile first y viewport bien definido.

## 4. Seguridad OWASP Top 10

- CSP headers restrictivos en next.config.js
- Input sanitization en formularios
- Validación de datos con Zod en frontend antes del POST
- Protección contra XSS (no HTML insertado, escape outputs)
- Protección CSRF (cabeceras custom, tokens si aplica)
- Rate limiting amigable en frontend (evitar spam)
- Autenticación robusta (JWT, cookies seguras)
- Auditoría de dependencias npm, actualizaciones periódicas
- Headers de seguridad extra: X-Frame-Options, Referrer-Policy, X-Content-Type-Options, Permissions-Policy

## 5. Tecnologías

- Next.js 15, App Router
- TypeScript 5.x
- Tailwind CSS 4.x
- shadcn/ui, daisyUI, Radix UI
- Jest, React Testing Library, Playwright
- NextAuth.js v5
- Zod
- Axios
- ESLint + Prettier
- Husky + lint-staged
- Sentry (monitoreo de errores)

## 6. Testing

- **Unitario**: Componentes, hooks y lógica pure JS
- **Integración**: Flujos de usuario, datos mockeados
- **E2E**: Flujos completos con Playwright
- **Accesibilidad automatizada**: Axe, ESLint-plugin-jsx-a11y

## 7. Referencias

- [WCAG 2.2 Guidelines]
- [OWASP Top 10 2025]
- [Next.js docs]
- [Tailwind docs]
- [shadcn/ui docs]
- [Playwright docs]
- [Jest docs]
- [ESLint-plugin-jsx-a11y]

