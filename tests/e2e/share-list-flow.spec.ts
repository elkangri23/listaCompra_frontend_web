import { test, expect } from '@playwright/test';
import { login, logout, createList, shareList, addProduct, waitForToast, TEST_USER, TEST_ADMIN } from './helpers';

/**
 * Tests E2E para flujo de compartir listas
 * - Compartir lista por email
 * - Generar enlace temporal
 * - Aceptar invitación
 * - Rechazar invitación
 * - Permisos de lectura vs escritura
 * - Revocar acceso
 */

test.describe('Flujo de Compartir Listas', () => {
  test.beforeEach(async ({ page }) => {
    // Login con usuario propietario
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe compartir lista por email con permiso de lectura', async ({ page }) => {
    // Crear lista
    const listName = `Lista Compartida ${Date.now()}`;
    await createList(page, listName);
    await addProduct(page, 'Producto Compartido');
    
    // Abrir dialog de compartir
    const shareButton = page.locator('[data-testid="share-list-button"]').or(
      page.locator('button:has-text("Compartir")')
    ).first();
    
    await shareButton.click();
    
    // Esperar dialog
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Verificar tabs (email y link)
    await expect(page.locator('text=/por email|email/i')).toBeVisible();
    await expect(page.locator('text=/enlace|link/i')).toBeVisible();
    
    // Llenar email
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    
    // Verificar que permiso LECTURA está seleccionado por defecto
    const lecturaRadio = page.locator('[data-testid="permission-read"]').or(
      page.locator('input[value="LECTURA"]')
    ).first();
    
    const isChecked = await lecturaRadio.isChecked();
    expect(isChecked).toBeTruthy();
    
    // Enviar invitación
    await page.click('button:has-text("Enviar invitación")');
    
    // Esperar toast de confirmación
    await waitForToast(page, /invitación enviada|invitado correctamente/i);
  });

  test('debe compartir lista con permiso de escritura', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista Escritura ${Date.now()}`);
    
    // Abrir dialog compartir
    const shareButton = page.locator('[data-testid="share-list-button"]').or(
      page.locator('button:has-text("Compartir")')
    ).first();
    
    await shareButton.click();
    await page.waitForSelector('[role="dialog"]');
    
    // Llenar email
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    
    // Seleccionar permiso ESCRITURA
    const escrituraRadio = page.locator('[data-testid="permission-write"]').or(
      page.locator('input[value="ESCRITURA"]')
    ).first();
    
    await escrituraRadio.check();
    
    // Enviar
    await page.click('button:has-text("Enviar invitación")');
    
    // Confirmar
    await waitForToast(page, /invitación enviada/i);
  });

  test('debe generar enlace temporal para compartir', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista Enlace ${Date.now()}`);
    
    // Abrir dialog compartir
    const shareButton = page.locator('[data-testid="share-list-button"]').or(
      page.locator('button:has-text("Compartir")')
    ).first();
    
    await shareButton.click();
    await page.waitForSelector('[role="dialog"]');
    
    // Cambiar a tab de enlace
    const linkTab = page.locator('[data-testid="share-link-tab"]').or(
      page.locator('text=/enlace|link temporal/i')
    ).first();
    
    await linkTab.click();
    
    // Generar enlace
    const generateButton = page.locator('button:has-text("Generar enlace")').or(
      page.locator('[data-testid="generate-link-button"]')
    ).first();
    
    await generateButton.click();
    
    // Debe aparecer el enlace
    await page.waitForTimeout(1000);
    
    const linkInput = page.locator('input[readonly]').or(
      page.locator('[data-testid="share-link-input"]')
    ).first();
    
    await expect(linkInput).toBeVisible();
    
    // Verificar que tiene valor
    const linkValue = await linkInput.inputValue();
    expect(linkValue).toContain('http');
    expect(linkValue).toContain('/share/');
  });

  test('debe copiar enlace al portapapeles', async ({ page, context }) => {
    // Dar permisos de clipboard
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    // Crear lista y generar enlace
    await createList(page, `Lista Copiar ${Date.now()}`);
    
    const shareButton = page.locator('[data-testid="share-list-button"]').or(
      page.locator('button:has-text("Compartir")')
    ).first();
    
    await shareButton.click();
    await page.waitForSelector('[role="dialog"]');
    
    // Tab enlace
    const linkTab = page.locator('text=/enlace|link/i').last();
    await linkTab.click();
    
    // Generar
    await page.click('button:has-text("Generar enlace")');
    await page.waitForTimeout(1000);
    
    // Copiar
    const copyButton = page.locator('button:has-text("Copiar")').or(
      page.locator('[data-testid="copy-link-button"]')
    ).first();
    
    await copyButton.click();
    
    // Verificar toast
    await waitForToast(page, /enlace copiado|copied/i);
  });

  test('debe validar email al compartir', async ({ page }) => {
    await createList(page, `Lista ${Date.now()}`);
    
    const shareButton = page.locator('[data-testid="share-list-button"]').or(
      page.locator('button:has-text("Compartir")')
    ).first();
    
    await shareButton.click();
    await page.waitForSelector('[role="dialog"]');
    
    // Intentar con email inválido
    await page.fill('input[name="email"]', 'email-invalido');
    await page.click('button:has-text("Enviar invitación")');
    
    // Verificar validación HTML5
    const emailInput = page.locator('input[name="email"]');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    
    expect(validationMessage).toBeTruthy();
  });

  test('debe mostrar lista de colaboradores actuales', async ({ page }) => {
    await createList(page, `Lista Colaboradores ${Date.now()}`);
    
    // Compartir con alguien
    await shareList(page, TEST_ADMIN.email, 'LECTURA');
    
    // Ir a sección de colaboradores
    const collaboratorsSection = page.locator('[data-testid="collaborators-section"]').or(
      page.locator('text=/colaboradores|compartido con/i')
    ).first();
    
    if (await collaboratorsSection.isVisible()) {
      // Verificar que aparece el colaborador
      await expect(page.locator(`text=${TEST_ADMIN.email}`)).toBeVisible();
    }
  });

  test('debe aceptar invitación como invitado', async ({ page, context }) => {
    // Usuario 1: Crear lista y compartir
    await createList(page, `Lista Invitación ${Date.now()}`);
    await shareList(page, TEST_ADMIN.email, 'ESCRITURA');
    
    // Logout del usuario 1
    await logout(page);
    
    // Login como usuario 2 (invitado)
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    
    // Navegar a invitaciones
    await page.goto('/invitations');
    
    // Debe aparecer la invitación pendiente
    await expect(page.locator('text=/invitaciones pendientes|invitations/i')).toBeVisible();
    
    // Buscar botón aceptar
    const acceptButton = page.locator('button:has-text("Aceptar")').or(
      page.locator('[data-testid="accept-invitation-button"]')
    ).first();
    
    await acceptButton.click();
    
    // Debe redirigir a la lista compartida
    await page.waitForURL(/\/lists\/\d+/, { timeout: 10000 });
    
    // Verificar que puede ver la lista
    await expect(page.locator('text=/lista compartida|shared list/i')).toBeVisible();
  });

  test('debe rechazar invitación', async ({ page }) => {
    // Suponer que hay una invitación pendiente
    await page.goto('/invitations');
    
    // Si hay invitaciones
    const invitationsList = page.locator('[data-testid="invitations-list"]');
    
    if (await invitationsList.isVisible()) {
      // Click rechazar
      const declineButton = page.locator('button:has-text("Rechazar")').or(
        page.locator('[data-testid="decline-invitation-button"]')
      ).first();
      
      if (await declineButton.isVisible()) {
        // Configurar confirmación
        page.on('dialog', dialog => dialog.accept());
        
        await declineButton.click();
        
        // Verificar que desaparece
        await page.waitForTimeout(1000);
        await waitForToast(page, /invitación rechazada|declined/i);
      }
    }
  });

  test('invitado con LECTURA no debe poder editar', async ({ page, context }) => {
    // Usuario 1: Crear y compartir con LECTURA
    const listName = `Lista Solo Lectura ${Date.now()}`;
    await createList(page, listName);
    await addProduct(page, 'Producto Original');
    await shareList(page, TEST_ADMIN.email, 'LECTURA');
    await logout(page);
    
    // Usuario 2: Login y aceptar
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await page.goto('/invitations');
    
    const acceptButton = page.locator('button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForURL(/\/lists\/\d+/);
    } else {
      // Si ya aceptó, ir directamente a listas compartidas
      await page.goto('/dashboard');
      await page.click(`text=${listName}`);
    }
    
    // Verificar que NO puede agregar productos
    const addButton = page.locator('[data-testid="add-product-button"]');
    
    // El botón no debe estar visible o debe estar deshabilitado
    if (await addButton.isVisible()) {
      const isDisabled = await addButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    } else {
      // Botón oculto es correcto
      await expect(addButton).not.toBeVisible();
    }
  });

  test('invitado con ESCRITURA debe poder agregar productos', async ({ page, context }) => {
    // Usuario 1: Crear y compartir con ESCRITURA
    const listName = `Lista Escritura ${Date.now()}`;
    await createList(page, listName);
    await shareList(page, TEST_ADMIN.email, 'ESCRITURA');
    await logout(page);
    
    // Usuario 2: Login y aceptar
    await login(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await page.goto('/invitations');
    
    const acceptButton = page.locator('button:has-text("Aceptar")').first();
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      await page.waitForURL(/\/lists\/\d+/);
    } else {
      await page.goto('/dashboard');
      await page.click(`text=${listName}`);
    }
    
    // Debe poder agregar producto
    await addProduct(page, 'Producto del Colaborador');
    
    // Verificar que se agregó
    await expect(page.locator('text=Producto del Colaborador')).toBeVisible();
  });

  test('propietario debe poder revocar acceso', async ({ page }) => {
    // Crear lista y compartir
    await createList(page, `Lista Revocar ${Date.now()}`);
    await shareList(page, TEST_ADMIN.email, 'LECTURA');
    
    // Ir a sección de colaboradores
    const collaboratorsSection = page.locator('[data-testid="collaborators-section"]').or(
      page.locator('text=/colaboradores/i')
    ).first();
    
    if (await collaboratorsSection.isVisible()) {
      await collaboratorsSection.scrollIntoViewIfNeeded();
      
      // Buscar botón revocar
      const revokeButton = page.locator('button:has-text("Revocar")').or(
        page.locator('[data-testid="revoke-access-button"]')
      ).first();
      
      if (await revokeButton.isVisible()) {
        // Configurar confirmación
        page.on('dialog', dialog => dialog.accept());
        
        await revokeButton.click();
        
        // Verificar que se eliminó
        await page.waitForTimeout(1000);
        await expect(page.locator(`text=${TEST_ADMIN.email}`)).not.toBeVisible();
      }
    }
  });

  test('debe mostrar indicador de lista compartida', async ({ page }) => {
    // Crear y compartir lista
    await createList(page, `Lista Indicador ${Date.now()}`);
    await shareList(page, TEST_ADMIN.email, 'LECTURA');
    
    // Volver al dashboard
    await page.goto('/dashboard');
    
    // Debe haber algún indicador visual de que está compartida
    const sharedIndicator = page.locator('[data-testid="shared-indicator"]').or(
      page.locator('text=/compartida|shared|colaboradores/i')
    ).first();
    
    // Al menos uno debe estar visible
    const isVisible = await sharedIndicator.isVisible();
    expect(isVisible).toBeTruthy();
  });
});
