import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';

/**
 * Tests E2E — CU-MFA fase 1: login en dos pasos con TOTP (mock-api-server)
 * El mock simula el backend real: /auth/login con TOTP activo devuelve
 * mfaRequired+challengeId; /auth/login/mfa valida el código con el mismo
 * algoritmo RFC 6238 (ventana ±1). El E2E calcula el código esperado.
 */

const MFA_USER = { email: 'mfa@example.com', password: 'Password123!' };
const MFA_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const BACKUP_CODE = 'AAAA-ZZZZ';

/** TOTP RFC 6238 (SHA-1, 6 dígitos, 30s) — idéntico al helper del mock */
function totpCodeAt(secretBase32: string, timeSeconds: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of secretBase32.replace(/=+$/, '')) {
    const idx = alphabet.indexOf(ch.toUpperCase());
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  const key = Buffer.from(bytes);
  const counter = Math.floor(timeSeconds / 30);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const hmac = crypto.createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 1_000_000).padStart(6, '0');
}

function currentTotp(): string {
  return totpCodeAt(MFA_SECRET, Math.floor(Date.now() / 1000));
}

async function loginStep1(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#email', MFA_USER.email);
  await page.fill('#password', MFA_USER.password);
  await page.click('button[type="submit"]');
  // Paso 2: formulario MFA visible
  await expect(page.getByRole('heading', { name: 'Verificación en dos pasos' })).toBeVisible({
    timeout: 15000,
  });
}

test.describe('Login dos pasos con TOTP (CU-MFA fase 1)', () => {
  test('paso 2 con código incorrecto → error y no entra al dashboard', async ({ page }) => {
    await loginStep1(page);

    const codeInput = page.getByLabel('Código de verificación');
    await codeInput.fill('000000');
    await page.getByRole('button', { name: 'Verificar' }).click();

    await expect(page.locator('#mfa-error')).toHaveText(/no es válido/i, { timeout: 10000 });
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('paso 2 con código TOTP correcto → dashboard', async ({ page }) => {
    await loginStep1(page);

    await page.getByLabel('Código de verificación').fill(currentTotp());
    await page.getByRole('button', { name: 'Verificar' }).click();

    // Sesión completa: dashboard con listas
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });
  });

  test('código que cruza el límite de ventana sigue siendo válido (±30s)', async ({ page }) => {
    // El código del período anterior o siguiente también debe pasar (tolerancia)
    const prevOrNext = totpCodeAt(MFA_SECRET, Math.floor(Date.now() / 1000) - 30);
    await loginStep1(page);
    await page.getByLabel('Código de verificación').fill(prevOrNext);
    await page.getByRole('button', { name: 'Verificar' }).click();
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });
  });

  test('paso 2 con código de respaldo → dashboard', async ({ page }) => {
    await loginStep1(page);

    await page.getByRole('button', { name: 'Usar un código de respaldo' }).click();
    await page.getByLabel('Código de respaldo').fill(BACKUP_CODE);
    await page.getByRole('button', { name: 'Verificar' }).click();

    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 15000 });
  });

  test('código de respaldo inválido → error', async ({ page }) => {
    await loginStep1(page);

    await page.getByRole('button', { name: 'Usar un código de respaldo' }).click();
    await page.getByLabel('Código de respaldo').fill('XXXX-YYYY');
    await page.getByRole('button', { name: 'Verificar' }).click();

    await expect(page.locator('#mfa-error')).toHaveText(/no es válido/i, { timeout: 10000 });
  });

  test('cancelar el paso 2 vuelve al formulario de credenciales', async ({ page }) => {
    await loginStep1(page);

    await page.getByRole('button', { name: 'Volver a iniciar sesión' }).click();

    await expect(page.locator('#email')).toBeVisible({ timeout: 10000 });
  });

  test('validación local: código incompleto muestra error sin llamar al backend', async ({ page }) => {
    await loginStep1(page);

    await page.getByLabel('Código de verificación').fill('12');
    await page.getByRole('button', { name: 'Verificar' }).click();

    await expect(page.locator('#mfa-error')).toHaveText(/6 dígitos/i, { timeout: 5000 });
  });
});
