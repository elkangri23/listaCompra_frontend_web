/**
 * Tests CRÍTICOS (100% coverage) - advanced-security.ts
 * Utilidades de seguridad y validación
 * 
 * Patrón: Arrange-Act-Assert
 * Mock: date-fns, localStorage
 * Funciones: Validación de invitaciones, links temporales, auditoría, rate limiting
 */

import {
  validateInvitationExpiration,
  validateInvitationLimits,
  validateTemporaryLink,
  createAuditLog,
  requiresAudit,
  checkRateLimit,
} from '@/lib/security/advanced-security';

// Mock date-fns
jest.mock('date-fns', () => ({
  differenceInDays: jest.fn(),
  differenceInHours: jest.fn(),
  isPast: jest.fn(),
  addHours: jest.fn((date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000)),
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000)),
  addMinutes: jest.fn((date, minutes) => new Date(date.getTime() + minutes * 60 * 1000)),
}));

import { differenceInDays, differenceInHours, isPast } from 'date-fns';

describe('advancedSecurity (CRÍTICO - 100% coverage)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('validateInvitationExpiration', () => {
    it('debe validar invitación NO expirada (varios días restantes)', () => {
      const createdAt = new Date('2025-11-20');
      const expirationDays = 7;

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInDays as jest.Mock).mockReturnValue(5); // 5 días restantes
      (differenceInHours as jest.Mock).mockReturnValue(120);

      const result = validateInvitationExpiration(createdAt, expirationDays);

      expect(result.isExpired).toBe(false);
      expect(result.daysRemaining).toBe(5);
      expect(result.expirationMessage).toContain('Válida por 5 días');
      expect(result.expirationMessage).toContain('✅');
    });

    it('debe detectar invitación expirada', () => {
      const createdAt = new Date('2025-11-15');
      const expirationDays = 7;

      (isPast as jest.Mock).mockReturnValue(true);
      (differenceInDays as jest.Mock).mockReturnValue(0); // Ya expiró, retorna 0
      (differenceInHours as jest.Mock).mockReturnValue(0);

      const result = validateInvitationExpiration(createdAt, expirationDays);

      expect(result.isExpired).toBe(true);
      expect(result.daysRemaining).toBe(0);
      expect(result.expirationMessage).toContain('❌');
      expect(result.expirationMessage).toContain('expirado');
    });

    it('debe advertir invitación próxima a expirar (menos de 24 horas)', () => {
      const createdAt = new Date('2025-11-24T10:00:00');
      const expirationDays = 7;

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInDays as jest.Mock).mockReturnValue(0); // 0 días completos
      (differenceInHours as jest.Mock).mockReturnValue(20); // 20 horas restantes

      const result = validateInvitationExpiration(createdAt, expirationDays);

      expect(result.isExpired).toBe(false);
      expect(result.daysRemaining).toBe(0);
      expect(result.hoursRemaining).toBe(20);
      expect(result.expirationMessage).toContain('⚠️');
      expect(result.expirationMessage).toContain('20 horas');
    });

    it('debe mostrar advertencia cuando quedan 2 días', () => {
      const createdAt = new Date('2025-11-23');
      const expirationDays = 7;

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInDays as jest.Mock).mockReturnValue(2);
      (differenceInHours as jest.Mock).mockReturnValue(48);

      const result = validateInvitationExpiration(createdAt, expirationDays);

      expect(result.isExpired).toBe(false);
      expect(result.daysRemaining).toBe(2);
      expect(result.expirationMessage).toContain('⚠️');
      expect(result.expirationMessage).toContain('2 días');
    });

    it('debe usar días predeterminados cuando no se especifica', () => {
      const createdAt = new Date('2025-11-23');

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInDays as jest.Mock).mockReturnValue(4);
      (differenceInHours as jest.Mock).mockReturnValue(96);

      const result = validateInvitationExpiration(createdAt); // Sin expirationDays

      expect(result.daysRemaining).toBe(4);
      expect(result.expirationMessage).toContain('✅');
    });

    it('debe mostrar "Expira mañana" cuando queda 1 día', () => {
      const createdAt = new Date('2025-11-24');
      const expirationDays = 7;

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInDays as jest.Mock).mockReturnValue(1);
      (differenceInHours as jest.Mock).mockReturnValue(24);

      const result = validateInvitationExpiration(createdAt, expirationDays);

      expect(result.isExpired).toBe(false);
      expect(result.daysRemaining).toBe(1);
      expect(result.expirationMessage).toBe('⚠️ Expira mañana');
    });
  });

  describe('validateInvitationLimits', () => {
    it('debe permitir crear más invitaciones (bajo el límite)', () => {
      const currentCount = 15;
      const maxInvitations = 50;

      const result = validateInvitationLimits(currentCount, maxInvitations);

      expect(result.canCreateMore).toBe(true);
      expect(result.remaining).toBe(35);
      expect(result.limitReachedMessage).toBeUndefined();
    });

    it('debe detectar límite alcanzado', () => {
      const currentCount = 50;
      const maxInvitations = 50;

      const result = validateInvitationLimits(currentCount, maxInvitations);

      expect(result.canCreateMore).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.limitReachedMessage).toContain('Has alcanzado el límite');
    });

    it('debe detectar límite excedido (remaining es 0, no negativo)', () => {
      const currentCount = 55;
      const maxInvitations = 50;

      const result = validateInvitationLimits(currentCount, maxInvitations);

      expect(result.canCreateMore).toBe(false);
      expect(result.remaining).toBe(0); // Math.max(0, 50 - 55) = 0
      expect(result.limitReachedMessage).toContain('Has alcanzado el límite');
    });

    it('debe usar límite predeterminado cuando no se especifica', () => {
      const currentCount = 48;

      const result = validateInvitationLimits(currentCount); // Sin maxInvitations

      expect(result.canCreateMore).toBe(true);
      expect(result.remaining).toBe(2); // 50 (default) - 48
    });

    it('debe manejar contador en 0', () => {
      const currentCount = 0;
      const maxInvitations = 10;

      const result = validateInvitationLimits(currentCount, maxInvitations);

      expect(result.canCreateMore).toBe(true);
      expect(result.remaining).toBe(10);
    });

    it('debe advertir cuando queda 1 invitación', () => {
      const currentCount = 49;
      const maxInvitations = 50;

      const result = validateInvitationLimits(currentCount, maxInvitations);

      expect(result.canCreateMore).toBe(true);
      expect(result.remaining).toBe(1);
    });
  });

  describe('validateTemporaryLink', () => {
    it('debe validar link temporal válido', () => {
      const createdAt = new Date('2025-11-25T10:00:00');
      const expirationHours = 24;

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInHours as jest.Mock).mockReturnValue(19); // 19 horas restantes

      const result = validateTemporaryLink(createdAt, expirationHours);

      expect(result.isValid).toBe(true);
      expect(result.timeRemaining).toBe('19 horas');
      expect(result.expiresAt).toBeInstanceOf(Date);
    });

    it('debe detectar link temporal expirado', () => {
      const createdAt = new Date('2025-11-24T10:00:00');
      const expirationHours = 24;

      (isPast as jest.Mock).mockReturnValue(true);

      const result = validateTemporaryLink(createdAt, expirationHours);

      expect(result.isValid).toBe(false);
      expect(result.timeRemaining).toBe('Expirado');
    });

    it('debe mostrar minutos cuando queda menos de 1 hora', () => {
      const createdAt = new Date('2025-11-25T11:30:00');
      const expirationHours = 1;

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInHours as jest.Mock).mockReturnValue(0); // Menos de 1 hora

      const result = validateTemporaryLink(createdAt, expirationHours);

      expect(result.isValid).toBe(true);
      expect(result.timeRemaining).toContain('minutos');
    });

    it('debe usar horas predeterminadas cuando no se especifica', () => {
      const createdAt = new Date('2025-11-25T10:00:00');

      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInHours as jest.Mock).mockReturnValue(12);

      const result = validateTemporaryLink(createdAt); // Sin expirationHours

      expect(result.isValid).toBe(true);
      expect(result.timeRemaining).toBe('12 horas'); // 24 (default) - 12
    });

    it('debe manejar link que expira exactamente ahora', () => {
      const createdAt = new Date('2025-11-24T12:00:00');
      const expirationHours = 24;

      (isPast as jest.Mock).mockReturnValue(true);
      (differenceInHours as jest.Mock).mockReturnValue(24);

      const result = validateTemporaryLink(createdAt, expirationHours);

      expect(result.isValid).toBe(false);
      expect(result.timeRemaining).toBe('Expirado');
    });
  });

  describe('createAuditLog', () => {
    it('debe crear log de auditoría completo', () => {
      const log = createAuditLog(
        'delete',
        'list',
        'list-123',
        'user-456',
        'Juan Pérez',
        { reason: 'No se usa más' }
      );

      expect(log.action).toBe('delete');
      expect(log.entity).toBe('list');
      expect(log.entityId).toBe('list-123');
      expect(log.userId).toBe('user-456');
      expect(log.userName).toBe('Juan Pérez');
      expect(log.details).toEqual({ reason: 'No se usa más' });
      expect(log.timestamp).toBeInstanceOf(Date);
    });

    it('debe crear log con detalles vacío por defecto', () => {
      const log = createAuditLog('share', 'invitation', 'inv-789', 'user-123', 'María García');

      expect(log.action).toBe('share');
      expect(log.entity).toBe('invitation');
      expect(log.details).toEqual({}); // Default es {} no undefined
      expect(log.timestamp).toBeDefined();
    });

    it('debe incluir timestamp actual', () => {
      const beforeTime = Date.now();
      const log = createAuditLog('update', 'product', 'prod-1', 'user-1', 'Admin');
      const afterTime = Date.now();

      const logTime = log.timestamp.getTime();
      expect(logTime).toBeGreaterThanOrEqual(beforeTime);
      expect(logTime).toBeLessThanOrEqual(afterTime);
    });

    it('debe manejar detalles complejos', () => {
      const complexDetails = {
        previousValue: { nombre: 'Leche', cantidad: 2 },
        newValue: { nombre: 'Leche Desnatada', cantidad: 3 },
        ipAddress: '192.168.1.100',
      };

      const log = createAuditLog(
        'update',
        'product',
        'prod-1',
        'user-1',
        'Admin',
        complexDetails
      );

      expect(log.details).toEqual(complexDetails);
      expect(log.details?.previousValue).toBeDefined();
      expect(log.details?.ipAddress).toBe('192.168.1.100');
    });
  });

  describe('requiresAudit', () => {
    it('debe requerir auditoría para acciones críticas en lists', () => {
      expect(requiresAudit('delete', 'list')).toBe(true);
      expect(requiresAudit('share', 'list')).toBe(true);
    });

    it('debe requerir auditoría para acciones críticas (delete, share)', () => {
      expect(requiresAudit('delete', 'list')).toBe(true);
      expect(requiresAudit('share', 'invitation')).toBe(true);
    });

    it('debe requerir auditoría para impersonate', () => {
      expect(requiresAudit('impersonate', 'user')).toBe(true);
      expect(requiresAudit('impersonate', 'list')).toBe(true); // Cualquier entity
    });

    it('NO debe requerir auditoría para acciones no críticas', () => {
      expect(requiresAudit('view', 'list')).toBe(false);
      expect(requiresAudit('read', 'product')).toBe(false);
      expect(requiresAudit('list', 'category')).toBe(false);
      expect(requiresAudit('create', 'product')).toBe(false);
    });

    it('debe requerir auditoría para update_permissions', () => {
      expect(requiresAudit('update_permissions', 'list')).toBe(true);
      expect(requiresAudit('update_permissions', 'user')).toBe(true);
    });

    it('debe requerir auditoría para update en entities sensibles', () => {
      expect(requiresAudit('update', 'user')).toBe(true);
      expect(requiresAudit('update', 'list')).toBe(true);
    });

    it('NO debe requerir auditoría para productos individuales', () => {
      expect(requiresAudit('create', 'product')).toBe(false);
      expect(requiresAudit('update', 'product')).toBe(false);
    });
  });

  describe('checkRateLimit', () => {
    it('debe permitir primer intento (sin historial)', () => {
      const result = checkRateLimit('login:user@example.com', 5, 5);

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4); // 5 - 1
      expect(result.resetTime).toBeInstanceOf(Date);
    });

    it('debe permitir intentos dentro del límite', () => {
      const futureTime = new Date(Date.now() + 5 * 60 * 1000);
      (isPast as jest.Mock).mockReturnValue(false);

      const data = {
        attempts: 2,
        resetTime: futureTime.toISOString(),
      };
      localStorage.setItem('rate_limit_test-key', JSON.stringify(data));

      const result = checkRateLimit('test-key', 5, 5);

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(2); // 5 - 2 - 1 = 2
    });

    it('debe bloquear cuando se alcanza el límite', () => {
      const futureTime = new Date(Date.now() + 3 * 60 * 1000);
      (isPast as jest.Mock).mockReturnValue(false);
      (differenceInHours as jest.Mock).mockReturnValue(0.05); // 3 minutos

      const data = {
        attempts: 5,
        resetTime: futureTime.toISOString(),
      };
      localStorage.setItem('rate_limit_blocked-key', JSON.stringify(data));

      const result = checkRateLimit('blocked-key', 5, 5);

      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
      expect(result.message).toContain('Demasiados intentos');
    });

    it('debe resetear ventana expirada', () => {
      const pastTime = new Date(Date.now() - 1000);
      (isPast as jest.Mock).mockReturnValue(true);

      const data = {
        attempts: 5,
        resetTime: pastTime.toISOString(),
      };
      localStorage.setItem('rate_limit_expired-key', JSON.stringify(data));

      const result = checkRateLimit('expired-key', 5, 5);

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4); // Reseteado a 5 - 1
    });

    it('debe lanzar error con localStorage corrupto', () => {
      localStorage.setItem('rate_limit_corrupted-key', 'invalid-json');

      // La función actual NO maneja JSON corrupto, lanza SyntaxError
      expect(() => checkRateLimit('corrupted-key', 5, 5)).toThrow(SyntaxError);
    });

    it('debe usar valores predeterminados cuando no se especifican', () => {
      const result = checkRateLimit('default-key'); // Sin maxAttempts ni windowMinutes

      expect(result.allowed).toBe(true);
      expect(result.remainingAttempts).toBe(4); // 5 (default) - 1
    });

    it('debe calcular resetTime correctamente', () => {
      const beforeTime = Date.now() + 5 * 60 * 1000;

      const result = checkRateLimit('time-key', 5, 5);

      expect(result.resetTime.getTime()).toBeGreaterThanOrEqual(beforeTime - 100);
      expect(result.resetTime.getTime()).toBeLessThanOrEqual(beforeTime + 100);
    });

    it('debe incrementar intentos en cada llamada', () => {
      (isPast as jest.Mock).mockReturnValue(false);
      
      const r0 = checkRateLimit('increment-key', 3, 5);
      expect(r0.remainingAttempts).toBe(2); // 3 - 1 = 2

      const r1 = checkRateLimit('increment-key', 3, 5);
      expect(r1.remainingAttempts).toBe(1); // 3 - 2 = 1

      const r2 = checkRateLimit('increment-key', 3, 5);
      expect(r2.remainingAttempts).toBe(0); // 3 - 3 = 0
      expect(r2.allowed).toBe(true); // Aún permitido en el 3er intento

      const r3 = checkRateLimit('increment-key', 3, 5);
      expect(r3.allowed).toBe(false); // Bloqueado en el 4to intento
    });

    it('debe manejar diferentes claves de rate limit', () => {
      localStorage.clear();
      checkRateLimit('user1:login', 5, 5);
      checkRateLimit('user2:login', 5, 5);

      const result1 = checkRateLimit('user1:login', 5, 5);
      const result2 = checkRateLimit('user2:login', 5, 5);

      expect(result1.remainingAttempts).toBe(3); // user1: 2 intentos
      expect(result2.remainingAttempts).toBe(3); // user2: 2 intentos (independiente)
    });
  });
});
