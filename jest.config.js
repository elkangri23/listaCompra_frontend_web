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
  transformIgnorePatterns: ['/node_modules/(?!next-auth|@auth/core)/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Coverage thresholds
  // Actual: 99.66% statements / 93.94% branches / 99.7% functions / 99.81% lines.
  // Thresholds con margen mínimo; el goal es 100/95 a medida que se cubran
  // las ramas defensivas restantes (optimistic updates, errores de red).
  coverageThreshold: {
    global: {
      statements: 99,
      branches: 92,
      functions: 99,
      lines: 99,
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
    // Los barrels (index.ts) solo reexportan símbolos; su cobertura es medible pero no significativa
    '!src/**/index.ts',
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
