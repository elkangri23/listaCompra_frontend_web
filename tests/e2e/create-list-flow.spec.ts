import { test, expect } from '@playwright/test';
import {
  login,
  createList,
  addProduct,
  waitForDashboard,
  TEST_USER,
} from './helpers';

/**
 * Tests E2E para flujo de creación de listas y productos
 * Basados en la implementación real:
 * - /lists/create: #nombre, #descripcion, botón "Crear Lista"
 * - /lists/[id]: #add-product, #add-cantidad, #add-urgente,
 *   botón "Añadir Producto", checkbox por producto, botón eliminar con
 *   aria-label "Eliminar <producto>", título editable de la lista
 */

test.describe('Flujo de Creación de Listas y Productos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await waitForDashboard(page);
  });

  test('debe crear una nueva lista vacía', async ({ page }) => {
    const listName = `Lista Test ${Date.now()}`;
    const listId = await createList(page, listName, 'Descripción de prueba');

    // Debe redirigir a la nueva lista y mostrar el nombre
    await expect(page).toHaveURL(`/lists/${listId}`);
    await expect(
      page.locator(`[aria-label*="Nombre de la lista"]`).filter({ hasText: listName })
    ).toBeVisible({ timeout: 10000 });

    // Mensaje de lista vacía
    await expect(page.locator('text=No hay productos en esta lista')).toBeVisible();
  });

  test('debe crear lista y agregar productos', async ({ page }) => {
    const listName = `Lista Compras ${Date.now()}`;
    await createList(page, listName, 'Lista para test E2E');

    // Agregar productos
    await addProduct(page, 'Leche', { cantidad: 2 });
    await addProduct(page, 'Pan', { cantidad: 1, urgente: true });

    // Verificar ambos productos en la página
    await expect(page.locator(`p:has-text("Leche")`).first()).toBeVisible();
    await expect(page.locator(`p:has-text("Pan")`).first()).toBeVisible();

    // El producto urgente debe mostrar el badge "Urgente"
    await expect(page.locator('[class*="urgentBadge"]:has-text("Urgente")')).toBeVisible();
  });

  test('debe marcar producto como comprado', async ({ page }) => {
    const listName = `Lista ${Date.now()}`;
    await createList(page, listName);
    await addProduct(page, 'Arroz');

    // Marcar como comprado con el checkbox del producto. Se usa click +
    // expect en lugar de check(): el toggle persiste en el backend y si hay
    // rollback el check() de Playwright fallaría en su verificación interna
    await page.waitForLoadState('networkidle');
    const checkbox = page.locator('input[aria-label="Marcar Arroz como comprado"]');
    await checkbox.click();

    // El estado debe persistir (checkbox marcado tras el optimistic update)
    await expect(checkbox).toBeChecked({ timeout: 10000 });
  });

  test('debe eliminar producto de la lista', async ({ page }) => {
    const listName = `Lista ${Date.now()}`;
    await createList(page, listName);
    await addProduct(page, 'Producto a Eliminar');

    await expect(page.locator('p:has-text("Producto a Eliminar")')).toBeVisible();

    // Botón de eliminar con aria-label real
    await page.click('button[aria-label="Eliminar Producto a Eliminar"]');

    // El producto debe desaparecer de la lista
    await expect(page.locator('p:has-text("Producto a Eliminar")')).not.toBeVisible({
      timeout: 5000,
    });
    // Y aparece el estado vacío de nuevo
    await expect(page.locator('text=No hay productos en esta lista')).toBeVisible();
  });

  test('debe editar el nombre de la lista', async ({ page }) => {
    const originalName = `Lista Original ${Date.now()}`;
    const listId = await createList(page, originalName);

    // El título es un botón que al hacer click activa la edición inline
    await page.click(`[aria-label*="Nombre de la lista"]`);
    const nameInput = page.locator('input[aria-label="Editar nombre de la lista"]');
    await expect(nameInput).toBeVisible();

    const newName = `Lista Editada ${Date.now()}`;
    await nameInput.fill(newName);
    await nameInput.press('Enter');

    // El nuevo nombre debe mostrarse
    await expect(
      page.locator(`[aria-label*="Nombre de la lista"]`).filter({ hasText: newName })
    ).toBeVisible({ timeout: 10000 });

    // Persistir recargando (PUT /lists/:id)
    await page.reload();
    await expect(
      page.locator(`[aria-label*="Nombre de la lista"]`).filter({ hasText: newName })
    ).toBeVisible({ timeout: 10000 });
  });

  test('debe validar nombre obligatorio al crear lista', async ({ page }) => {
    await page.goto('/lists/create');

    // Intentar enviar el formulario vacío
    await page.click('button:has-text("Crear Lista")');

    // El formulario muestra error de validación real
    await expect(page.locator('#nombre-error')).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/lists\/create/);
  });

  test('debe eliminar lista completa', async ({ page }) => {
    const listName = `Lista a Eliminar ${Date.now()}`;
    const listId = await createList(page, listName);
    await addProduct(page, 'Producto temporal');

    // Aceptar el diálogo de confirmación (window.confirm)
    page.once('dialog', (dialog) => dialog.accept());

    await page.click('button[title="Eliminar lista"]');

    // Debe redirigir al dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // La lista no debe aparecer
    await expect(page.locator(`h3:has-text("${listName}")`)).not.toBeVisible();

    // Verificar también que el backend ya no la tiene
    await page.goto('/lists');
    await expect(page.locator(`h2:has-text("${listName}")`)).not.toBeVisible();
  });

  test('debe navegar entre listas desde el dashboard', async ({ page }) => {
    const list1Name = `Lista 1 ${Date.now()}`;
    const list2Name = `Lista 2 ${Date.now()}`;

    const id1 = await createList(page, list1Name);
    const id2 = await createList(page, list2Name);

    // Volver al dashboard
    await page.goto('/dashboard');
    await waitForDashboard(page);

    // Ambas listas deben aparecer como tarjetas
    await expect(page.locator(`h3:has-text("${list1Name}")`)).toBeVisible({ timeout: 15000 });
    await expect(page.locator(`h3:has-text("${list2Name}")`)).toBeVisible({ timeout: 15000 });

    // Click en la lista 1 y verificar navegación
    await page.click(`h3:has-text("${list1Name}")`);
    await expect(page).toHaveURL(`/lists/${id1}`, { timeout: 15000 });
  });
});
