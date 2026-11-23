/**
 * Tests CRÍTICOS - use-ai-settings.ts y ai-settings-form.tsx (CU-31)
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { AISettingsForm } from '@/features/settings/components/ai-settings-form';
import {
  useAIConfig,
  useUpdateAIConfig,
  useTestAIConfig,
} from '@/features/settings/hooks/use-ai-settings';
import {
  aiSettingsService,
  AISafeConfig,
} from '@/features/settings/services/ai-settings-service';
import { createTestQueryClient } from '../../utils/test-utils';

jest.mock('@/features/settings/services/ai-settings-service', () => ({
  aiSettingsService: {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    testConfig: jest.fn(),
  },
  AI_PROVIDERS: [
    {
      id: 'perplexity',
      nombre: 'Perplexity (Sonar online)',
      apiUrlPorDefecto: 'https://api.perplexity.ai',
      modelosSugeridos: ['llama-3.1-sonar-small-128k-online'],
    },
    {
      id: 'openai',
      nombre: 'OpenAI (GPT)',
      apiUrlPorDefecto: 'https://api.openai.com/v1',
      modelosSugeridos: ['gpt-4o-mini', 'gpt-4o'],
    },
    {
      id: 'openrouter',
      nombre: 'OpenRouter (multi-proveedor)',
      apiUrlPorDefecto: 'https://openrouter.ai/api/v1',
      modelosSugeridos: ['openai/gpt-4o-mini'],
    },
    {
      id: 'claude',
      nombre: 'Anthropic Claude (compatible OpenAI)',
      apiUrlPorDefecto: 'https://api.anthropic.com/v1',
      modelosSugeridos: [],
    },
    {
      id: 'azure-openai',
      nombre: 'Azure OpenAI',
      apiUrlPorDefecto: '',
      modelosSugeridos: [],
    },
  ],
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

// Radix Select no funciona en jsdom: sustituimos por un select nativo
jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => {
    // extraer los SelectItem hijos para mapearlos a un <select> nativo
    const items: Array<{ props: { value: string; children: ReactNode } }> = [];
    const collect = (node: any) => {
      if (node?.props?.value !== undefined) {
        items.push(node);
      }
      if (node?.props?.children) {
        (Array.isArray(node.props.children)
          ? node.props.children
          : [node.props.children]
        ).forEach(collect);
      }
    };
    (Array.isArray(children) ? children : [children]).forEach(collect);
    return (
      <select
        aria-label="Proveedor LLM"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        data-testid="provider-select"
      >
        {items.map((item) => (
          <option key={item.props.value} value={item.props.value}>
            {item.props.children}
          </option>
        ))}
      </select>
    );
  },
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <>{children}</>,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children }: any) => <option>{children}</option>,
}));

const mockUseSession = useSession as jest.Mock;
const mockGetConfig = aiSettingsService.getConfig as jest.Mock;
const mockUpdate = aiSettingsService.updateConfig as jest.Mock;
const mockTest = aiSettingsService.testConfig as jest.Mock;
const mockToastSuccess = toast.success as jest.Mock;
const mockToastError = toast.error as jest.Mock;

const mockConfig: AISafeConfig = {
  provider: 'perplexity',
  apiUrl: 'https://api.perplexity.ai',
  model: 'llama-3.1-sonar-small-128k-online',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000,
  cache: { enabled: false, ttl: 3600 },
  rateLimit: { requestsPerMinute: 10 },
  apiKeyConfigured: true,
  apiKeyMasked: 'pplx-a...6789',
};

const ADMIN_SESSION = {
  data: {
    user: { id: 'admin-1', name: 'Admin', email: 'admin@example.com', roles: ['ADMIN'] },
  },
  status: 'authenticated',
};

const USER_SESSION = {
  data: {
    user: { id: 'user-1', name: 'User', email: 'user@example.com', roles: ['USUARIO'] },
  },
  status: 'authenticated',
};

describe('use-ai-settings + AISettingsForm (CU-31)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockUseSession.mockReturnValue(ADMIN_SESSION);
    mockGetConfig.mockResolvedValue(mockConfig);
    mockUpdate.mockResolvedValue(mockConfig);
  });

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  const renderForm = () =>
    render(<AISettingsForm />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

  describe('AISettingsForm', () => {
    it('debe cargar y mostrar la configuración actual', async () => {
      renderForm();

      await waitFor(() =>
        expect(screen.getByText(/Configuración actual: perplexity/i)).toBeInTheDocument()
      );
      expect(
        screen.getByDisplayValue('https://api.perplexity.ai')
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('llama-3.1-sonar-small-128k-online')
      ).toBeInTheDocument();
      expect(mockGetConfig).toHaveBeenCalled();
    });

    it('debe mostrar aviso de permisos a un no administrador', () => {
      mockUseSession.mockReturnValue(USER_SESSION);
      // Aislar de posibles llamadas en vuelo del test anterior
      mockGetConfig.mockClear();

      renderForm();

      expect(screen.getByRole('alert')).toHaveTextContent(
        /No tienes permisos de administrador/
      );
      expect(mockGetConfig).not.toHaveBeenCalled();
    });

    it('debe mostrar estado de carga', () => {
      mockGetConfig.mockReturnValue(new Promise(() => undefined));

      renderForm();

      expect(screen.getByText(/Cargando configuración/i)).toBeInTheDocument();
    });

    it('debe mostrar error si falla la carga', async () => {
      mockGetConfig.mockRejectedValue(new Error('Unauthorized'));

      renderForm();

      await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent(/No se pudo cargar la configuración/)
      );
    });

    it('debe guardar la configuración con la nueva key y notificar éxito', async () => {
      const user = userEvent.setup();

      renderForm();

      await waitFor(() =>
        expect(screen.getByDisplayValue('llama-3.1-sonar-small-128k-online')).toBeInTheDocument()
      );

      await user.type(screen.getByLabelText(/API Key/i), 'sk-nueva-0123456789abcdef0123456789');
      await user.click(screen.getByRole('button', { name: /guardar configuración/i }));

      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            provider: 'perplexity',
            apiKey: 'sk-nueva-0123456789abcdef0123456789',
          })
        )
      );
      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Configuración guardada',
          expect.anything()
        )
      );
    });

    it('debe probar la conexión antes de guardar', async () => {
      mockTest.mockResolvedValue({
        provider: 'perplexity',
        model: 'llama-3.1-sonar-small-128k-online',
        apiUrl: 'https://api.perplexity.ai',
        latencyMs: 120,
      });
      const user = userEvent.setup();

      renderForm();

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /probar conexión/i })).toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: /probar conexión/i }));

      await waitFor(() =>
        expect(mockTest).toHaveBeenCalledWith(undefined)
      );
      await waitFor(() =>
        expect(mockToastSuccess).toHaveBeenCalledWith(
          'Conexión verificada',
          expect.objectContaining({ description: expect.stringContaining('120 ms') })
        )
      );
    });

    it('debe notificar el error al probar la conexión', async () => {
      mockTest.mockRejectedValue(new Error('El proveedor respondió 401'));
      const user = userEvent.setup();

      renderForm();

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /probar conexión/i })).toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: /probar conexión/i }));

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          'Fallo de conexión',
          expect.objectContaining({ description: 'El proveedor respondió 401' })
        )
      );
    });

    it('debe notificar el error al guardar', async () => {
      mockUpdate.mockRejectedValue(new Error('La API key debe ser una cadena válida'));
      const user = userEvent.setup();

      renderForm();

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /guardar configuración/i })
        ).toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: /guardar configuración/i }));

      await waitFor(() =>
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al guardar',
          expect.objectContaining({ description: 'La API key debe ser una cadena válida' })
        )
      );
    });

    it('debe cambiar apiUrl y model al elegir otro proveedor', async () => {
      const user = userEvent.setup();

      renderForm();

      await waitFor(() =>
        expect(screen.getByTestId('provider-select')).toBeInTheDocument()
      );

      await user.selectOptions(screen.getByTestId('provider-select'), 'openai');

      await waitFor(() =>
        expect(screen.getByDisplayValue('https://api.openai.com/v1')).toBeInTheDocument()
      );
      expect(screen.getByDisplayValue('gpt-4o-mini')).toBeInTheDocument();
    });

    it('debe enviar key vacía sin sobreescribir la configurada', async () => {
      const user = userEvent.setup();

      renderForm();

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /guardar configuración/i })
        ).toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: /guardar configuración/i }));

      await waitFor(() =>
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ apiKey: undefined })
        )
      );
    });
  });
});
