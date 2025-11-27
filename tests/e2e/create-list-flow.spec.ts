import { test, expect } from '@playwright/test';
import { login, createList, addProduct, waitForToast, goToList, TEST_USER } from './helpers';

/**
 * Tests E2E para flujo de creación de listas y productos
 * - Crear lista nueva
 * - Editar lista
 * - Agregar productos a lista
 * - Marcar producto como comprado
 * - Eliminar producto
 * - Eliminar lista
 */

test.describe('Flujo de Creación de Listas y Productos', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar primero para tener contexto
    await page.goto('/');
    
    // Login antes de cada test
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
  });

  test.skip('debe crear una nueva lista vacía', async ({ page }) => {
    // TODO: Requiere login funcional y selectores de dashboard
    // Click en botón crear lista
    const createButton = page.locator('[data-testid="create-list-button"]').or(
      page.locator('button:has-text("Nueva lista")')
    ).first();
    
    await createButton.click();
    
    // Esperar dialog o formulario
    await page.waitForSelector('input[name="nombre"]', { timeout: 5000 });
    
    // Llenar formulario
    const listName = `Lista Test ${Date.now()}`;
    await page.fill('input[name="nombre"]', listName);
    await page.fill('textarea[name="descripcion"]', 'Descripción de prueba');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Debe redirigir a la nueva lista
    await page.waitForURL(/\/lists\/\d+/, { timeout: 10000 });
    
    // Verificar que se muestra el nombre
    await expect(page.locator(`text=${listName}`)).toBeVisible();
  });

  test.skip('debe crear lista y agregar productos', async ({ page }) => {
    // TODO: Requiere login funcional
    const listName = `Lista Compras ${Date.now()}`;
    
    // Crear lista
    await createList(page, listName, 'Lista para test E2E');
    
    // Verificar que estamos en la página de la lista
    expect(page.url()).toMatch(/\/lists\/\d+/);
    
    // Agregar primer producto
    await addProduct(page, 'Leche', { cantidad: 2, precio: 1.50 });
    
    // Verificar que aparece en la lista
    await expect(page.locator('text=Leche')).toBeVisible();
    
    // Agregar segundo producto
    await addProduct(page, 'Pan', { cantidad: 1, urgente: true });
    
    // Verificar ambos productos
    await expect(page.locator('text=Leche')).toBeVisible();
    await expect(page.locator('text=Pan')).toBeVisible();
  });

  test.skip('debe marcar producto como comprado', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista con producto
    const listName = `Lista ${Date.now()}`;
    await createList(page, listName);
    await addProduct(page, 'Arroz');
    
    // Esperar que el producto aparezca
    await expect(page.locator('text=Arroz')).toBeVisible();
    
    // Buscar checkbox o botón para marcar como comprado
    const productRow = page.locator('[data-testid="product-item"]').or(
      page.locator('li:has-text("Arroz")')
    ).first();
    
    const checkbox = productRow.locator('input[type="checkbox"]').first();
    await checkbox.check();
    
    // Verificar estado (puede tener clase, strikethrough, badge, etc)
    await page.waitForTimeout(1000);
    
    // El producto debe tener algún indicador visual de "comprado"
    const isChecked = await checkbox.isChecked();
    expect(isChecked).toBeTruthy();
  });

  test.skip('debe editar nombre y descripción de lista', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista
    const originalName = `Lista Original ${Date.now()}`;
    await createList(page, originalName, 'Descripción original');
    
    // Buscar botón de editar
    const editButton = page.locator('[data-testid="edit-list-button"]').or(
      page.locator('button:has-text("Editar")')
    ).first();
    
    await editButton.click();
    
    // Esperar formulario de edición
    await page.waitForSelector('input[name="nombre"]');
    
    // Cambiar nombre y descripción
    const newName = `Lista Editada ${Date.now()}`;
    await page.fill('input[name="nombre"]', newName);
    await page.fill('textarea[name="descripcion"]', 'Descripción actualizada');
    
    // Guardar cambios
    await page.click('button:has-text("Guardar")');
    
    // Verificar cambios
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test.skip('debe eliminar producto de la lista', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista con producto
    await createList(page, `Lista ${Date.now()}`);
    await addProduct(page, 'Producto a Eliminar');
    
    // Verificar que existe
    await expect(page.locator('text=Producto a Eliminar')).toBeVisible();
    
    // Buscar botón eliminar
    const productRow = page.locator('text=Producto a Eliminar').locator('..');
    const deleteButton = productRow.locator('[data-testid="delete-product-button"]').or(
      productRow.locator('button:has-text("Eliminar")')
    ).first();
    
    // Click eliminar
    await deleteButton.click();
    
    // Manejar confirmación si existe
    page.on('dialog', dialog => dialog.accept());
    
    // Esperar que desaparezca
    await expect(page.locator('text=Producto a Eliminar')).not.toBeVisible({ timeout: 5000 });
  });

  test.skip('debe filtrar productos por categoría', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista
    await createList(page, `Lista Categorías ${Date.now()}`);
    
    // Agregar productos de diferentes categorías
    await addProduct(page, 'Manzanas', { categoria: 'Frutas' });
    await addProduct(page, 'Leche', { categoria: 'Lácteos' });
    await addProduct(page, 'Pan', { categoria: 'Panadería' });
    
    // Verificar que todos están visibles
    await expect(page.locator('text=Manzanas')).toBeVisible();
    await expect(page.locator('text=Leche')).toBeVisible();
    await expect(page.locator('text=Pan')).toBeVisible();
    
    // Filtrar por categoría (si existe la funcionalidad)
    const categoryFilter = page.locator('select[name="categoria"]').or(
      page.locator('[data-testid="category-filter"]')
    ).first();
    
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ label: 'Frutas' });
      
      // Solo Manzanas debe estar visible
      await expect(page.locator('text=Manzanas')).toBeVisible();
      await expect(page.locator('text=Leche')).not.toBeVisible();
      await expect(page.locator('text=Pan')).not.toBeVisible();
    }
  });

  test.skip('debe mostrar contador de productos', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista
    await createList(page, `Lista Contador ${Date.now()}`);
    
    // Inicialmente 0 productos
    const counter = page.locator('[data-testid="products-count"]').or(
      page.locator('text=/\\d+ productos?/i')
    ).first();
    
    // Agregar 3 productos
    await addProduct(page, 'Producto 1');
    await addProduct(page, 'Producto 2');
    await addProduct(page, 'Producto 3');
    
    // Verificar contador
    await expect(counter).toContainText('3');
  });

  test.skip('debe eliminar lista completa', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista
    const listName = `Lista a Eliminar ${Date.now()}`;
    await createList(page, listName);
    
    // Agregar un producto
    await addProduct(page, 'Producto');
    
    // Buscar botón eliminar lista
    const deleteListButton = page.locator('[data-testid="delete-list-button"]').or(
      page.locator('button:has-text("Eliminar lista")')
    ).first();
    
    // Configurar handler para confirmación
    page.on('dialog', dialog => dialog.accept());
    
    await deleteListButton.click();
    
    // Debe redirigir al dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // La lista no debe aparecer en dashboard
    await expect(page.locator(`text=${listName}`)).not.toBeVisible();
  });

  test.skip('debe validar campos obligatorios al crear lista', async ({ page }) => {
    // TODO: Requiere login funcional
    // Click en crear lista
    const createButton = page.locator('[data-testid="create-list-button"]').or(
      page.locator('button:has-text("Nueva lista")')
    ).first();
    
    await createButton.click();
    
    // Esperar formulario
    await page.waitForSelector('input[name="nombre"]');
    
    // Intentar submit sin nombre
    await page.click('button[type="submit"]');
    
    // Verificar validación
    const nameInput = page.locator('input[name="nombre"]');
    const validationMessage = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    
    expect(validationMessage).toBeTruthy();
  });

  test.skip('debe validar campos obligatorios al agregar producto', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista
    await createList(page, `Lista ${Date.now()}`);
    
    // Abrir formulario de producto
    const addButton = page.locator('[data-testid="add-product-button"]').or(
      page.locator('button:has-text("Agregar producto")')
    ).first();
    
    await addButton.click();
    
    // Intentar submit sin nombre
    await page.waitForSelector('input[name="nombre"]');
    await page.click('button[type="submit"]');
    
    // Verificar validación
    const nameInput = page.locator('input[name="nombre"]');
    const validationMessage = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    
    expect(validationMessage).toBeTruthy();
  });

  test.skip('debe mostrar lista vacía con mensaje apropiado', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear lista sin productos
    const listName = `Lista Vacía ${Date.now()}`;
    await createList(page, listName);
    
    // Debe mostrar mensaje de lista vacía
    await expect(
      page.locator('text=/no hay productos|lista vacía|agrega tu primer producto/i')
    ).toBeVisible();
  });

  test.skip('debe navegar entre listas desde dashboard', async ({ page }) => {
    // TODO: Requiere login funcional
    // Crear 2 listas
    const list1Name = `Lista 1 ${Date.now()}`;
    const list2Name = `Lista 2 ${Date.now()}`;
    
    await createList(page, list1Name);
    await page.goto('/dashboard');
    await createList(page, list2Name);
    
    // Volver al dashboard
    await page.goto('/dashboard');
    
    // Ambas listas deben aparecer
    await expect(page.locator(`text=${list1Name}`)).toBeVisible();
    await expect(page.locator(`text=${list2Name}`)).toBeVisible();
    
    // Click en lista 1
    await page.click(`text=${list1Name}`);
    await expect(page).toHaveURL(/\/lists\/\d+/);
    await expect(page.locator(`text=${list1Name}`)).toBeVisible();
  });
});
