import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para tests E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Timeout por test */
  timeout: 90 * 1000,
  
  /* Configuración de expect */
  expect: {
    timeout: 5000,
  },
  
  /* Ejecutar tests en paralelo */
  fullyParallel: true,
  
  /* Fallar build en CI si dejaste test.only */
  forbidOnly: !!process.env.CI,
  
  /* Reintentos solo en CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers en paralelo */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter - usar HTML localmente, GitHub Actions en CI */
  reporter: process.env.CI 
    ? 'github' 
    : [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
      ],
  
  /* Configuración compartida para todos los proyectos */
  use: {
    /* URL base para usar en navegación */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

    /* Viewport de escritorio grande: el layout del detalle de lista necesita ~1400px */
    viewport: { width: 1600, height: 900 },
    
    /* Recopilar trace en fallo */
    trace: 'on-first-retry',
    
    /* Screenshot en fallo */
    screenshot: 'only-on-failure',
    
    /* Video en fallo */
    video: 'retain-on-failure',
    
    /* Timeout para acciones (click, fill, etc) */
    actionTimeout: 10 * 1000,
    
    /* Timeout para navegación */
    navigationTimeout: 30 * 1000,
  },

  /* Configurar proyectos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Viewport de escritorio grande: el layout del detalle de lista necesita ~1400px
           (nav 80px + main 920px + sidebar 360px). El device descriptor fija 1280x720,
           donde el sidebar tapa el botón "Añadir Producto". */
        viewport: { width: 1600, height: 900 },
      },
    },

    // Descomentar para probar en más navegadores
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test en mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  /* Servidores de desarrollo - iniciar antes de ejecutar tests */
  webServer: [
    {
      /* Mock del backend API (no requiere base de datos) */
      command: 'node tests/e2e/mock-api-server.mjs',
      url: 'http://localhost:3333/api/v1/lists',
      reuseExistingServer: !process.env.CI,
      timeout: 90 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      /* Build de producción: evita los cuelgues de compilación on-demand de next dev */
      command: 'npm run build && npm run start',
      url: 'http://localhost:3000/login',
      reuseExistingServer: !process.env.CI,
      timeout: 900 * 1000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],});
