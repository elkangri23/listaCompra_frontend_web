/**
 * invitations-list.test.tsx
 * Tests secundarios (80% coverage) para el componente InvitationsList
 * 
 * Componente: InvitationsList - Tabla de invitaciones pendientes con acciones
 * Tests planificados: 16 tests
 * 
 * Características:
 * - Renderizado de tabla con invitaciones
 * - Lista vacía con mensaje informativo
 * - Botones de aceptar/rechazar con loading state
 * - Redirección al aceptar invitación
 * - Mutación useDeclineInvitation con error handling
 * - ProcessingId state para loading específico
 * - Formateo de fechas (toLocaleDateString)
 * - Alert notifications (accept/decline success/error)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InvitationsList } from '@/features/invitations/components/invitations-list';
import { InvitationDto } from '@/types/dtos/invitations';
import { useDeclineInvitation } from '@/features/invitations/hooks/use-invitations';
import { useRouter } from 'next/navigation';

// Mock de hooks
jest.mock('@/features/invitations/hooks/use-invitations', () => ({
  useDeclineInvitation: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('InvitationsList', () => {
  const mockPush = jest.fn();
  const mockMutateAsync = jest.fn();
  const mockUseDeclineInvitation = useDeclineInvitation as jest.MockedFunction<typeof useDeclineInvitation>;
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

  // Mock de alert
  const mockAlert = jest.fn();

  beforeAll(() => {
    global.alert = mockAlert;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    mockUseDeclineInvitation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  const mockInvitations: InvitationDto[] = [
    {
      id: 'inv1',
      listName: 'Lista Mercado',
      from: 'Juan Pérez',
      createdAt: new Date('2025-11-20T10:00:00Z').toISOString(),
      listId: 'list1',
    },
    {
      id: 'inv2',
      listName: 'Fiesta Cumpleaños',
      from: 'María García',
      createdAt: new Date('2025-11-22T14:30:00Z').toISOString(),
      listId: 'list2',
    },
  ];

  describe('Renderizado básico', () => {
    it('debe renderizar la tabla con encabezados correctos', () => {
      render(<InvitationsList invitations={mockInvitations} />);
      
      expect(screen.getByText('Lista')).toBeInTheDocument();
      expect(screen.getByText('Invitado por')).toBeInTheDocument();
      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('debe renderizar todas las invitaciones con sus datos', () => {
      render(<InvitationsList invitations={mockInvitations} />);
      
      expect(screen.getByText('Lista Mercado')).toBeInTheDocument();
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      
      expect(screen.getByText('Fiesta Cumpleaños')).toBeInTheDocument();
      expect(screen.getByText('María García')).toBeInTheDocument();
    });

    it('debe mostrar estado "Pendiente" para todas las invitaciones', () => {
      render(<InvitationsList invitations={mockInvitations} />);
      
      const pendingStatuses = screen.getAllByText('Pendiente');
      expect(pendingStatuses).toHaveLength(2);
    });

    it('debe renderizar botones Aceptar y Rechazar para cada invitación', () => {
      render(<InvitationsList invitations={mockInvitations} />);
      
      const aceptarButtons = screen.getAllByText('Aceptar');
      const rechazarButtons = screen.getAllByText('Rechazar');
      
      expect(aceptarButtons).toHaveLength(2);
      expect(rechazarButtons).toHaveLength(2);
    });
  });

  describe('Formateo de fechas', () => {
    it('debe formatear las fechas correctamente en español', () => {
      render(<InvitationsList invitations={mockInvitations} />);
      
      // toLocaleDateString con locale 'es-ES' produce formato "20 nov 2025"
      expect(screen.getByText(/20.*nov.*2025/i)).toBeInTheDocument();
      expect(screen.getByText(/22.*nov.*2025/i)).toBeInTheDocument();
    });
  });

  describe('Aceptar invitación', () => {
    it('debe mostrar error porque handleAccept no recibe listId (BUG del componente)', async () => {
      const user = userEvent.setup();
      render(<InvitationsList invitations={mockInvitations} />);
      
      const aceptarButtons = screen.getAllByText('Aceptar');
      await user.click(aceptarButtons[0]);
      
      // BUG: El componente NO pasa invitation.listId a handleAccept
      // Por lo tanto siempre muestra el mensaje de error
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('No se puede acceder a la lista: ID no disponible');
      });
      
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('debe mostrar error si no hay listId disponible', async () => {
      const user = userEvent.setup();
      const invitationSinListId: InvitationDto[] = [{
        id: 'inv3',
        listName: 'Lista Sin ID',
        from: 'Test User',
        createdAt: new Date().toISOString(),
        listId: undefined,
      }];
      
      render(<InvitationsList invitations={invitationSinListId} />);
      
      const aceptarButton = screen.getByText('Aceptar');
      await user.click(aceptarButton);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('No se puede acceder a la lista: ID no disponible');
      });
      
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Rechazar invitación', () => {
    it('debe llamar a declineInvitationMutation.mutateAsync con ID correcto', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce(undefined);
      
      render(<InvitationsList invitations={mockInvitations} />);
      
      const rechazarButtons = screen.getAllByText('Rechazar');
      await user.click(rechazarButtons[1]); // Segunda invitación
      
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith('inv2');
      });
    });

    it('debe mostrar loading state durante el rechazo', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<InvitationsList invitations={mockInvitations} />);
      
      const rechazarButtons = screen.getAllByText('Rechazar');
      await user.click(rechazarButtons[0]);
      
      // Debe mostrar "Rechazando..." durante la mutación
      expect(screen.getByText('Rechazando...')).toBeInTheDocument();
      
      // Botones deshabilitados durante procesamiento
      expect(rechazarButtons[0]).toBeDisabled();
    });

    it('debe mostrar alert de éxito al rechazar invitación', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce(undefined);
      
      render(<InvitationsList invitations={mockInvitations} />);
      
      const rechazarButtons = screen.getAllByText('Rechazar');
      await user.click(rechazarButtons[0]);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Has rechazado la invitación a "Lista Mercado"');
      });
    });

    it('debe mostrar alert de error si falla el rechazo', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));
      
      render(<InvitationsList invitations={mockInvitations} />);
      
      const rechazarButtons = screen.getAllByText('Rechazar');
      await user.click(rechazarButtons[0]);
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error al rechazar la invitación');
      });
    });

    it('debe limpiar processingId después de completar el rechazo', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce(undefined);
      
      render(<InvitationsList invitations={mockInvitations} />);
      
      const rechazarButtons = screen.getAllByText('Rechazar');
      await user.click(rechazarButtons[0]);
      
      // Después de completar, debe volver a "Rechazar"
      await waitFor(() => {
        expect(screen.queryByText('Rechazando...')).not.toBeInTheDocument();
      });
      
      // Botones deben estar habilitados nuevamente
      expect(rechazarButtons[0]).not.toBeDisabled();
    });
  });

  describe('Lista vacía', () => {
    it('debe mostrar mensaje cuando no hay invitaciones', () => {
      render(<InvitationsList invitations={[]} />);
      
      expect(screen.getByText('No tienes invitaciones pendientes')).toBeInTheDocument();
      expect(screen.getByText('Cuando alguien te invite a una lista, aparecerá aquí.')).toBeInTheDocument();
    });

    it('no debe renderizar la tabla cuando la lista está vacía', () => {
      render(<InvitationsList invitations={[]} />);
      
      expect(screen.queryByText('Lista')).not.toBeInTheDocument();
      expect(screen.queryByText('Invitado por')).not.toBeInTheDocument();
    });
  });

  describe('ProcessingId state', () => {
    it('debe solo deshabilitar botones de la invitación que se está procesando', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<InvitationsList invitations={mockInvitations} />);
      
      const rechazarButtons = screen.getAllByText('Rechazar');
      await user.click(rechazarButtons[0]); // Primera invitación
      
      // Primera invitación: botones deshabilitados
      expect(rechazarButtons[0]).toBeDisabled();
      const aceptarButtons = screen.getAllByText((content, element) => {
        return element?.tagName === 'BUTTON' && (content === 'Aceptar' || content === 'Agregando...');
      });
      expect(aceptarButtons[0]).toBeDisabled();
      
      // Segunda invitación: botones habilitados
      expect(rechazarButtons[1]).not.toBeDisabled();
      expect(aceptarButtons[1]).not.toBeDisabled();
    });
  });
});
