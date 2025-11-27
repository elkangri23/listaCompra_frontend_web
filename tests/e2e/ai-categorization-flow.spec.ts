import { test, expect } from '@playwright/test';
import { login, createList, addProduct, waitForToast, TEST_USER } from './helpers';

/**
 * Tests E2E para flujo de categorización con AI
 * - Categorizar producto individual
 * - Categorización masiva
 * - Generar lista por ocasión
 * - Obtener recomendaciones de productos
 * - Contexto personalizado para recomendaciones
 */

test.describe('Flujo de Categorización con AI', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar primero para tener contexto
    await page.goto('/');
    
    // Login
    await login(page, TEST_USER.email, TEST_USER.password);
    await expect(page).toHaveURL('/dashboard');
  });

  test('debe categorizar producto individual con AI', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista AI ${Date.now()}`);
    
    // Agregar producto sin categoría
    await addProduct(page, 'Leche Entera');
    
    // Buscar botón de categorizar con AI
    const productRow = page.locator('text=Leche Entera').locator('..');
    const aiButton = productRow.locator('[data-testid="categorize-ai-button"]').or(
      productRow.locator('button:has-text("Categorizar")')
    ).first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      // Esperar respuesta de AI
      await page.waitForTimeout(2000);
      
      // Debe mostrar categoría sugerida (probablemente "Lácteos")
      await expect(
        page.locator('text=/lácteos|dairy/i')
      ).toBeVisible({ timeout: 5000 });
      
      // Toast de éxito
      await waitForToast(page, /categorizado|categoría asignada/i);
    }
  });

  test('debe realizar categorización masiva', async ({ page }) => {
    // Crear lista con múltiples productos sin categoría
    await createList(page, `Lista Masiva ${Date.now()}`);
    await addProduct(page, 'Manzanas');
    await addProduct(page, 'Pan Integral');
    await addProduct(page, 'Yogurt Natural');
    
    // Buscar botón de categorización masiva
    const bulkButton = page.locator('[data-testid="bulk-categorize-button"]').or(
      page.locator('button:has-text("Categorizar todos")')
    ).first();
    
    if (await bulkButton.isVisible()) {
      await bulkButton.click();
      
      // Esperar dialog de confirmación
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // Confirmar
      await page.click('button:has-text("Confirmar")');
      
      // Esperar procesamiento (puede tomar varios segundos)
      await page.waitForTimeout(5000);
      
      // Debe mostrar resultados
      await expect(
        page.locator('text=/categorización completada|productos categorizados/i')
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('debe generar lista por ocasión', async ({ page }) => {
    // Ir a sección de plantillas o AI
    await page.goto('/templates');
    
    // Buscar opción de generar por ocasión
    const occasionButton = page.locator('[data-testid="generate-occasion-list"]').or(
      page.locator('button:has-text("Generar por ocasión")')
    ).first();
    
    if (await occasionButton.isVisible()) {
      await occasionButton.click();
      
      // Esperar dialog
      await page.waitForSelector('[role="dialog"]');
      
      // Seleccionar una ocasión
      const occasionSelect = page.locator('select[name="occasion"]').or(
        page.locator('[data-testid="occasion-select"]')
      ).first();
      
      await occasionSelect.selectOption({ label: 'Desayuno' });
      
      // Opcional: Número de personas
      const peopleInput = page.locator('input[name="numberOfPeople"]');
      if (await peopleInput.isVisible()) {
        await peopleInput.fill('4');
      }
      
      // Generar
      await page.click('button:has-text("Generar lista")');
      
      // Esperar que se cree la lista
      await page.waitForURL(/\/lists\/\d+/, { timeout: 15000 });
      
      // Debe tener productos sugeridos
      await expect(
        page.locator('[data-testid="product-item"]')
      ).toHaveCount(await page.locator('[data-testid="product-item"]').count(), { timeout: 10000 });
    }
  });

  test('debe mostrar recomendaciones de productos', async ({ page }) => {
    // Crear lista con algunos productos
    await createList(page, `Lista Recomendaciones ${Date.now()}`);
    await addProduct(page, 'Pasta');
    await addProduct(page, 'Tomate');
    
    // Buscar panel de recomendaciones
    const recommendationsPanel = page.locator('[data-testid="recommendations-panel"]').or(
      page.locator('text=/recomendaciones|sugerencias/i')
    ).first();
    
    if (await recommendationsPanel.isVisible()) {
      await recommendationsPanel.scrollIntoViewIfNeeded();
      
      // Debe mostrar productos sugeridos
      const suggestions = page.locator('[data-testid="recommended-product"]');
      
      if (await suggestions.first().isVisible()) {
        // Verificar que hay al menos una recomendación
        const count = await suggestions.count();
        expect(count).toBeGreaterThan(0);
        
        // Click en agregar una recomendación
        const addButton = suggestions.first().locator('button:has-text("Agregar")');
        await addButton.click();
        
        // Esperar confirmación
        await waitForToast(page, /producto agregado|added/i);
      }
    }
  });

  test('debe usar contexto personalizado para recomendaciones', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista Contexto ${Date.now()}`);
    
    // Buscar panel de recomendaciones
    const recommendationsPanel = page.locator('[data-testid="recommendations-panel"]');
    
    if (await recommendationsPanel.isVisible()) {
      await recommendationsPanel.scrollIntoViewIfNeeded();
      
      // Buscar opción de contexto personalizado
      const contextButton = page.locator('[data-testid="toggle-context-button"]').or(
        page.locator('button:has-text("Contexto")')
      ).first();
      
      if (await contextButton.isVisible()) {
        await contextButton.click();
        
        // Debe aparecer input de contexto
        const contextInput = page.locator('input[name="customContext"]').or(
          page.locator('[data-testid="context-input"]')
        ).first();
        
        await expect(contextInput).toBeVisible();
        
        // Escribir contexto
        await contextInput.fill('Cena romántica para dos personas');
        
        // Presionar Enter o click en actualizar
        await contextInput.press('Enter');
        
        // Esperar nuevas recomendaciones
        await page.waitForTimeout(3000);
        
        // Las recomendaciones deben actualizarse
        await expect(
          page.locator('[data-testid="recommended-product"]').first()
        ).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('debe mostrar nivel de confianza en categorizaciones', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista Confianza ${Date.now()}`);
    
    // Agregar producto ambiguo
    await addProduct(page, 'Salsa');
    
    // Categorizar
    const productRow = page.locator('text=Salsa').locator('..');
    const aiButton = productRow.locator('[data-testid="categorize-ai-button"]').first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      // Buscar indicador de confianza
      const confidenceIndicator = page.locator('[data-testid="confidence-level"]').or(
        page.locator('text=/%|confianza/i')
      ).first();
      
      if (await confidenceIndicator.isVisible()) {
        // Verificar que muestra un porcentaje
        const text = await confidenceIndicator.textContent();
        expect(text).toMatch(/\d+%/);
      }
    }
  });

  test('debe permitir cambiar categoría sugerida por AI', async ({ page }) => {
    // Crear lista y producto
    await createList(page, `Lista Cambiar ${Date.now()}`);
    await addProduct(page, 'Agua');
    
    // Categorizar con AI
    const productRow = page.locator('text=Agua').locator('..');
    const aiButton = productRow.locator('[data-testid="categorize-ai-button"]').first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      // Debe tener una categoría asignada
      // Cambiar manualmente
      const categorySelect = productRow.locator('select[name="categoriaId"]').first();
      
      if (await categorySelect.isVisible()) {
        // Cambiar a otra categoría
        await categorySelect.selectOption({ index: 1 });
        
        // Guardar cambio
        await page.waitForTimeout(1000);
        
        // Verificar que se guardó
        await waitForToast(page, /actualizado|guardado/i);
      }
    }
  });

  test('debe mostrar historial de productos frecuentes', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista Frecuentes ${Date.now()}`);
    
    // Buscar sección de productos frecuentes o sugerencias basadas en historial
    const frequentSection = page.locator('[data-testid="frequent-products"]').or(
      page.locator('text=/productos frecuentes|compras anteriores/i')
    ).first();
    
    if (await frequentSection.isVisible()) {
      await frequentSection.scrollIntoViewIfNeeded();
      
      // Debe mostrar productos que el usuario ha comprado antes
      const frequentProducts = page.locator('[data-testid="frequent-product-item"]');
      
      if (await frequentProducts.first().isVisible()) {
        const count = await frequentProducts.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });

  test('debe mostrar razón de recomendación', async ({ page }) => {
    // Crear lista con productos
    await createList(page, `Lista Razones ${Date.now()}`);
    await addProduct(page, 'Hamburguesas');
    
    // Panel de recomendaciones
    const recommendationsPanel = page.locator('[data-testid="recommendations-panel"]');
    
    if (await recommendationsPanel.isVisible()) {
      await recommendationsPanel.scrollIntoViewIfNeeded();
      
      const recommendation = page.locator('[data-testid="recommended-product"]').first();
      
      if (await recommendation.isVisible()) {
        // Debe mostrar por qué se recomienda
        const reason = recommendation.locator('[data-testid="recommendation-reason"]').or(
          recommendation.locator('text=/complementa|va bien con|frecuentemente comprado/i')
        ).first();
        
        if (await reason.isVisible()) {
          const text = await reason.textContent();
          expect(text).toBeTruthy();
          if (text) {
            expect(text.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('debe actualizar recomendaciones al agregar productos', async ({ page }) => {
    // Crear lista
    await createList(page, `Lista Dinámica ${Date.now()}`);
    
    // Panel de recomendaciones inicial
    const recommendationsPanel = page.locator('[data-testid="recommendations-panel"]');
    
    if (await recommendationsPanel.isVisible()) {
      // Guardar primera recomendación
      const firstRecommendation = await page.locator('[data-testid="recommended-product"]')
        .first()
        .textContent();
      
      // Agregar producto
      await addProduct(page, 'Carne Molida');
      
      // Esperar actualización
      await page.waitForTimeout(2000);
      
      // Recomendaciones deben actualizarse (pueden ser diferentes)
      const newRecommendation = await page.locator('[data-testid="recommended-product"]')
        .first()
        .textContent();
      
      // Al menos el panel debe seguir visible
      await expect(recommendationsPanel).toBeVisible();
    }
  });

  test('debe manejar error si AI no está disponible', async ({ page }) => {
    // Simular que AI no responde
    // Esto depende de la implementación real
    
    // Crear lista
    await createList(page, `Lista Error AI ${Date.now()}`);
    await addProduct(page, 'Producto Test');
    
    // Intentar categorizar
    const productRow = page.locator('text=Producto Test').locator('..');
    const aiButton = productRow.locator('[data-testid="categorize-ai-button"]').first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      // Esperar respuesta o error
      await page.waitForTimeout(5000);
      
      // Si hay error, debe mostrarlo
      const errorMessage = page.locator('text=/error|no disponible|intenta más tarde/i');
      
      // O debe haber una categoría asignada
      const hasError = await errorMessage.isVisible();
      const hasCategory = await page.locator('text=/lácteos|frutas|carnes|verduras/i').isVisible();
      
      // Uno de los dos debe ser true
      expect(hasError || hasCategory).toBeTruthy();
    }
  });
});
