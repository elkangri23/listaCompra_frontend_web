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
  
  // Patrón 100/80/0: Coverage thresholds personalizados
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 70,
      functions: 75,
      lines: 75,
    },
    // CRÍTICOS - 100% coverage requerido
    './src/features/auth/**/*.{ts,tsx}': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/features/*/services/*.{ts,tsx}': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    './src/lib/security/**/*.{ts,tsx}': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    // SECUNDARIOS - 80% coverage requerido
    './src/features/*/hooks/*.{ts,tsx}': {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    './src/features/*/components/*.{tsx}': {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
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
  ],
  
  // Rutas de tests
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.spec.{ts,tsx}',
  ],
  
  // Configuración adicional
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
}

module.exports = createJestConfig(customJestConfig)