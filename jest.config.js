const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Timeout generoso: hay tests con animaciones/toasts de sonner que tardan
  // 3-4s y el default (5s) provoca flakiness con workers en paralelo
  testTimeout: 15000,
  transformIgnorePatterns: [
    '/node_modules/(?!next-auth|@auth/core)/',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Coverage thresholds
  // NOTA: se usan thresholds globales porque Jest aplica los thresholds por
  // globo a CADA archivo: los archivos de src/ aún sin tests (profile-form,
  // change-password-form, collaborator-service, etc.) los romperían.
  // Objetivo: subir el global a 75% completando el coverage pendiente
  // (ver TESTING_PROGRESS.md). Valores actuales con margen.
  coverageThreshold: {
    global: {
      statements: 45,
      branches: 50,
      functions: 45,
      lines: 45,
    },
  },
  
  // Recolección de coverage
  collectCoverageFrom: [
    // Incluir archivos críticos y secundarios
    'src/features/auth/**/*.{ts,tsx}',
    'src/features/*/services/*.{ts,tsx}',
    'src/features/*/hooks/*.{ts,tsx}',
    'src/features/*/components/*.{tsx}',
    'src/lib/security/**/*.{ts,tsx}',
    'src/app/(auth)/**/page.{tsx}',
    
    // Excluir triviales y archivos de configuración
    '!src/components/ui/**',
    '!src/components/layout/**',
    '!src/app/layout.tsx',
    '!src/app/**/layout.tsx',
    '!src/lib/utils.ts',
    '!src/lib/design-tokens.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // Excluir los tests co-ubicados en src/ (son código de test, no medible)
    '!**/__tests__/**',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
  ],
  
  // Rutas de tests
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}',
  ],

  // Los specs de Playwright (E2E) corren fuera de Jest
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/'],
  
  // Configuración adicional
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
}

module.exports = createJestConfig(customJestConfig)