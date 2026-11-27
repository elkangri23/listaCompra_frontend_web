import { test, expect } from '@playwright/test';
import type { CDPSession } from '@playwright/test';
import { execSync } from 'node:child_process';
import crypto from 'node:crypto';

/**
 * Fixture auto-reparable: el usuario puede desapareer si otra prueba trunca
 * la tabla real. Re-inserta con ON CONFLICT si no existe.
 */
const PASSKEY_HASH = '$2b$10$MJMHpVqx5JnY6sTy2eDHe.CFmdvbxclx2D/eeRZiYIVTR6lo2PrCe';

const FIXTURE_SQL = [
  "INSERT INTO usuarios (id, email, password, nombre, rol, activo, \"emailVerificado\", \"fechaCreacion\", \"fechaActualizacion\")",
  "VALUES (gen_random_uuid()::text, 'e2e-passkey@example.com', '" + PASSKEY_HASH + "', 'Usuario Passkey Dos', 'USUARIO', true, true, now(), now())",
  "ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, \"emailVerificado\" = true, activo = true;",
].join(' ');

function ensureFixtureUser() {
  // stdin para evitar el lío de quoting de Windows con -c
  execSync('docker exec -i lista_compra_postgres psql -U lista_user -d lista_compra_db', {
    input: FIXTURE_SQL,
    stdio: 'pipe',
    timeout: 15000,
  });
}


/**
 * Tests E2E REALES — CU-MFA fase 2: passkeys con autenticador virtual (CDP)
 *
 * Este spec corre contra el BACKEND REAL (localhost:3333) y el frontend
 * compilado (localhost:3000). Requiere:
 *   - Postgres con migraciones aplicadas (mfa fase 1 + 2)
 *   - Backend arrancado (npx ts-node -r tsconfig-paths/register src/main.ts)
 *   - Frontend: npm run build && npm run start
 *   - Usuario fixture 'e2e-passkey@example.com' / 'Password123!' (emailVerificado)
 *   - WEBAUTHN_RP_ID=localhost, WEBAUTHN_ORIGIN=http://localhost:3000
 *
 * NO se ejecuta en CI: test.skip(!process.env['MFA_E2E_REAL']).
 * Ejecutar: MFA_E2E_REAL=1 npx playwright test tests/e2e/passkey-real.spec.ts
 */

test.skip(!process.env['MFA_E2E_REAL'], 'E2E real solo con MFA_E2E_REAL=1');

const REAL_USER = { email: 'e2e-passkey@example.com', password: 'Password123!' };

/** Activa un autenticador virtual CTAP2 (huella simulada automática) */
async function enableVirtualAuthenticator(page: import('@playwright/test').Page): Promise<CDPSession> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2' as never,
      transport: 'internal' as never,
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  return cdp;
}

test.describe.serial('Passkeys contra backend real (virtual authenticator)', () => {
  test('registro de passkey con step-up y login posterior sin contraseña', async ({ page }) => {
    test.setTimeout(120_000);
    ensureFixtureUser();
    await enableVirtualAuthenticator(page);

    // 1. Login con contraseña (cuenta sin TOTP → sesión completa)
    await page.goto('/login');
    await page.fill('#email', REAL_USER.email);
    await page.fill('#password', REAL_USER.password);
    await page.click('button[type="submit"]');
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 20000 });

    // 2. /profile → pestaña Seguridad → PasskeyList
    await page.goto('/profile');
    await page.getByRole('button', { name: /^seguridad$/i }).first().click();
    await expect(page.getByText(/Passkeys/).first()).toBeVisible({ timeout: 15000 });

    // 3. Añadir passkey: step-up con contraseña
    await page.getByRole('button', { name: 'Añadir passkey' }).click();
    await page.fill('#passkey-add-password', REAL_USER.password);
    await page.getByRole('button', { name: 'Continuar' }).click();

    // El navegador responde con el autenticador virtual (presencia automática):
    // la nueva passkey aparece listada en Seguridad
    await expect(
      page.getByText(/Sincronizada|De dispositivo/).first(),
    ).toBeVisible({ timeout: 30000 });

    // 4. Cerrar sesión y entrar SOLO con passkey
    await page.click('button:has-text("Cerrar Sesión")');
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

    await page.getByRole('button', { name: /iniciar sesión con passkey/i }).click();

    // La aserción virtual resuelve sin usuario presente → sesión + dashboard
    await expect(page.locator('h2:has-text("Mis Listas")')).toBeVisible({ timeout: 30000 });
  });
});
