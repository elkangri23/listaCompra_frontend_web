import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShareLinkSection } from '../share-link-section';
import { invitationService } from '../../services/invitation-service';
import { toast } from 'sonner';

jest.mock('../../services/invitation-service');
jest.mock('sonner');

const mockInvitationService = invitationService as jest.Mocked<typeof invitationService>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('ShareLinkSection', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  it('debe renderizar el selector de permisos', () => {
    render(<ShareLinkSection listId="test-list-id" />, { wrapper });
    
    expect(screen.getByText('Permisos')).toBeInTheDocument();
    expect(screen.getByText('Generar Enlace de Compartir')).toBeInTheDocument();
  });

  it('debe generar un enlace cuando se hace click en el botón', async () => {
    const mockResponse = {
      hash: 'test-hash-123',
      url: 'http://localhost:3000/invitations/test-hash-123',
    };

    mockInvitationService.generateShareLink.mockResolvedValue(mockResponse);

    render(<ShareLinkSection listId="test-list-id" />, { wrapper });

    const generateButton = screen.getByText('Generar Enlace de Compartir');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockInvitationService.generateShareLink).toHaveBeenCalledWith(
        'test-list-id',
        { permissions: 'read' }
      );
    });

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Enlace generado correctamente');
    });
  });

  it('debe mostrar el input con el enlace después de generarlo', async () => {
    const mockResponse = {
      hash: 'test-hash-123',
      url: 'http://localhost:3000/invitations/test-hash-123',
    };

    mockInvitationService.generateShareLink.mockResolvedValue(mockResponse);

    render(<ShareLinkSection listId="test-list-id" />, { wrapper });

    const generateButton = screen.getByText('Generar Enlace de Compartir');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const linkInput = screen.getByDisplayValue(/invitations\/test-hash-123/);
      expect(linkInput).toBeInTheDocument();
    });
  });

  it('debe copiar el enlace al portapapeles', async () => {
    const mockResponse = {
      hash: 'test-hash-123',
      url: 'http://localhost:3000/invitations/test-hash-123',
    };

    mockInvitationService.generateShareLink.mockResolvedValue(mockResponse);

    render(<ShareLinkSection listId="test-list-id" />, { wrapper });

    // Generar enlace primero
    const generateButton = screen.getByText('Generar Enlace de Compartir');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/invitations\/test-hash-123/)).toBeInTheDocument();
    });

    // Copiar enlace
    const copyButton = screen.getByRole('button', { name: /copiar enlace/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Enlace copiado al portapapeles');
    });
  });
});
