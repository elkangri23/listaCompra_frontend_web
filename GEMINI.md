# GEMINI.md - Guía para Gemini CLI proyecto frontend

## Principios de implementación y configuración

- Seguir Clean Architecture y principios SOLID: todos los handlers, hooks y componentes deben ser desacoplados y tener una sola responsabilidad.
- Usar Next.js 15 con App Router y TypeScript 5.x como base arquitectónica.
- Usar Tailwind CSS 4.x en modo JIT y componentes accesibles (shadcn/ui, Radix UI, daisyUI) para diseño consistente.
- Configura Gemini CLI para rutinas de automatización: lint, formateo, testing, auditoría de dependencias y scripts de CI/CD.

## Buenas prácticas Gemini CLI

- Configura comandos para test unitarios (`npm test`), lint (`npm run lint`), build (`npm run build`) y acceso rápido a docs (`npm run docs`).
- Implementa scripts de pre-commit (husky + lint-staged) para validaciones automáticas de código y tests rápidos.
- Autenticación y protección JWT robusta desde Gemini scripts.
- Deploy seguro en Vercel/Netlify automatizado por Gemini pipelines.

## Accesibilidad y Seguridad

- Validar estructura semántica HTML en cada build, auditado por Gemini y ESLint-plugin-jsx-a11y.
- Ensure CSP headers, Referrer-Policy, Permissions-Policy y X-Content-Type-Options activos en next.config.js por Gemini.
- Gemini debe auditar dependencias npm semanalmente y bloquear vulnerables.

## Testing y calidad

- Ejecuta unit tests y E2E Playwright en todas los pipelines Gemini CI.
- Cobertura mínima 80%, reportes de cobertura visibles en cada push.
- Auditoría de dependencias semanal por Gemini scripts.

## Recursos de Desarrollo

- Como desarrollador, puedes encontrar el código base de las páginas y una imagen de cómo se verían en la carpeta `infoDoc/moockup_funcionalidad`.
- Como desarrollador, puedes encontrar toda la información del proyecto, incluyendo el contexto del backend, en la carpeta `infoDoc/Docs`.

## Referencias necesarias

- WCAG 2.2 guidelines y tooling Gemini A11y audit
- OWASP Top 10 2025 Gemini audit
- Next.js 15 docs
- Tailwind docs
- shadcn/ui docs
- Playwright y Jest docs

## Ejemplo de scripts Gemini

```json
{
  "scripts": {
    "lint": "next lint",
    "test": "jest",
    "build": "next build",
    "start": "next start",
    "audit": "npm audit --production",
    "a11y": "axe-ci src/"
  }
}
```

## Notas

- Todos los commits en main deben pasar tests y lint.
- Gemini auditará cambios en dependencias y publicará reportes automatizados.
- Error tracking activado con Sentry y alertas proactivas Gemini CLI.
