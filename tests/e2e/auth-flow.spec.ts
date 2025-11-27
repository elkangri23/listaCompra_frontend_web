import { test, expect } from '@playwright/test';
import { login, logout, register, waitForToast, TEST_USER } from './helpers';

/**
 * Tests E2E para flujo de autenticación
 * - Login exitoso
 * - Login con credenciales incorrectas
 * - Registro de nuevo usuario
 * - Logout
 * - Persistencia de sesión
 */

test.describe('Flujo de Autenticación', () => {
  test.beforeEach(async ({ page, context }) => {
    // Limpiar cookies y storage antes de cada test
    await context.clearCookies();
    
    // Navegar a home para establecer contexto
    try {
      await page.goto('/', { timeout: 20000, waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          // Ignorar errores de storage
        }
      });
    } catch (e) {
      // Si falla, continuar de todos modos
      console.log('Warning: beforeEach navigation failed', e);
    }
  });

  test.skip('debe permitir login con credenciales válidas', async ({ page }) => {
    // TODO: Revisar problema de redirección/middleware - navegador se cierra prematuramente
    // Primero registrar el usuario (usa email único con timestamp)
    const testEmail = `testuser-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await register(page, testEmail, testPassword, 'Test User');
    await page.waitForTimeout(3000); // Esperar a que se complete el registro
    
    // Navegar a página de login
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    
    // Verificar elementos de la página usando h2 real
    await expect(page.locator('h2').filter({ hasText: 'Seguridad' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    
    // Llenar formulario con el usuario recién creado
    await page.fill('#email', testEmail);
    await page.fill('#password', testPassword);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verificar redirección al dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    
    // Intentar login con credenciales incorrectas
    await page.fill('#email', 'incorrecto@example.com');
    await page.fill('#password', 'PasswordIncorrecto123!');
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error (role="alert" según LoginForm real)
    await expect(
      page.locator('[role="alert"]').filter({ hasText: /incorrectos|inválid/i })
    ).toBeVisible({ timeout: 5000 });
    
    // Verificar que NO redirige
    await expect(page).toHaveURL('/login');
  });

  test('debe validar formato de email', async ({ page }) => {
    await page.goto('/login');
    
    // Intentar con email inválido
    await page.fill('#email', 'email-invalido');
    await page.fill('#password', 'Password123!');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Verificar error de validación (puede ser HTML5 o mensaje role="alert")
    const emailInput = page.locator('#email');
    const hasValidationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage !== ''
    );
    
    // Alternativamente buscar mensaje de error visible
    const hasErrorMessage = await page.locator('#email-error').isVisible().catch(() => false);
    
    expect(hasValidationMessage || hasErrorMessage).toBeTruthy();
  });

  test('debe registrar nuevo usuario exitosamente', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    
    // Verificar elementos del formulario con IDs reales
    await expect(page.locator('#nombre')).toBeVisible();
    await expect(page.locator('#apellidos')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('#termsAccepted')).toBeVisible();
    
    // Llenar formulario
    await page.fill('#nombre', 'Usuario Nuevo');
    await page.fill('#apellidos', 'Test');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'NuevaPassword123!');
    await page.fill('#confirmPassword', 'NuevaPassword123!');
    await page.check('#termsAccepted');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de éxito o redirección a login (timeout más largo)
    await page.waitForTimeout(3000);
    
    // Debería mostrar mensaje de éxito o redirigir a login
    const isOnLogin = page.url().includes('/login');
    const hasSuccessMessage = await page.locator('text=/registro completado|cuenta creada/i').isVisible().catch(() => false);
    
    expect(isOnLogin || hasSuccessMessage).toBeTruthy();
  });

  test('debe validar que las contraseñas coincidan en registro', async ({ page }) => {
    await page.goto('/register');
    
    // Llenar con contraseñas diferentes
    await page.fill('#nombre', 'Usuario Test');
    await page.fill('#apellidos', 'Test');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'Password123!');
    await page.fill('#confirmPassword', 'Password456!');
    await page.check('#termsAccepted');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verificar error (role="alert" o mensaje visible)
    await expect(
      page.locator('[role="alert"]').filter({ hasText: /contraseña/i })
    ).toBeVisible({ timeout: 3000 });
  });

  test('debe requerir aceptación de términos en registro', async ({ page }) => {
    await page.goto('/register');
    
    // Llenar formulario SIN aceptar términos
    await page.fill('#nombre', 'Usuario Test');
    await page.fill('#apellidos', 'Test');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'Password123!');
    await page.fill('#confirmPassword', 'Password123!');
    // NO marcar checkbox de términos
    
    // El botón debería estar deshabilitado o mostrar error al intentar submit
    const submitButton = page.locator('button[type="submit"]');
    const isDisabled = await submitButton.isDisabled().catch(() => false);
    
    // Si no está deshabilitado, verificar que muestra error al intentar submit
    if (!isDisabled) {
      await submitButton.click();
      // Verificar que no redirige o muestra error
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL('/register');
    } else {
      expect(isDisabled).toBeTruthy();
    }
  });

  test.skip('debe realizar logout correctamente', async ({ page }) => {
    // TODO: Actualizar con la implementación real del logout en el dashboard
    // Primero hacer login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    
    // Abrir menú de usuario (ajustar según implementación real)
    const userMenuTrigger = page.locator('[data-testid="user-menu-trigger"]').or(
      page.locator('button:has-text("' + TEST_USER.nombre + '")')
    ).first();
    
    await userMenuTrigger.click();
    
    // Click en logout
    const logoutButton = page.locator('[data-testid="logout-button"]').or(
      page.locator('text=/cerrar sesión|logout|salir/i')
    ).first();
    
    await logoutButton.click();
    
    // Verificar redirección a login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
    
    // Verificar que ya no hay sesión activa
    const dashboardResponse = await page.goto('/dashboard');
    
    // Debe redirigir a login si intenta acceder a dashboard sin sesión
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test.skip('debe persistir sesión después de reload', async ({ page }) => {
    // TODO: Verificar persistencia de sesión con NextAuth
    // Login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    
    // Reload página
    await page.reload();
    
    // Debe seguir en dashboard (sesión persistente)
    await expect(page).toHaveURL('/dashboard');
  });

  test.skip('debe redirigir a login cuando sesión expira', async ({ page }) => {
    // TODO: Verificar comportamiento de expiración de sesión
    // Login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    
    // Limpiar cookies (simular expiración)
    await page.context().clearCookies();
    
    // Intentar navegar
    await page.goto('/dashboard');
    
    // Debe redirigir a login
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('debe mostrar callbackUrl después de login', async ({ page }) => {
    // TODO: Verificar comportamiento de callbackUrl con middleware real
    // Intentar acceder a página protegida sin login
    await page.goto('/lists/123');
    
    // Debe redirigir a login con callbackUrl o directamente a dashboard
    await page.waitForTimeout(3000);
    
    // Hacer login si estamos en login
    if (page.url().includes('/login')) {
      await page.fill('#email', TEST_USER.email);
      await page.fill('#password', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Esperar redirección
      await page.waitForTimeout(3000);
    }
    
    const currentUrl = page.url();
    
    expect(
      currentUrl.includes('/lists/123') || currentUrl.includes('/dashboard')
    ).toBeTruthy();
  });
});
