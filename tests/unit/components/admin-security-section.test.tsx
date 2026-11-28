/**
 * Tests - AdminSecuritySection: pestaña Seguridad del panel (/admin, fase 5).
 * Resumen con las 4 tarjetas (2FA, fallos 24 h, Turnstile, periodo de
 * gracia), alertas calculadas, tabla de intentos con filtros y paginación,
 * skeletons y estados vacíos honestos.
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AdminSecuritySection } from '@/features/admin/components/admin-security-section';
import { adminService } from '@/features/admin/services/admin-service';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';

jest.mock('@/features/admin/services/admin-service');

const mockGetSecurityOverview = adminService.getSecurityOverview as jest.Mock;
const mockGetSecurityAlerts = adminService.getSecurityAlerts as jest.Mock;
const mockGetLoginAttempts = adminService.getLoginAttempts as jest.Mock;

const overview = {
  twoFactor: { enabled: 1, total: 3 },
  failedLoginsLast24h: 4,
  turnstile: { enabled: true },
  gracePeriod: {
    count: 1,
    accounts: [
      {
        email: 'gracia@ejemplo.com',
        eliminacionSolicitadaEn: '2026-11-03T10:00:00.000Z',
        daysLeft: 5,
      },
    ],
  },
  unavailable: {},
};

const alertsPage = {
  alerts: [
    {
      id: 'brute-force:victima@ejemplo.com',
      type: 'BRUTE_FORCE_EMAIL',
      severity: 'high',
      message: '6 intentos fallidos en 1 hora para victima@ejemplo.com',
      createdAt: '2026-11-28T10:00:00.000Z',
      relatedEmail: 'victima@ejemplo.com',
    },
    {
      id: 'admin-without-2fa:admin-id',
      type: 'ADMIN_WITHOUT_2FA',
      severity: 'medium',
      message: 'El administrador admin@ejemplo.com no tiene 2FA activado',
      createdAt: '2026-11-28T10:00:00.000Z',
      relatedEmail: 'admin@ejemplo.com',
    },
  ],
  total: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

const attemptsPage1 = {
  attempts: [
    {
      id: 'att-1',
      email: 'ana@ejemplo.com',
      success: true,
      reason: null,
      ipAddress: '1.2.3.4',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      createdAt: '2026-11-28T10:00:00.000Z',
    },
    {
      id: 'att-2',
      email: 'victima@ejemplo.com',
      success: false,
      reason: 'WRONG_PASSWORD',
      ipAddress: '9.9.9.9',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      createdAt: '2026-11-28T09:00:00.000Z',
    },
    {
      id: 'att-3',
      email: 'mac@ejemplo.com',
      success: true,
      reason: null,
      ipAddress: '3.3.3.3',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      createdAt: '2026-11-28T08:00:00.000Z',
    },
    {
      id: 'att-4',
      email: 'linux@ejemplo.com',
      success: false,
      reason: 'MFA_FAILED',
      ipAddress: '4.4.4.4',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
      createdAt: '2026-11-28T07:00:00.000Z',
    },
    {
      id: 'att-5',
      email: 'bot@ejemplo.com',
      success: false,
      reason: 'USER_NOT_FOUND',
      ipAddress: '5.5.5.5',
      userAgent: 'SomeBot/1.0',
      createdAt: '2026-11-28T06:00:00.000Z',
    },
    {
      id: 'att-6',
      email: 'sinagente@ejemplo.com',
      success: true,
      reason: null,
      ipAddress: null,
      userAgent: null,
      createdAt: '2026-11-28T05:00:00.000Z',
    },
  ],
  total: 6,
  page: 1,
  pageSize: 10,
  totalPages: 1,
};

const renderSection = () => {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return render(<AdminSecuritySection />, { wrapper });
};

const mockAllResolved = () => {
  mockGetSecurityOverview.mockResolvedValue(overview);
  mockGetSecurityAlerts.mockResolvedValue(alertsPage);
  mockGetLoginAttempts.mockResolvedValue(attemptsPage1);
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AdminSecuritySection', () => {
  it('muestra las 4 tarjetas del resumen con datos reales', async () => {
    mockAllResolved();
    renderSection();

    await waitFor(() => expect(screen.getByText('1 de 3')).toBeInTheDocument());
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Activado')).toBeInTheDocument();
    expect(screen.getByText('gracia@ejemplo.com · quedan 5 días')).toBeInTheDocument();
    expect(screen.getByText('2 sin 2FA')).toBeInTheDocument();
  });

  it('secciones a null → «sin datos aún», sin inventar valores', async () => {
    mockGetSecurityOverview.mockResolvedValue({
      ...overview,
      twoFactor: null,
      failedLoginsLast24h: null,
      gracePeriod: null,
      unavailable: { twoFactor: 'BD caída' },
    });
    mockGetSecurityAlerts.mockResolvedValue({ ...alertsPage, alerts: [], total: 0 });
    mockGetLoginAttempts.mockResolvedValue({ ...attemptsPage1, attempts: [], total: 0 });

    renderSection();

    await waitFor(() => expect(screen.getAllByText('sin datos aún')).toHaveLength(3));
    expect(screen.queryByText('Desactivado')).not.toBeInTheDocument();
  });

  it('muestra las alertas calculadas con su severidad y mensaje', async () => {
    mockAllResolved();
    renderSection();

    await waitFor(() =>
      expect(
        screen.getByText('6 intentos fallidos en 1 hora para victima@ejemplo.com')
      ).toBeInTheDocument()
    );
    expect(screen.getByText('Alta · Fuerza bruta')).toBeInTheDocument();
    expect(screen.getByText('Media · Admin sin 2FA')).toBeInTheDocument();
  });

  it('sin alertas → estado vacío honesto', async () => {
    mockGetSecurityOverview.mockResolvedValue(overview);
    mockGetSecurityAlerts.mockResolvedValue({ ...alertsPage, alerts: [], total: 0 });
    mockGetLoginAttempts.mockResolvedValue(attemptsPage1);
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('No hay alertas de seguridad.')).toBeInTheDocument()
    );
  });

  it('muestra la tabla de intentos con resultado, motivo y dispositivo', async () => {
    mockAllResolved();
    renderSection();

    await waitFor(() => expect(screen.getByText('ana@ejemplo.com')).toBeInTheDocument());
    expect(screen.getAllByText('Correcto')).toHaveLength(3);
    expect(screen.getAllByText('Fallido')).toHaveLength(3);
    expect(screen.getByText('Contraseña incorrecta')).toBeInTheDocument();
    expect(screen.getByText('Windows')).toBeInTheDocument();
    expect(screen.getByText('Móvil')).toBeInTheDocument();
    expect(screen.getByText('Mac')).toBeInTheDocument();
    expect(screen.getByText('Linux')).toBeInTheDocument();
    expect(screen.getByText('Navegador')).toBeInTheDocument();
    expect(screen.getByText('Desconocido')).toBeInTheDocument();
    expect(screen.getByText('Código MFA incorrecto')).toBeInTheDocument();
    expect(screen.getByText('Usuario inexistente')).toBeInTheDocument();
    expect(screen.getByText('1.2.3.4')).toBeInTheDocument();
    expect(screen.getByText('9.9.9.9')).toBeInTheDocument();
  });

  it('filtrar por resultado fallido vuelve a pedir los intentos con el filtro', async () => {
    mockAllResolved();
    renderSection();

    await waitFor(() => expect(screen.getByText('ana@ejemplo.com')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Filtrar por resultado'), {
      target: { value: 'false' },
    });

    await waitFor(() =>
      expect(mockGetLoginAttempts).toHaveBeenCalledWith({ success: false }, 1, 10)
    );
  });

  it('filtrar por email vuelve a pedir los intentos con el filtro', async () => {
    mockAllResolved();
    renderSection();

    await waitFor(() => expect(screen.getByText('ana@ejemplo.com')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText('Filtrar intentos por email'), {
      target: { value: 'victima@ejemplo.com' },
    });

    await waitFor(() =>
      expect(mockGetLoginAttempts).toHaveBeenCalledWith(
        { email: 'victima@ejemplo.com' },
        1,
        10
      )
    );
  });

  it('sin intentos con los filtros → estado vacío honesto', async () => {
    mockGetSecurityOverview.mockResolvedValue(overview);
    mockGetSecurityAlerts.mockResolvedValue(alertsPage);
    mockGetLoginAttempts.mockResolvedValue({ ...attemptsPage1, attempts: [], total: 0 });
    renderSection();

    await waitFor(() =>
      expect(screen.getByText('No hay intentos con estos filtros.')).toBeInTheDocument()
    );
  });

  it('pagina los intentos cuando hay más de una página', async () => {
    mockGetSecurityOverview.mockResolvedValue(overview);
    mockGetSecurityAlerts.mockResolvedValue(alertsPage);
    mockGetLoginAttempts.mockResolvedValue({ ...attemptsPage1, totalPages: 2 });
    renderSection();

    await waitFor(() => expect(screen.getByText('Página 1 de 2')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Siguiente'));

    await waitFor(() =>
      expect(mockGetLoginAttempts).toHaveBeenCalledWith({}, 2, 10)
    );
    await waitFor(() => expect(screen.getByText('Página 2 de 2')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Anterior'));

    await waitFor(() =>
      expect(mockGetLoginAttempts).toHaveBeenCalledWith({}, 1, 10)
    );
  });

  it('muestra skeletons mientras carga', async () => {
    mockGetSecurityOverview.mockImplementation(() => new Promise(() => {}));
    mockGetSecurityAlerts.mockImplementation(() => new Promise(() => {}));
    mockGetLoginAttempts.mockImplementation(() => new Promise(() => {}));
    renderSection();

    expect(screen.getByLabelText('Cargando resumen de seguridad…')).toBeInTheDocument();
    expect(screen.getByLabelText('Cargando alertas…')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Cargando intentos de inicio de sesión…')
    ).toBeInTheDocument();
  });
});
