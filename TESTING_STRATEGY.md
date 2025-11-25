# 🧪 Estrategia de Testing - Patrón 100/80/0

**Fecha**: 25 de noviembre de 2025  
**Proyecto**: Lista de la Compra Colaborativa  
**Framework**: Jest + React Testing Library + Playwright

---

## 📊 Patrón 100/80/0

### Definición:
- **100%**: Componentes críticos (seguridad, datos, transacciones)
- **80%**: Componentes secundarios (UI interactiva, formularios)
- **0%**: Componentes triviales (presentacionales puros, layouts simples)

---

## 🎯 CATEGORIZACIÓN DE COMPONENTES

### 🔴 CRÍTICOS - Coverage 100% (Prioridad Alta)

#### Seguridad y Autenticación:
- ✅ `src/features/auth/components/login-form.tsx`
- ✅ `src/features/auth/components/register-form.tsx`
- ✅ `src/features/auth/services/auth-service.ts`
- ✅ `src/lib/security/advanced-security.ts`

#### Gestión de Datos Críticos:
- ✅ `src/features/lists/services/list-service.ts`
- ✅ `src/features/products/services/product-service.ts`
- ✅ `src/features/invitations/services/invitation-service.ts`
- ✅ `src/features/invitations/components/share-list-dialog.tsx`

#### Lógica de Negocio:
- ✅ `src/features/lists/hooks/use-lists.ts`
- ✅ `src/features/products/hooks/use-products.ts`
- ✅ `src/features/invitations/hooks/use-invitations.ts`
- ✅ `src/features/blueprints/hooks/use-blueprints.ts`

#### IA y Procesamiento:
- ✅ `src/features/ai/services/ai-service.ts`
- ✅ `src/features/ai/hooks/use-ai.ts`
- ✅ `src/features/ai/components/bulk-categorization-dialog.tsx`

#### Admin y Permisos:
- ✅ `src/features/admin/services/admin-service.ts`
- ✅ `src/features/admin/hooks/use-admin-users.ts`

**Total Críticos**: 17 archivos

---

### 🟡 SECUNDARIOS - Coverage 80% (Prioridad Media)

#### Componentes Interactivos:
- ⚠️ `src/features/products/components/products-kanban.tsx`
- ⚠️ `src/features/ai/components/occasion-list-dialog.tsx`
- ⚠️ `src/features/ai/components/recommendations-panel.tsx`
- ⚠️ `src/features/blueprints/components/create-blueprint-from-list-dialog.tsx`
- ⚠️ `src/features/blueprints/components/blueprint-card.tsx`

#### Formularios y Validaciones:
- ⚠️ `src/features/categories/components/category-form.tsx`
- ⚠️ `src/features/stores/components/store-form.tsx`
- ⚠️ `src/features/invitations/components/collaborators-section.tsx`

#### Páginas Principales:
- ⚠️ `src/app/(auth)/lists/[id]/page.tsx`
- ⚠️ `src/app/(auth)/dashboard/page.tsx`
- ⚠️ `src/app/(auth)/notifications/page.tsx`
- ⚠️ `src/app/(auth)/templates/page.tsx`

#### Hooks Secundarios:
- ⚠️ `src/features/categories/hooks/use-categories.ts`
- ⚠️ `src/features/stores/hooks/use-stores.ts`
- ⚠️ `src/features/notifications/hooks/use-notifications.ts`
- ⚠️ `src/features/lists/hooks/use-collaboration.ts`

**Total Secundarios**: 15 archivos

---

### ⚪ TRIVIALES - Coverage 0% (Sin tests)

#### Componentes Presentacionales:
- ⭕ `src/components/ui/button.tsx` (shadcn/ui)
- ⭕ `src/components/ui/card.tsx` (shadcn/ui)
- ⭕ `src/components/ui/badge.tsx` (shadcn/ui)
- ⭕ `src/components/ui/input.tsx` (shadcn/ui)
- ⭕ `src/components/ui/dialog.tsx` (shadcn/ui)
- ⭕ Todos los componentes shadcn/ui (ya testeados por la librería)

