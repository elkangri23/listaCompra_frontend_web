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
  test.beforeEach(async ({ page }) => {
    // Limpiar cookies y localStorage antes de cada test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('debe permitir login con credenciales válidas', async ({ page }) => {
    // Navegar a página de login
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    
    // Verificar elementos de la página
    await expect(page.locator('h1')).toContainText(/iniciar sesión|login/i);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Llenar formulario
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verificar redirección al dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
    
    // Verificar que se muestra contenido autenticado
    await expect(page.locator('text=/mis listas|listas de compra/i')).toBeVisible();
  });

  test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');
    
    // Intentar login con credenciales incorrectas
    await page.fill('input[name="email"]', 'incorrecto@example.com');
    await page.fill('input[name="password"]', 'PasswordIncorrecto123!');
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error
    await expect(
      page.locator('text=/credenciales inválidas|usuario o contraseña incorrectos/i')
    ).toBeVisible({ timeout: 5000 });
    
    // Verificar que NO redirige
    await expect(page).toHaveURL('/login');
  });

  test('debe validar formato de email', async ({ page }) => {
    await page.goto('/login');
    
    // Intentar con email inválido
    await page.fill('input[name="email"]', 'email-invalido');
    await page.fill('input[name="password"]', 'Password123!');
    
    // Click submit
    await page.click('button[type="submit"]');
    
    // Verificar error de validación HTML5 o mensaje custom
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    
    expect(validationMessage).toBeTruthy();
  });

  test('debe registrar nuevo usuario exitosamente', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    
    await page.goto('/register');
    await expect(page).toHaveURL('/register');
    
    // Verificar elementos del formulario
    await expect(page.locator('input[name="nombre"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('input[name="aceptaTerminos"]')).toBeVisible();
    
    // Llenar formulario
    await page.fill('input[name="nombre"]', 'Usuario Nuevo');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'NuevaPassword123!');
    await page.fill('input[name="confirmPassword"]', 'NuevaPassword123!');
    await page.check('input[name="aceptaTerminos"]');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de éxito o redirección a login
    await page.waitForTimeout(2000);
    
    // Debería mostrar mensaje de éxito o redirigir a login
    const isOnLogin = page.url().includes('/login');
    const hasSuccessMessage = await page.locator('text=/registro completado|cuenta creada/i').isVisible();
    
    expect(isOnLogin || hasSuccessMessage).toBeTruthy();
  });

  test('debe validar que las contraseñas coincidan en registro', async ({ page }) => {
    await page.goto('/register');
    
    // Llenar con contraseñas diferentes
    await page.fill('input[name="nombre"]', 'Usuario Test');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password456!');
    await page.check('input[name="aceptaTerminos"]');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verificar error
    await expect(
      page.locator('text=/las contraseñas no coinciden|contraseñas deben ser iguales/i')
    ).toBeVisible({ timeout: 3000 });
  });

  test('debe requerir aceptación de términos en registro', async ({ page }) => {
    await page.goto('/register');
    
    // Llenar formulario SIN aceptar términos
    await page.fill('input[name="nombre"]', 'Usuario Test');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    // NO marcar checkbox de términos
    
    // Intentar submit
    await page.click('button[type="submit"]');
    
    // Verificar que está deshabilitado o muestra error
    const checkbox = page.locator('input[name="aceptaTerminos"]');
    const isRequired = await checkbox.evaluate((el: HTMLInputElement) => el.required);
    
    expect(isRequired).toBeTruthy();
  });

  test('debe realizar logout correctamente', async ({ page }) => {
    // Primero hacer login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    
    // Abrir menú de usuario
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

  test('debe persistir sesión después de reload', async ({ page }) => {
    // Login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    
    // Reload página
    await page.reload();
    
    // Debe seguir en dashboard (sesión persistente)
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=/mis listas|listas de compra/i')).toBeVisible();
  });

  test('debe redirigir a login cuando sesión expira', async ({ page }) => {
    // Login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
    
    // Limpiar cookies (simular expiración)
    await page.context().clearCookies();
    
    // Intentar navegar
    await page.goto('/dashboard');
    
    // Debe redirigir a login
    await page.waitForURL('/login', { timeout: 5000 });
    await expect(page).toHaveURL('/login');
  });

  test('debe mostrar callbackUrl después de login', async ({ page }) => {
    // Intentar acceder a página protegida sin login
    await page.goto('/lists/123');
    
    // Debe redirigir a login con callbackUrl
    await page.waitForURL(/\/login\?callbackUrl=/, { timeout: 5000 });
    expect(page.url()).toContain('callbackUrl');
    
    // Hacer login
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Debe redirigir a la URL original (si existe) o a dashboard
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    expect(
      currentUrl.includes('/lists/123') || currentUrl.includes('/dashboard')
    ).toBeTruthy();
  });
});
