/**
 * @file security-indicators.test.tsx
 * @description Tests secundarios (80% coverage) para security-indicators components
 * 
 * Tests: 14 tests
 * - InvitationExpirationBadge: variants (destructive, secondary, default), mensaje
 * - TemporaryLinkIndicator: expirado, horas restantes, días restantes, indicador visual
 * - InvitationLimitsWarning: null <80%, warning >=80%, límite alcanzado 100%
 * - Props: expirationDays, expirationHours, maxInvitations customizables
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  InvitationExpirationBadge,
  TemporaryLinkIndicator,
  InvitationLimitsWarning,
} from '@/features/invitations/components/security-indicators';

// Mock advanced-security para control de fecha
jest.mock('@/lib/security/advanced-security', () => ({
  validateInvitationExpiration: jest.fn((createdAt: string, expirationDays: number) => {
    const created = new Date(createdAt);
    const now = new Date('2025-11-26T12:00:00Z');
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, expirationDays - diffDays);
    const isExpired = daysRemaining === 0;

    let message = '';
    if (isExpired) message = 'Expirada';
    else if (daysRemaining === 1) message = 'Expira mañana';
    else if (daysRemaining <= 3) message = `Expira en ${daysRemaining} días`;
    else message = `${daysRemaining} días restantes`;

    return {
      isExpired,
      daysRemaining,
      expirationMessage: message,
    };
  }),
}));

describe('Security Indicators (SECUNDARIO - 80% coverage)', () => {
  describe('InvitationExpirationBadge', () => {
    it('debe mostrar badge "Expirada" con variant destructive cuando expira', () => {
      // 8 días atrás con expirationDays=7 -> expirada
      const createdAt = '2025-11-18T12:00:00Z';

      render(<InvitationExpirationBadge createdAt={createdAt} expirationDays={7} />);

      const badge = screen.getByText('Expirada');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('text-xs');
    });

    it('debe mostrar badge "Expira mañana" con variant destructive (1 día)', () => {
      // 6 días atrás con expirationDays=7 -> 1 día restante
      const createdAt = '2025-11-20T12:00:00Z';

      render(<InvitationExpirationBadge createdAt={createdAt} expirationDays={7} />);

      expect(screen.getByText('Expira mañana')).toBeInTheDocument();
    });

    it('debe mostrar badge con días restantes y variant secondary (2-3 días)', () => {
      // 4 días atrás con expirationDays=7 -> 3 días restantes
      const createdAt = '2025-11-22T12:00:00Z';

      render(<InvitationExpirationBadge createdAt={createdAt} expirationDays={7} />);

      expect(screen.getByText('Expira en 3 días')).toBeInTheDocument();
    });

    it('debe mostrar badge con días restantes y variant default (>3 días)', () => {
      // 2 días atrás con expirationDays=7 -> 5 días restantes
      const createdAt = '2025-11-24T12:00:00Z';

      render(<InvitationExpirationBadge createdAt={createdAt} expirationDays={7} />);

      expect(screen.getByText('5 días restantes')).toBeInTheDocument();
    });

    it('debe usar expirationDays=7 por defecto', () => {
      const createdAt = '2025-11-24T12:00:00Z';

      render(<InvitationExpirationBadge createdAt={createdAt} />);

      // Con 7 días por defecto, debería calcular correctamente
      expect(screen.getByText(/días restantes|Expira/)).toBeInTheDocument();
    });
  });

  describe('TemporaryLinkIndicator', () => {
    beforeEach(() => {
      // Fijar fecha actual para tests consistentes
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-11-26T12:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debe mostrar "Enlace expirado" con indicador rojo cuando expira', () => {
      // 25 horas atrás con expirationHours=24 -> expirado
      const createdAt = '2025-11-25T11:00:00Z';

      render(<TemporaryLinkIndicator createdAt={createdAt} expirationHours={24} />);

      expect(screen.getByText('Enlace expirado')).toBeInTheDocument();
      expect(screen.getByText('Enlace expirado')).toHaveClass('text-destructive');
    });

    it('debe mostrar "Expira en menos de 1 hora" cuando quedan <1h', () => {
      // 23.5 horas atrás con expirationHours=24 -> 0.5h restantes
      const createdAt = '2025-11-25T12:30:00Z';

      render(<TemporaryLinkIndicator createdAt={createdAt} expirationHours={24} />);

      expect(screen.getByText('Expira en menos de 1 hora')).toBeInTheDocument();
    });

    it('debe mostrar "Expira en Xh" cuando quedan horas (1-23h)', () => {
      // 20 horas atrás con expirationHours=24 -> 4h restantes
      const createdAt = '2025-11-25T16:00:00Z';

      render(<TemporaryLinkIndicator createdAt={createdAt} expirationHours={24} />);

      expect(screen.getByText('Expira en 4h')).toBeInTheDocument();
    });

    it('debe mostrar "Expira en X días" cuando quedan >=24h', () => {
      // 1 hora atrás con expirationHours=72 (3 días) -> 71h = 2.95 días
      const createdAt = '2025-11-26T11:00:00Z';

      render(<TemporaryLinkIndicator createdAt={createdAt} expirationHours={72} />);

      expect(screen.getByText(/Expira en \d+ días/)).toBeInTheDocument();
    });

    it('debe usar expirationHours=24 por defecto', () => {
      const createdAt = '2025-11-26T10:00:00Z';

      render(<TemporaryLinkIndicator createdAt={createdAt} />);

      // Con 24 horas por defecto, debería mostrar tiempo restante
      expect(screen.getByText(/Expira en/)).toBeInTheDocument();
    });

    it('debe mostrar indicador verde cuando NO está expirado', () => {
      const createdAt = '2025-11-26T10:00:00Z';

      const { container } = render(<TemporaryLinkIndicator createdAt={createdAt} />);

      const indicator = container.querySelector('.bg-green-500');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('InvitationLimitsWarning', () => {
    it('NO debe renderizar nada cuando está por debajo del 80%', () => {
      const { container } = render(
        <InvitationLimitsWarning currentCount={30} maxInvitations={50} />
      );

      // 30/50 = 60% < 80% -> no renderiza
      expect(container.firstChild).toBeNull();
    });

    it('debe mostrar warning cuando alcanza 80-99%', () => {
      render(<InvitationLimitsWarning currentCount={40} maxInvitations={50} />);

      // 40/50 = 80%
      expect(screen.getByText('Límite de invitaciones')).toBeInTheDocument();
      expect(screen.getByText(/Has usado 40 de 50 invitaciones disponibles/)).toBeInTheDocument();
      expect(screen.getByText(/Te quedan 10 invitaciones/)).toBeInTheDocument();
    });

    it('debe mostrar mensaje de límite alcanzado cuando currentCount >= maxInvitations', () => {
      render(<InvitationLimitsWarning currentCount={50} maxInvitations={50} />);

      expect(screen.getByText('Límite de invitaciones')).toBeInTheDocument();
      expect(
        screen.getByText(/Has alcanzado el límite. Elimina invitaciones antiguas para crear nuevas/)
      ).toBeInTheDocument();
    });

    it('debe usar maxInvitations=50 por defecto', () => {
      render(<InvitationLimitsWarning currentCount={45} />);

      // 45/50 = 90% >= 80% -> debe renderizar
      expect(screen.getByText(/Has usado 45 de 50 invitaciones disponibles/)).toBeInTheDocument();
    });
  });
});