#### Layouts Simples:
- ⭕ `src/components/layout/sidebar.tsx`
- ⭕ `src/components/layout/header.tsx`
- ⭕ `src/app/layout.tsx`

#### Utilidades Básicas:
- ⭕ `src/lib/utils.ts` (funciones simples de Tailwind)
- ⭕ `src/lib/design-tokens.ts`

#### Componentes Visuales:
- ⭕ `src/features/admin/components/system-metrics-dashboard.tsx` (solo presentacional)
- ⭕ `src/features/admin/components/system-health-panel.tsx` (solo presentacional)
- ⭕ `src/features/invitations/components/security-indicators.tsx` (solo badges)

**Total Triviales**: ~25 archivos (no requieren tests)

---

## 🧪 PLAN DE IMPLEMENTACIÓN

### Fase 1: Tests Críticos (100%) - 2 días
**Prioridad: ALTA**

```bash
tests/
├── unit/
│   ├── services/
│   │   ├── auth-service.test.ts ✅
│   │   ├── list-service.test.ts ✅
│   │   ├── product-service.test.ts ✅
│   │   ├── invitation-service.test.ts ✅
│   │   ├── ai-service.test.ts ✅
│   │   └── admin-service.test.ts ✅
│   ├── hooks/
│   │   ├── use-lists.test.tsx ✅
│   │   ├── use-products.test.tsx ✅
│   │   ├── use-invitations.test.tsx ✅
│   │   ├── use-ai.test.tsx ✅
│   │   └── use-admin-users.test.tsx ✅
│   ├── security/
│   │   └── advanced-security.test.ts ✅
│   └── components/
│       ├── login-form.test.tsx ✅
│       ├── register-form.test.tsx ✅
│       ├── share-list-dialog.test.tsx ✅
│       └── bulk-categorization-dialog.test.tsx ✅
```

### Fase 2: Tests Secundarios (80%) - 2 días
**Prioridad: MEDIA**

```bash
tests/
├── integration/
│   ├── list-detail-page.test.tsx ⚠️
│   ├── dashboard-page.test.tsx ⚠️
│   ├── notifications-page.test.tsx ⚠️
│   └── templates-page.test.tsx ⚠️
├── components/
│   ├── products-kanban.test.tsx ⚠️
│   ├── occasion-list-dialog.test.tsx ⚠️
│   ├── recommendations-panel.test.tsx ⚠️
│   └── blueprint-components.test.tsx ⚠️
└── hooks/
    ├── use-categories.test.tsx ⚠️
    ├── use-stores.test.tsx ⚠️
    └── use-collaboration.test.tsx ⚠️
```

### Fase 3: Tests E2E (flujos críticos) - 1 día
**Prioridad: MEDIA**

```bash
tests/
└── e2e/
    ├── auth-flow.spec.ts ⚠️
    ├── create-list-flow.spec.ts ⚠️
    ├── share-list-flow.spec.ts ⚠️
    └── ai-categorization-flow.spec.ts ⚠️
```

---

## 📋 CONFIGURACIÓN DE JEST

