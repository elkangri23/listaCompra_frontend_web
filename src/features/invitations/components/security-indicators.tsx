import { Badge } from '@/components/ui/badge';
import { validateInvitationExpiration, type InvitationExpirationResult } from '@/lib/security/advanced-security';

interface InvitationExpirationBadgeProps {
  createdAt: string;
  expirationDays?: number;
}

/**
 * Badge visual para mostrar estado de expiración de invitaciones
 */
export function InvitationExpirationBadge({
  createdAt,
  expirationDays = 7,
}: InvitationExpirationBadgeProps) {
  const result: InvitationExpirationResult = validateInvitationExpiration(
    createdAt,
    expirationDays
  );

  const getBadgeVariant = () => {
    if (result.isExpired) return 'destructive';
    if (result.daysRemaining <= 1) return 'destructive';
    if (result.daysRemaining <= 3) return 'secondary';
    return 'default';
  };

  return (
    <Badge variant={getBadgeVariant()} className="text-xs">
      {result.expirationMessage}
    </Badge>
  );
}

interface TemporaryLinkIndicatorProps {
  createdAt: string;
  expirationHours?: number;
}

/**
 * Indicador para enlaces temporales con tiempo de caducidad
 */
export function TemporaryLinkIndicator({
  createdAt,
  expirationHours = 24,
}: TemporaryLinkIndicatorProps) {
  const createdDate = new Date(createdAt);
  const expiresAt = new Date(createdDate);
  expiresAt.setHours(expiresAt.getHours() + expirationHours);

  const isExpired = new Date() > expiresAt;
  const hoursRemaining = Math.max(
    0,
    Math.floor((expiresAt.getTime() - new Date().getTime()) / 3600000)
  );

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`h-2 w-2 rounded-full ${isExpired ? 'bg-red-500' : 'bg-green-500'}`} />
      <span className={isExpired ? 'text-destructive' : 'text-muted-foreground'}>
        {isExpired ? (
          'Enlace expirado'
        ) : hoursRemaining < 1 ? (
          `Expira en menos de 1 hora`
        ) : hoursRemaining < 24 ? (
          `Expira en ${hoursRemaining}h`
        ) : (
          `Expira en ${Math.floor(hoursRemaining / 24)} días`
        )}
      </span>
    </div>
  );
}

interface InvitationLimitsWarningProps {
  currentCount: number;
  maxInvitations?: number;
}

/**
 * Warning cuando el usuario está cerca del límite de invitaciones
 */
export function InvitationLimitsWarning({
  currentCount,
  maxInvitations = 50,
}: InvitationLimitsWarningProps) {
  const remaining = Math.max(0, maxInvitations - currentCount);
  const percentage = (currentCount / maxInvitations) * 100;

  if (percentage < 80) {
    return null; // No mostrar warning si está por debajo del 80%
  }

  return (
    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-900">
            Límite de invitaciones
          </h4>
          <p className="text-sm text-yellow-800 mt-1">
            Has usado {currentCount} de {maxInvitations} invitaciones disponibles.
            {remaining > 0 ? (
              <> Te quedan {remaining} invitaciones.</>
            ) : (
              <> Has alcanzado el límite. Elimina invitaciones antiguas para crear nuevas.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
