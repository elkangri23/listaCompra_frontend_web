/**
 * Utilidades de seguridad avanzada
 * Validaciones de expiración, límites y auditoría
 */

import { differenceInDays, differenceInHours, isPast } from 'date-fns';

// ============================================================================
// Validación de Expiración de Invitaciones
// ============================================================================

export interface InvitationExpirationResult {
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  expirationMessage: string;
}

/**
 * Valida si una invitación ha expirado
 * @param createdAt Fecha de creación de la invitación
 * @param expirationDays Días hasta expiración (default: 7)
 */
export function validateInvitationExpiration(
  createdAt: string | Date,
  expirationDays: number = 7
): InvitationExpirationResult {
  const createdDate = new Date(createdAt);
  const expirationDate = new Date(createdDate);
  expirationDate.setDate(expirationDate.getDate() + expirationDays);

  const isExpired = isPast(expirationDate);
  const now = new Date();

  const daysRemaining = Math.max(0, differenceInDays(expirationDate, now));
  const hoursRemaining = Math.max(0, differenceInHours(expirationDate, now));

  let expirationMessage = '';
  
  if (isExpired) {
    expirationMessage = '❌ Esta invitación ha expirado';
  } else if (daysRemaining === 0) {
    expirationMessage = `⚠️ Expira en ${hoursRemaining} horas`;
  } else if (daysRemaining === 1) {
    expirationMessage = '⚠️ Expira mañana';
  } else if (daysRemaining <= 3) {
    expirationMessage = `⚠️ Expira en ${daysRemaining} días`;
  } else {
    expirationMessage = `✅ Válida por ${daysRemaining} días`;
  }

  return {
    isExpired,
    daysRemaining,
    hoursRemaining,
    expirationMessage,
  };
}

// ============================================================================
// Límites de Invitaciones
// ============================================================================

export interface InvitationLimitsResult {
  canCreateMore: boolean;
  remaining: number;
  limitReachedMessage?: string;
}

/**
 * Valida límites de invitaciones por usuario
 * @param currentCount Número actual de invitaciones activas
 * @param maxInvitations Límite máximo de invitaciones (default: 50)
 */
export function validateInvitationLimits(
  currentCount: number,
  maxInvitations: number = 50
): InvitationLimitsResult {
  const remaining = Math.max(0, maxInvitations - currentCount);
  const canCreateMore = remaining > 0;

  let limitReachedMessage: string | undefined;

  if (!canCreateMore) {
    limitReachedMessage = `Has alcanzado el límite de ${maxInvitations} invitaciones activas. Elimina invitaciones antiguas para crear nuevas.`;
  } else if (remaining <= 5) {
    limitReachedMessage = `⚠️ Solo te quedan ${remaining} invitaciones disponibles`;
  }

  return {
    canCreateMore,
    remaining,
    limitReachedMessage,
  };
}

// ============================================================================
// Validación de Enlaces Temporales
// ============================================================================

export interface TemporaryLinkResult {
  isValid: boolean;
  expiresAt: Date;
  timeRemaining: string;
}

/**
 * Valida enlaces temporales con tiempo de caducidad
 * @param createdAt Fecha de creación del enlace
 * @param expirationHours Horas hasta expiración (default: 24)
 */
export function validateTemporaryLink(
  createdAt: string | Date,
  expirationHours: number = 24
): TemporaryLinkResult {
  const createdDate = new Date(createdAt);
  const expiresAt = new Date(createdDate);
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  const isValid = !isPast(expiresAt);
  const now = new Date();
  const hoursRemaining = Math.max(0, differenceInHours(expiresAt, now));

  let timeRemaining = '';
  
  if (!isValid) {
    timeRemaining = 'Expirado';
  } else if (hoursRemaining < 1) {
    const minutesRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 60000));
    timeRemaining = `${minutesRemaining} minutos`;
  } else if (hoursRemaining < 24) {
    timeRemaining = `${hoursRemaining} horas`;
  } else {
    const daysRemaining = Math.floor(hoursRemaining / 24);
    timeRemaining = `${daysRemaining} días`;
  }

  return {
    isValid,
    expiresAt,
    timeRemaining,
  };
}

// ============================================================================
// Auditoría de Acciones Críticas
// ============================================================================

export interface AuditLogEntry {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: Record<string, unknown>;
}

/**
 * Genera entrada de log de auditoría para acciones críticas
 */
export function createAuditLog(
  action: 'create' | 'update' | 'delete' | 'share' | 'impersonate',
  entity: 'list' | 'product' | 'category' | 'store' | 'invitation' | 'user',
  entityId: string,
  userId: string,
  userName: string,
  details: Record<string, unknown> = {}
): AuditLogEntry {
  return {
    action,
    entity,
    entityId,
    userId,
    userName,
    timestamp: new Date(),
    details,
  };
}

/**
 * Determina si una acción requiere auditoría
 */
export function requiresAudit(
  action: string,
  entity: string
): boolean {
  const criticalActions = ['delete', 'share', 'impersonate', 'update_permissions'];
  const sensitiveEntities = ['user', 'invitation', 'list'];

  return (
    criticalActions.includes(action) ||
    (action === 'update' && sensitiveEntities.includes(entity))
  );
}

// ============================================================================
// Rate Limiting Visual (Frontend)
// ============================================================================

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime: Date;
  message?: string;
}

/**
 * Validación simple de rate limiting en frontend
 * Previene spam de requests
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMinutes: number = 5
): RateLimitResult {
  const storageKey = `rate_limit_${key}`;
  const storedData = localStorage.getItem(storageKey);

  const now = new Date();
  
  if (!storedData) {
    // Primera vez
    const resetTime = new Date(now.getTime() + windowMinutes * 60000);
    localStorage.setItem(
      storageKey,
      JSON.stringify({ attempts: 1, resetTime: resetTime.toISOString() })
    );
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime,
    };
  }

  const { attempts, resetTime: resetTimeStr } = JSON.parse(storedData);
  const resetTime = new Date(resetTimeStr);

  // Ventana expirada, reset
  if (isPast(resetTime)) {
    const newResetTime = new Date(now.getTime() + windowMinutes * 60000);
    localStorage.setItem(
      storageKey,
      JSON.stringify({ attempts: 1, resetTime: newResetTime.toISOString() })
    );
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime: newResetTime,
    };
  }

  // Dentro de la ventana
  if (attempts >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime,
      message: `Demasiados intentos. Intenta de nuevo en ${Math.ceil(differenceInHours(resetTime, now) * 60)} minutos.`,
    };
  }

  // Incrementar intentos
  localStorage.setItem(
    storageKey,
    JSON.stringify({ attempts: attempts + 1, resetTime: resetTimeStr })
  );

  return {
    allowed: true,
    remainingAttempts: maxAttempts - attempts - 1,
    resetTime,
  };
}
