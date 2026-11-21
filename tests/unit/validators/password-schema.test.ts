/**
 * Tests CRÍTICOS - password-schema.ts
 * Validadores Zod de contraseñas (changePasswordSchema)
 */

import { changePasswordSchema, passwordSchema } from '@/features/auth/validators/password-schema';

const VALID_PASSWORD = 'Password123';

describe('passwordSchema', () => {
  it.each([
    ['Password123', 'contraseña válida completa'],
    ['abc123XYZ', 'mínimos con mayúscula y número'],
  ])('acepta %s (%s)', (value) => {
    const result = passwordSchema.safeParse(value);
    expect(result.success).toBe(true);
  });

  it('rechaza contraseñas demasiado cortas', () => {
    const result = passwordSchema.safeParse('Ab1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('al menos 8 caracteres');
    }
  });

  it('rechaza contraseñas sin minúscula', () => {
    const result = passwordSchema.safeParse('PASSWORD123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('minúscula');
    }
  });

  it('rechaza contraseñas sin mayúscula', () => {
    const result = passwordSchema.safeParse('password123');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('mayúscula');
    }
  });

  it('rechaza contraseñas sin número', () => {
    const result = passwordSchema.safeParse('Passwordabc');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('número');
    }
  });
});

describe('changePasswordSchema', () => {
  const validData = {
    currentPassword: 'OldPassword1',
    newPassword: VALID_PASSWORD,
    confirmPassword: VALID_PASSWORD,
  };

  it('acepta un cambio de contraseña válido', () => {
    const result = changePasswordSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it.each([
    ['currentPassword', '', 'obligatoria'],
    ['newPassword', 'corta', 'contraseña'],
  ])('exige campo obligatorio %s', (field, value) => {
    const result = changePasswordSchema.safeParse({
      ...validData,
      [field]: field === 'newPassword' ? 'Ab1' : value,
      confirmPassword: field === 'confirmPassword' ? value : validData.confirmPassword,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza si no se confirma la nueva contraseña', () => {
    const result = changePasswordSchema.safeParse({ ...validData, confirmPassword: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmPasswordError = result.error.errors.find((e) => e.path.includes('confirmPassword'));
      expect(confirmPasswordError?.message).toContain('confirmar la nueva contraseña');
    }
  });

  it('rechaza si la confirmación no coincide con la nueva contraseña', () => {
    const result = changePasswordSchema.safeParse({ ...validData, confirmPassword: 'Distinta123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const mismatchError = result.error.errors.find((e) => e.path.includes('confirmPassword'));
      expect(mismatchError?.message).toBe('Las contraseñas no coinciden');
    }
  });

  it('rechaza si la nueva contraseña es igual a la actual', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: VALID_PASSWORD,
      newPassword: VALID_PASSWORD,
      confirmPassword: VALID_PASSWORD,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const sameError = result.error.errors.find((e) => e.path.includes('newPassword'));
      expect(sameError?.message).toContain('diferente a la actual');
    }
  });

  it('rechaza si la nueva contraseña no cumple el formato', () => {
    const result = changePasswordSchema.safeParse({
      ...validData,
      newPassword: 'password123',
      confirmPassword: 'password123',
    });
    expect(result.success).toBe(false);
  });
});
