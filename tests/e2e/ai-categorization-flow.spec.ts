import { test, expect } from '@playwright/test';
import { login, createList, addProduct, TEST_USER } from './helpers';

/**
 * Tests E2E para flujo de categorización con IA
 * Basados en la implementación real:
 * - Botón "Categorizar" en el header de la lista (habilitado con
 *   productos sin categoría) → BulkCategorizationDialog
 * - Paso 1: #select-all + checkboxes por producto, botón "Categorizar"
 * - Paso 2: Preview con categorías sugeridas, botón "Aplicar Categorías"
 * - Recomendaciones: tab "Sugerencias" del sidebar (RecommendationsPanel)
 * - Listas por ocasión: /lists → botón "Por Ocasión" → OccasionListDialog
 */

test.describe('Flujo de Categorización con IA', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
  });

  test('debe abrir el dialog de categorización masiva', async ({ page }) => {
    await createList(page, `Lista AI ${Date.now()}`);
    await addProduct(page, 'Leche Entera');

    // Abrir el dialog con el botón real del header
    await page.click('button[title="Categorizar productos masivamente con IA"]');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(
      dialog.locator('text=Categorización Masiva con IA')
    ).toBeVisible();

    // Paso 1: selector de todos
    await expect(dialog.locator('#select-all')).toBeVisible();
    await expect(
      dialog.locator('label:has-text("Seleccionar todos")')
    ).toBeVisible();
  });

  test('debe categorizar productos masivamente con IA', async ({ page }) => {
    await createList(page, `Lista Masiva ${Date.now()}`);
    await addProduct(page, 'Manzanas');
    await addProduct(page, 'Yogur Natural');

    // Abrir dialog y seleccionar todos
    await page.click('button[title="Categorizar productos masivamente con IA"]');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('#select-all').check();

    // Ejecutar categorización (botón real del paso 1)
    await dialog.locator('button:has-text("Categorizar")').click();

    // Paso 2: Preview de categorización
    await expect(dialog.locator('text=Preview de Categorización')).toBeVisible({
      timeout: 15000,
    });

    // El preview debe mostrar la categoría sugerida para cada producto
    await expect(
      dialog.locator('text=Frutas y Verduras').first()
    ).toBeVisible();
    await expect(
      dialog.locator('text=Lácteos y Huevos').first()
    ).toBeVisible();
  });

  test('debe aplicar las categorías sugeridas a los productos', async ({ page }) => {
    await createList(page, `Lista Aplicar ${Date.now()}`);
    await addProduct(page, 'Manzanas');
    await addProduct(page, 'Leche Entera');

    await page.click('button[title="Categorizar productos masivamente con IA"]');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('#select-all').check();
    await dialog.locator('button:has-text("Categorizar")').click();

    // Esperar preview
    await expect(dialog.locator('text=Preview de Categorización')).toBeVisible({
      timeout: 15000,
    });

    // Aplicar categorías
    await dialog.locator('button:has-text("Aplicar Categorías")').click();

    // Toast de éxito
    await expect(
      page.locator('[data-sonner-toast]').filter({ hasText: /categorizados exitosamente/i })
    ).toBeVisible({ timeout: 15000 });

    // El dialog se cierra y los productos ya no aparecen en "Sin categoría"
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Sin categoría")')).not.toBeVisible({
      timeout: 15000,
    });
    // Las categorías sugeridas deben aparecer como encabezados de grupo
    await expect(page.locator('h2:has-text("Frutas y Verduras")')).toBeVisible();
    await expect(page.locator('h2:has-text("Lácteos y Huevos")')).toBeVisible();

    // El botón de categorizar masiva se deshabilita (no quedan productos sin categoría)
    await expect(
      page.locator('button[title="Categorizar productos masivamente con IA"]')
    ).toBeDisabled();
  });

  test('debe mostrar nivel de confianza en la categorización', async ({ page }) => {
    await createList(page, `Lista Confianza ${Date.now()}`);
    await addProduct(page, 'Salsa de tomate');

    await page.click('button[title="Categorizar productos masivamente con IA"]');
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    await dialog.locator('#select-all').check();
    await dialog.locator('button:has-text("Categorizar")').click();

    await expect(dialog.locator('text=Preview de Categorización')).toBeVisible({
      timeout: 15000,
    });

    // El toast confirma con el nivel de confianza como porcentaje
    const toast = page
      .locator('[data-sonner-toast]')
      .filter({ hasText: /\d+% de precisión/ })
      .first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    const text = await toast.textContent();
    expect(text).toMatch(/\d+% de precisión/);
  });

  test('debe generar lista por ocasión desde /lists', async ({ page }) => {
    await page.goto('/lists');

    // Botón real "Por Ocasión" en la página de listas
    await page.click('button:has-text("Por Ocasión")');

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Seleccionar una ocasión
    await page.click('button[aria-label="Seleccionar Desayuno"]');

    // Generar directamente con el botón real
    await dialog.locator('button:has-text("Crear Lista")').first().click();

    // Debe crear la lista y redirigir a ella (o cerrar con toast de éxito)
    await page.waitForURL(/\/lists\/[a-zA-Z0-9-]+$/, { timeout: 20000 });

    // La lista generada tiene productos
    await expect(page.locator('text=Café').first()).toBeVisible({ timeout: 10000 });
  });

  test('debe mostrar recomendaciones en la pestaña Sugerencias', async ({ page }) => {
    await createList(page, `Lista Recomendaciones ${Date.now()}`);
    await addProduct(page, 'Pasta');

    // Abrir el tab "Sugerencias" del sidebar
    await page.click('button:has-text("Sugerencias")');

    // El panel muestra recomendaciones del mock (Pan, Yogur natural)
    await expect(page.locator('text=Pan').first()).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=/razon|💡/').first()).toBeVisible();

    // Muestra el nivel de confianza
    await expect(page.locator('text=/\\d+%/').first()).toBeVisible();
  });

  test('debe deshabilitar categorización masiva sin productos pendientes', async ({ page }) => {
    await createList(page, `Lista Sin Pendientes ${Date.now()}`);

    // Sin productos, el botón de categorización masiva está deshabilitado
    await expect(
      page.locator('button[title="Categorizar productos masivamente con IA"]')
    ).toBeDisabled();
  });
});
