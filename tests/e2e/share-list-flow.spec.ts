import { test, expect } from '@playwright/test';
import {
  login,
  createList,
  addProduct,
  shareList,
  generateShareLink,
  logout,
  TEST_USER,
  TEST_ADMIN,
} from './helpers';

/**
 * Tests E2E para flujo de compartir listas
 * Basados en la implementación real:
 * - ShareListDialog: botón "Compartir" del header de la lista,
 *   tabs "Por Email" / "Enlace Público", #email-invite,
 *   #permission-selector (Radix Select), botón "Enviar Invitación",
 *   #share-link tras generar enlace
 * - Colaboradores: tab "Colaboradores" del sidebar
 * NOTA: El backend no tiene endpoint de aceptar invitaciones por email;
 * el acceso se hace por enlace público en /invitations/[hash]
 */

test.describe('Flujo de Compartir Listas', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('debe compartir lista por email con permiso de lectura (por defecto)', async ({ page }) => {
    const listName = `Lista Compartida ${Date.now()}`;
    await createList(page, listName);

    await page.click('button:has-text("Compartir")');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Verificar las dos pestañas reales
    await expect(page.locator('button[role="tab"]:has-text("Por Email")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Enlace Público")')).toBeVisible();

    // Llenar email y enviar con permiso LECTURA (default)
    await page.fill('#email-invite', TEST_ADMIN.email);
    await page.click('button:has-text("Enviar Invitación")');

    // Toast de confirmación con el email
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: TEST_ADMIN.email })
    ).toBeVisible({ timeout: 10000 });
  });

  test('debe compartir lista con permiso de escritura', async ({ page }) => {
    const listName = `Lista Escritura ${Date.now()}`;
    await createList(page, listName);

    await page.click('button:has-text("Compartir")');
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    await page.fill('#email-invite', TEST_ADMIN.email);

    // Seleccionar ESCRITURA en el Radix Select
    await page.click('#permission-selector');
    await page.click('div[role="option"]:has-text("Lectura y escritura")');

    await page.click('button:has-text("Enviar Invitación")');

    // El toast debe mencionar el permiso de escritura
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /escritura/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('debe generar enlace público de compartir', async ({ page }) => {
    const listName = `Lista Enlace ${Date.now()}`;
    await createList(page, listName);

    const link = await generateShareLink(page);

    // El enlace apunta a la página pública de invitación
    expect(link).toContain('/invitations/');
  });

  test('debe copiar enlace al portapapeles', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const listName = `Lista Copiar ${Date.now()}`;
    await createList(page, listName);

    await generateShareLink(page);

    // Botón de copiar con texto accesible "Copiar enlace"
    await page.click('button:has-text("Copiar enlace")');

    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /copiado/i })
    ).toBeVisible({ timeout: 5000 });

    // Verificar el contenido del portapapeles
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('/invitations/');
  });

  test('debe validar email inválido al compartir', async ({ page }) => {
    await createList(page, `Lista Validar ${Date.now()}`);

    await page.click('button:has-text("Compartir")');
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

    // Email inválido → el input type="email" bloquea el submit con validación
    // HTML5 nativa (el form no tiene noValidate)
    await page.fill('#email-invite', 'email-invalido');
    await page.click('button:has-text("Enviar Invitación")');

    const validationMessage = await page
      .locator('#email-invite')
      .evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();

    // El dialog sigue abierto (no se envió nada)
    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('debe mostrar colaboradores actuales de la lista', async ({ page }) => {
    const listName = `Lista Colaboradores ${Date.now()}`;
    const listId = await createList(page, listName);

    // Compartir con un usuario (crea la invitación)
    await shareList(page, TEST_ADMIN.email, 'LECTURA');

    // Cerrar dialog y abrir el tab de colaboradores
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 5000 });
    await page.getByRole('button', { name: 'Colaboradores', exact: true }).click();

    // El tab muestra la sección con el email del colaborador
    await expect(page.locator('h3:has-text("Colaboradores")')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_ADMIN.email, { exact: true })).toBeVisible();
  });

  test('propietario debe poder revocar acceso de colaborador', async ({ page }) => {
    const listName = `Lista Revocar ${Date.now()}`;
    await createList(page, listName);

    await shareList(page, TEST_ADMIN.email, 'LECTURA');
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 5000 });
    await page.getByRole('button', { name: 'Colaboradores', exact: true }).click();

    // El colaborador debe estar en la lista
    await expect(page.getByText(TEST_ADMIN.email, { exact: true })).toBeVisible({ timeout: 10000 });

    // Revocar acceso: el botón está en el menú "Más opciones" del colaborador
    page.once('dialog', (dialog) => dialog.accept());
    await page.click('button:has-text("Más opciones")');
    await page.getByRole('menuitem', { name: 'Revocar acceso' }).click();

    // El email del colaborador debe desaparecer
    await expect(page.getByText(TEST_ADMIN.email, { exact: true })).not.toBeVisible({
      timeout: 10000,
    });
  });

  test('debe aceptar invitación mediante enlace público', async ({ page }) => {
    const listName = `Lista Invitación ${Date.now()}`;
    const listId = await createList(page, listName);

    // Generar enlace
    const link = await generateShareLink(page);
    const hash = link.split('/invitations/')[1];

    // Cerrar dialog y cerrar sesión
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 5000 });
    await logout(page);

    // El middleware redirige el enlace público a /login con callbackUrl
    await page.goto(`/invitations/${hash}`);
    await page.waitForURL(/\/login/, { timeout: 15000 });

    // Login: el callbackUrl lleva de vuelta a la página de la invitación
    await page.fill('#email', TEST_ADMIN.email);
    await page.fill('#password', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(new RegExp(`/invitations/${hash}`), { timeout: 30000 });

    // La página pública muestra el nombre de la lista
    await expect(page.locator('h2:has-text("' + listName + '")')).toBeVisible({
      timeout: 15000,
    });
  });

  test('debe rechazar invitación pendiente', async ({ page }) => {
    const listName = `Lista Rechazo ${Date.now()}`;
    await createList(page, listName);

    // Propietario invita al admin
    await shareList(page, TEST_ADMIN.email, 'LECTURA');
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: 5000 });
    await logout(page);

    // Login como admin para ver la invitación pendiente
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);

    await page.goto('/invitations');
    await expect(page.locator('h1:has-text("Invitaciones Pendientes")')).toBeVisible({
      timeout: 15000,
    });

    // La invitación del propietario debe aparecer (con otras de tests paralelos)
    const row = page.locator('tr').filter({ hasText: listName });
    await expect(row).toBeVisible({ timeout: 10000 });

    // Rechazarla (botón de su propia fila)
    await row.locator('button:has-text("Rechazar")').click();

    // La fila debe desaparecer de la lista
    await expect(row).not.toBeVisible({ timeout: 10000 });
  });
});