### jest.config.js (actualizado)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: [
    '/node_modules/(?!next-auth|@auth/core)/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Coverage thresholds por patrón 100/80/0
  coverageThresholds: {
    global: {
      statements: 70,
      branches: 65,
      functions: 70,
      lines: 70,
    },
  },
  collectCoverageFrom: [
    // CRÍTICOS - 100% coverage
    'src/features/auth/**/*.{ts,tsx}',
    'src/features/*/services/*.{ts,tsx}',
    'src/features/*/hooks/use-*.{ts,tsx}',
    'src/lib/security/**/*.{ts,tsx}',
    
    // SECUNDARIOS - 80% coverage
    'src/features/*/components/*.{tsx}',
    'src/app/(auth)/**/page.{tsx}',
    
    // EXCLUIR triviales
    '!src/components/ui/**',
    '!src/components/layout/**',
    '!src/app/layout.tsx',
    '!src/lib/utils.ts',
    '!src/lib/design-tokens.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/*.d.ts',
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

---

## 🎯 MÉTRICAS OBJETIVO

### Coverage Esperado:

| Categoría | Archivos | Coverage Objetivo | Status |
|-----------|----------|-------------------|--------|
| **Críticos** | 17 | 100% | 🔴 Pendiente |
| **Secundarios** | 15 | 80% | 🟡 Pendiente |
| **Triviales** | 25 | 0% (excluidos) | ⚪ N/A |
| **TOTAL** | 32 con tests | ~85% promedio | ⏳ En proceso |

### Comandos de Testing:

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch

# Tests E2E con Playwright
npm run test:e2e

# Tests unitarios solamente
npm test -- --testPathPattern=unit

# Tests de integración solamente
npm test -- --testPathPattern=integration
```

---

## 📝 EJEMPLO DE TEST CRÍTICO

### Ejemplo: `tests/unit/services/list-service.test.ts`

```typescript
import { listService } from '@/features/lists/services/list-service';
import { axiosInstance } from '@/lib/api/axios-instance';

jest.mock('@/lib/api/axios-instance');

describe('listService (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLists', () => {
    it('debe obtener listas del usuario con paginación', async () => {
      const mockResponse = {
        data: {
          items: [
            { id: '1', nombre: 'Lista 1', descripcion: 'Desc 1' },
            { id: '2', nombre: 'Lista 2', descripcion: 'Desc 2' },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await listService.getLists({ page: 1, limit: 10 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/lists', {
        params: { page: 1, limit: 10 },
      });
      expect(result.items).toHaveLength(2);
      expect(result.items[0].nombre).toBe('Lista 1');
    });

    it('debe manejar errores de red', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await expect(listService.getLists()).rejects.toThrow('Network error');
    });
  });

  describe('createList', () => {
    it('debe crear una nueva lista', async () => {
      const newList = { nombre: 'Nueva Lista', tiendaId: 'store-1' };
      const mockResponse = {
        data: { id: 'new-id', ...newList, fechaCreacion: new Date() },
      };

      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await listService.createList(newList);

      expect(axiosInstance.post).toHaveBeenCalledWith('/lists', newList);
      expect(result.nombre).toBe('Nueva Lista');
    });

    it('debe rechazar nombres vacíos', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue({
        response: { status: 400, data: { message: 'Nombre requerido' } },
      });

      await expect(
        listService.createList({ nombre: '', tiendaId: 'store-1' })
      ).rejects.toMatchObject({
        response: { status: 400 },
      });
    });
  });

  // ... más tests para 100% coverage
});
```

---

## 🚀 PRÓXIMOS PASOS

### Día 1-2: Tests Críticos
1. ✅ Crear estructura de carpetas
2. ⏳ Implementar tests de servicios (6 archivos)
3. ⏳ Implementar tests de hooks críticos (5 archivos)
4. ⏳ Implementar tests de seguridad (1 archivo)
5. ⏳ Implementar tests de componentes críticos (4 archivos)

### Día 3-4: Tests Secundarios
1. ⏳ Tests de componentes interactivos (4 archivos)
2. ⏳ Tests de páginas principales (4 archivos)
3. ⏳ Tests de hooks secundarios (3 archivos)

### Día 5: E2E y CI/CD
1. ⏳ Configurar Playwright
2. ⏳ Implementar 4 flujos E2E críticos
3. ⏳ Configurar GitHub Actions para CI
4. ⏳ Verificar coverage en pipeline

---

**Estado actual**: Configuración lista, estructura definida  
**Próxima acción**: Implementar tests críticos (Fase 1)  
**Tiempo estimado**: 5 días de desarrollo
