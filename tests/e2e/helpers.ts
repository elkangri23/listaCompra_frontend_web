import { Page, expect } from '@playwright/test';

/**
 * Utilidades comunes para tests E2E
 */

/**
 * Credenciales de usuario de prueba
 */
export const TEST_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  nombre: 'Usuario Test',
};

export const TEST_ADMIN = {
  email: 'admin@example.com',
  password: 'Admin123!',
  nombre: 'Admin Test',
};

/**
 * Realizar login en la aplicación
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  
  // Esperar redirección al dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL('/dashboard');
}

/**
 * Realizar logout de la aplicación
 */
export async function logout(page: Page) {
  // Abrir menú de usuario
  await page.click('[data-testid="user-menu-trigger"]');
  
  // Click en logout
  await page.click('[data-testid="logout-button"]');
  
  // Verificar redirección a login
  await page.waitForURL('/login');
  await expect(page).toHaveURL('/login');
}

/**
 * Registrar nuevo usuario
 */
export async function register(
  page: Page, 
  email: string, 
  password: string, 
  nombre: string
) {
  await page.goto('/register');
  await page.fill('input[name="nombre"]', nombre);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.check('input[name="aceptaTerminos"]');
  await page.click('button[type="submit"]');
  
  // Esperar mensaje de éxito o redirección
  await page.waitForTimeout(2000);
}

/**
 * Crear una nueva lista
 */
export async function createList(page: Page, nombre: string, descripcion?: string) {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-list-button"]');
  
  // Llenar formulario
  await page.fill('input[name="nombre"]', nombre);
  if (descripcion) {
    await page.fill('textarea[name="descripcion"]', descripcion);
  }
  
  await page.click('button[type="submit"]');
  
  // Esperar que se cree y redirija
  await page.waitForURL(/\/lists\/\d+/);
}

/**
 * Agregar producto a lista
 */
export async function addProduct(
  page: Page,
  nombre: string,
  options?: {
    cantidad?: number;
    precio?: number;
    urgente?: boolean;
    categoria?: string;
  }
) {
  await page.click('[data-testid="add-product-button"]');
  
  // Llenar formulario
  await page.fill('input[name="nombre"]', nombre);
  
  if (options?.cantidad) {
    await page.fill('input[name="cantidad"]', options.cantidad.toString());
  }
  
  if (options?.precio) {
    await page.fill('input[name="precio"]', options.precio.toString());
  }
  
  if (options?.urgente) {
    await page.check('input[name="urgente"]');
  }
  
  if (options?.categoria) {
    await page.selectOption('select[name="categoriaId"]', { label: options.categoria });
  }
  
  await page.click('button[type="submit"]');
  
  // Esperar que se agregue
  await page.waitForTimeout(1000);
}

/**
 * Compartir lista con usuario
 */
export async function shareList(
  page: Page,
  email: string,
  permission: 'LECTURA' | 'ESCRITURA' = 'LECTURA'
) {
  await page.click('[data-testid="share-list-button"]');
  
  // Esperar que se abra el dialog
  await page.waitForSelector('[role="dialog"]');
  
  // Llenar email
  await page.fill('input[name="email"]', email);
  
  // Seleccionar permiso
  if (permission === 'ESCRITURA') {
    await page.click('[data-testid="permission-write"]');
  }
  
  // Enviar invitación
  await page.click('button:has-text("Enviar invitación")');
  
  // Esperar confirmación
  await page.waitForTimeout(1000);
}

/**
 * Esperar a que un toast aparezca con un mensaje específico
 */
export async function waitForToast(page: Page, message: string) {
  const toast = page.locator('[data-sonner-toast]', { hasText: message });
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * Navegar a una lista específica
 */
export async function goToList(page: Page, listId: number) {
  await page.goto(`/lists/${listId}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Esperar carga completa de la página
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Limpiar base de datos (solo para testing)
 * NOTA: Requiere endpoint especial en backend
 */
export async function cleanDatabase(page: Page) {
  if (process.env.NODE_ENV === 'test') {
    await page.request.post('/api/test/cleanup');
  }
}
