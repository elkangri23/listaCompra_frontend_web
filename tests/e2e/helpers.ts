import { Page, expect } from '@playwright/test';

/**
 * Utilidades comunes para tests E2E
 * Selectores basados en la implementación real de la aplicación.
 */

/**
 * Credenciales de usuario de prueba (coinciden con el mock API)
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
 * LoginForm real: inputs #email y #password, botón "Iniciar Sesión"
 * Redirige a /dashboard tras el login (o al callbackUrl)
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');

  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');

  // Esperar redirección al dashboard (la primera compilación en dev puede tardar)
  await page.waitForURL(/\/dashboard/, { timeout: 45000 });
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Cerrar sesión desde el dashboard
 * El dashboard usa un botón con signOut (buscar por texto accesible)
 */
export async function logout(page: Page) {
  await page.click('button:has-text("Cerrar Sesión")');
  await page.waitForURL(/\/login/, { timeout: 15000 });
}

/**
 * Registrar nuevo usuario
 * RegisterForm real: #nombre, #apellidos, #email, #password, #confirmPassword, #termsAccepted
 * Tras el registro muestra status y redirige a /login a los 2 segundos
 */
export async function register(
  page: Page,
  email: string,
  password: string,
  nombre: string,
  apellidos: string = 'Test'
) {
  await page.goto('/register');

  await page.fill('#nombre', nombre);
  await page.fill('#apellidos', apellidos);
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.check('#termsAccepted');

  await page.click('button[type="submit"]');
}

/**
 * Crear una nueva lista desde la página /lists/create
 * CreateListFormClient real: #nombre, #descripcion, botón "Crear Lista"
 * Redirige a /lists/[id] tras crear
 */
export async function createList(page: Page, nombre: string, descripcion?: string) {
  await page.goto('/lists/create');

  await page.fill('#nombre', nombre);
  if (descripcion) {
    await page.fill('#descripcion', descripcion);
  }

  await page.click('button:has-text("Crear Lista")');

  // Esperar redirección a la lista creada (excluyendo /lists/create y /lists/new,
  // que también casan con el patrón y harían resolver el waitForURL antes de crear)
  await page.waitForURL(/\/lists\/(?!create\b|new\b)[^/?#]+$/, { timeout: 20000 });
  await expect(page).toHaveURL(/\/lists\/(?!create\b|new\b)[^/?#]+$/);

  return page.url().split('/').pop() as string;
}

/**
 * Agregar producto a una lista
 * ListDetailPage real: #add-product (nombre), #add-cantidad, #add-urgente,
 * botón "Añadir Producto" (o Enter)
 */
export async function addProduct(
  page: Page,
  nombre: string,
  options?: {
    cantidad?: number;
    urgente?: boolean;
  }
) {
  await page.fill('#add-product', nombre);

  if (options?.cantidad) {
    await page.fill('#add-cantidad', options.cantidad.toString());
  }

  if (options?.urgente) {
    await page.check('#add-urgente');
  }

  await page.click('button:has-text("Añadir Producto")');

  // Esperar a que el producto aparezca en la lista (ids reales: product-<uuid>)
  await expect(
    page.locator('[id^="product-"]').filter({ hasText: nombre }).first()
  ).toBeVisible({ timeout: 10000 });
}

/**
 * Compartir lista por email
 * ShareListDialog real: se abre con el botón "Compartir" del header,
 * input de email y selector de permisos (Radix Select), botón "Enviar Invitación"
 */
export async function shareList(
  page: Page,
  email: string,
  permission: 'LECTURA' | 'ESCRITURA' = 'LECTURA'
) {
  await page.click('button:has-text("Compartir")');
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

  await page.fill('#email-invite', email);

  if (permission === 'ESCRITURA') {
    await page.click('#permission-selector');
    await page.click('div[role="option"]:has-text("Lectura y escritura")');
  }

  await page.click('button:has-text("Enviar Invitación")');

  // Esperar toast de confirmación
  await waitForToast(page, /invitación enviada/i);
}

/**
 * Generar enlace público de compartir
 * ShareLinkSection real: tab "Enlace Público", selector #permissions,
 * botón "Generar Enlace de Compartir", resultado en #share-link
 */
export async function generateShareLink(page: Page) {
  await page.click('button:has-text("Compartir")');
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

  // Cambiar a la pestaña de enlace público
  await page.click('button[role="tab"]:has-text("Enlace Público")');

  await page.click('button:has-text("Generar Enlace de Compartir")');

  const linkInput = page.locator('#share-link');
  await expect(linkInput).toBeVisible({ timeout: 10000 });
  const value = await linkInput.inputValue();
  expect(value).toContain('/invitations/');
  return value;
}

/**
 * Esperar a que un toast de sonner aparezca con un mensaje específico
 */
export async function waitForToast(page: Page, message: string | RegExp) {
  const toast =
    typeof message === 'string'
      ? page.locator('[data-sonner-toast]', { hasText: message })
      : page.locator('[data-sonner-toast]').filter({ hasText: message });
  await expect(toast.first()).toBeVisible({ timeout: 5000 });
}

/**
 * Navegar a una lista específica
 */
export async function goToList(page: Page, listId: string) {
  await page.goto(`/lists/${listId}`);
  await expect(page.locator('button:has-text("Añadir Producto")')).toBeVisible({
    timeout: 15000,
  });
}

/**
 * Esperar carga de datos en el dashboard (lista de listas)
 * El h2 "Mis Listas" se renderiza antes de que lleguen los datos;
 * hay que esperar a que desaparezca el texto de carga.
 */
export async function waitForDashboard(page: Page) {
  await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('text=Cargando tus listas')).toBeHidden({ timeout: 20000 });
}
