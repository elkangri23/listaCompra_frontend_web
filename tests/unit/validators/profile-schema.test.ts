/**
 * Tests CRÍTICOS - profile-schema.ts
 * Validador Zod del formulario de perfil
 */

import { profileSchema } from '@/features/auth/validators/profile-schema';

const validProfile = {
  nombre: 'Ana García',
  email: 'ana@example.com',
  bio: 'Usuario de listaCompra',
};

describe('profileSchema', () => {
  it('acepta un perfil válido', () => {
    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('acepta bio vacía (opcional)', () => {
    const result = profileSchema.safeParse({ ...validProfile, bio: '' });
    expect(result.success).toBe(true);
  });

  it('acepta bio indefinida', () => {
    const { bio, ...rest } = validProfile;
    expect(bio).toBeDefined();
    const result = profileSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it.each([
    ['', 'obligatorio'],
    ['A', 'al menos 2 caracteres'],
  ])('rechaza nombre inválido "%s"', (nombre) => {
    const result = profileSchema.safeParse({ ...validProfile, nombre });
    expect(result.success).toBe(false);
  });

  it('rechaza nombres demasiado largos', () => {
    const result = profileSchema.safeParse({ ...validProfile, nombre: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rechaza nombres con números o símbolos', () => {
    const result = profileSchema.safeParse({ ...validProfile, nombre: 'Ana123!' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('letras');
    }
  });

  it('acepta nombres con acentos, ñ y espacios', () => {
    const result = profileSchema.safeParse({ ...validProfile, nombre: 'Ángel Muñoz Ü' });
    expect(result.success).toBe(true);
  });

  it('rechaza emails inválidos', () => {
    const result = profileSchema.safeParse({ ...validProfile, email: 'no-es-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('correo electrónico válido');
    }
  });

  it('rechaza bios demasiado largas', () => {
    const result = profileSchema.safeParse({ ...validProfile, bio: 'x'.repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('500 caracteres');
    }
  });
});
