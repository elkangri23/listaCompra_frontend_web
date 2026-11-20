import { test, expect } from '@playwright/test';
import { login, logout, register, TEST_USER } from './helpers';

/**
 * Tests E2E para flujo de autenticación
 * Basados en los selectores reales de LoginForm y RegisterForm:
 * - Inputs: #email, #password (login) / #nombre, #apellidos, #email,
 *   #password, #confirmPassword, #termsAccepted (registro)
 * - Errores de campo: p[role="alert"] con id "#email-error", etc.
 * - Redirección post-login: /dashboard (middleware)
 */

test.describe('Flujo de Autenticación', () => {
  test('debe permitir login con credenciales válidas', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);

    // Verificar que estamos en el dashboard con contenido real
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });
  });

  test('debe mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login');

    await page.fill('#email', 'incorrecto@example.com');
    await page.fill('#password', 'PasswordIncorrecto123!');
    await page.click('button[type="submit"]');

    // LoginForm muestra error con role="alert"
    await expect(
      page.locator('[role="alert"]').filter({ hasText: /incorrectos/i })
    ).toBeVisible({ timeout: 10000 });

    // Verificar que NO redirige
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe validar formato de email en login', async ({ page }) => {
    await page.goto('/login');

    // noValidate está activo, así que la validación es de Zod en el componente
    await page.fill('#email', 'email-invalido');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    // El error se muestra en #email-error con role="alert"
    await expect(page.locator('#email-error')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe registrar nuevo usuario exitosamente', async ({ page }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);

    // Verificar elementos del formulario con IDs reales
    await expect(page.locator('#nombre')).toBeVisible();
    await expect(page.locator('#apellidos')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();
    await expect(page.locator('#termsAccepted')).toBeVisible();

    await page.fill('#nombre', 'Usuario Nuevo');
    await page.fill('#apellidos', 'Test');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'NuevaPassword123!');
    await page.fill('#confirmPassword', 'NuevaPassword123!');
    await page.check('#termsAccepted');

    await page.click('button[type="submit"]');

    // El registro muestra mensaje de éxito y redirige a /login a los 2 segundos
    await expect(page.locator('[role="status"]')).toBeVisible({ timeout: 5000 });
    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test('debe validar que las contraseñas coincidan en registro', async ({ page }) => {
    await page.goto('/register');

    await page.fill('#nombre', 'Usuario Test');
    await page.fill('#apellidos', 'Test');
    await page.fill('#email', `mismatch-${Date.now()}@example.com`);
    await page.fill('#password', 'Password123!');
    await page.fill('#confirmPassword', 'Password456!');
    await page.check('#termsAccepted');

    await page.click('button[type="submit"]');

    await expect(page.locator('#confirmPassword-error')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/register/);
  });

  test('debe requerir aceptación de términos en registro', async ({ page }) => {
    await page.goto('/register');

    // El botón está deshabilitado si no se aceptaron los términos
    await expect(page.locator('button[type="submit"]')).toBeDisabled();

    // Al aceptar, se habilita
    await page.fill('#nombre', 'Usuario Test');
    await page.fill('#apellidos', 'Test');
    await page.fill('#email', `terms-${Date.now()}@example.com`);
    await page.fill('#password', 'Password123!');
    await page.fill('#confirmPassword', 'Password123!');
    await page.check('#termsAccepted');
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('debe realizar logout correctamente', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });

    await logout(page);
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe persistir sesión después de reload', async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });

    await page.reload();

    // Debe seguir en dashboard (sesión persistente)
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible();
  });

  test('debe redirigir a login cuando no hay sesión', async ({ page }) => {
    // Intentar acceder a página protegida sin sesión
    await page.goto('/dashboard');

    // El middleware debe redirigir a /login con callbackUrl
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
