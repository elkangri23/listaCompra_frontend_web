/**
 * @file recommendations-panel.test.tsx
 * @description Tests secundarios (80% coverage) para RecommendationsPanel component
 * 
 * Tests: 15 tests
 * - Renderizado básico: título, descripción, iconos
 * - Estados: loading, error, vacío, con datos
 * - Contexto personalizado: input, actualizar, limpiar
 * - Acciones: añadir producto, refresh, prioridades
 * - Metadata: stats de procesamiento
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecommendationsPanel } from '@/features/ai/components/recommendations-panel';
import * as useAiHooks from '@/features/ai/hooks/use-ai';
import type { Recommendation } from '@/types/dtos/ai';

// Mock dependencies
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('lucide-react', () => ({
  Lightbulb: () => <div data-testid="lightbulb-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

const mockUseRecommendations = jest.fn();

jest.mock('@/features/ai/hooks/use-ai', () => ({
  useRecommendations: () => mockUseRecommendations(),
}));

// Mock recommendations data
const mockRecommendations: Recommendation[] = [
  {
    productoNombre: 'Tomate',
    categoria: 'Verduras',
    prioridad: 'alta',
    descripcion: 'Tomate fresco para ensalada',
    cantidad: '500',
    unidad: 'g',
    confidence: 95,
    razon: 'Complementa bien con lechuga que ya tienes',
  },
  {
    productoNombre: 'Pan integral',
    categoria: 'Panadería',
    prioridad: 'media',
    descripcion: 'Pan integral artesanal',
    cantidad: '1',
    unidad: 'ud',
    confidence: 80,
    razon: 'Buen complemento para desayuno',
  },
  {
    productoNombre: 'Aceite oliva',
    categoria: 'Aceites',
    prioridad: 'baja',
    descripcion: 'Aceite de oliva virgen extra',
    cantidad: '1',
    unidad: 'botella',
    confidence: 65,
    razon: 'Producto básico que suele faltar',
  },
];

describe('RecommendationsPanel (SECUNDARIO - 80% coverage)', () => {
  let queryClient: QueryClient;
  const mockOnAddProduct = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseRecommendations.mockReturnValue({
      data: {
        data: {
          recommendations: mockRecommendations,
          metadata: {
            totalRecommendations: 3,
            processingTimeMs: 150,
            contextoUtilizado: null,
          },
        },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      isFetching: false,
    });

    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <RecommendationsPanel
          listId="list-123"
          onAddProduct={mockOnAddProduct}
          {...props}
        />
      </QueryClientProvider>
    );
  };

  describe('Renderizado básico', () => {
    it('debe renderizar el título y descripción', () => {
      renderComponent();

      expect(screen.getByText('Recomendaciones IA')).toBeInTheDocument();
      expect(
        screen.getByText('Sugerencias personalizadas basadas en los productos de tu lista')
      ).toBeInTheDocument();
    });

    it('debe renderizar icono Lightbulb en header', () => {
      renderComponent();

      const lightbulbIcons = screen.getAllByTestId('lightbulb-icon');
      expect(lightbulbIcons.length).toBeGreaterThan(0);
    });

    it('debe renderizar botón "Contexto"', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /contexto/i })).toBeInTheDocument();
    });

    it('debe renderizar botón "Actualizar"', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument();
    });
  });

  describe('Estados de carga y error', () => {
    it('debe mostrar spinner durante carga inicial', () => {
      mockUseRecommendations.mockReturnValueOnce({
        data: null,
        isLoading: true,
        isError: false,
        refetch: mockRefetch,
        isFetching: false,
      });

      renderComponent();

      expect(screen.getByText('Generando recomendaciones...')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('debe mostrar mensaje de error cuando falla la petición', () => {
      mockUseRecommendations.mockReturnValueOnce({
        data: null,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
        isFetching: false,
      });

      renderComponent();

      expect(screen.getByText('Error al cargar recomendaciones')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
    });

    it('debe mostrar mensaje cuando no hay recomendaciones', () => {
      mockUseRecommendations.mockReturnValueOnce({
        data: { data: { recommendations: [], metadata: null } },
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
        isFetching: false,
      });

      renderComponent();

      expect(screen.getByText('No hay recomendaciones disponibles')).toBeInTheDocument();
      expect(
        screen.getByText('Añade más productos a tu lista para obtener sugerencias')
      ).toBeInTheDocument();
    });
  });

  describe('Recomendaciones con datos', () => {
    it('debe renderizar todas las recomendaciones', () => {
      renderComponent();

      expect(screen.getByText('Tomate')).toBeInTheDocument();
      expect(screen.getByText('Pan integral')).toBeInTheDocument();
      expect(screen.getByText('Aceite oliva')).toBeInTheDocument();
    });

    it('debe mostrar badges de prioridad correctamente', () => {
      renderComponent();

      expect(screen.getByText('alta')).toBeInTheDocument();
      expect(screen.getByText('media')).toBeInTheDocument();
      expect(screen.getByText('baja')).toBeInTheDocument();
    });

    it('debe mostrar descripción de recomendaciones', () => {
      renderComponent();

      expect(screen.getByText('Tomate fresco para ensalada')).toBeInTheDocument();
      expect(screen.getByText('Pan integral artesanal')).toBeInTheDocument();
    });

    it('debe mostrar razón de recomendación', () => {
      renderComponent();

      expect(
        screen.getByText(/Complementa bien con lechuga que ya tienes/i)
      ).toBeInTheDocument();
    });

    it('debe mostrar categoría y cantidad', () => {
      renderComponent();

      expect(screen.getByText('Verduras')).toBeInTheDocument();
      expect(screen.getByText('500 g')).toBeInTheDocument();
    });

    it('debe mostrar nivel de confianza (confidence)', () => {
      renderComponent();

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });
  });

  describe('Añadir producto', () => {
    it('debe llamar a onAddProduct al hacer clic en botón añadir', async () => {
      mockOnAddProduct.mockResolvedValueOnce(undefined);
      renderComponent();
      const user = userEvent.setup();

      const addButtons = screen.getAllByRole('button', { name: /añadir/i });
      await user.click(addButtons[0]);

      await waitFor(() => {
        expect(mockOnAddProduct).toHaveBeenCalledWith(mockRecommendations[0]);
      });
    });

    it('debe deshabilitar botón mientras se añade producto', async () => {
      let resolveAdd: () => void;
      mockOnAddProduct.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveAdd = resolve;
        })
      );

      renderComponent();
      const user = userEvent.setup();

      const addButtons = screen.getAllByRole('button', { name: /añadir/i });
      await user.click(addButtons[0]);

      const disabledButton = addButtons[0];
      expect(disabledButton).toBeDisabled();

      resolveAdd!();
    });
  });

  describe('Contexto personalizado', () => {
    it('debe mostrar input de contexto al hacer clic en "Contexto"', async () => {
      renderComponent();
      const user = userEvent.setup();

      const contextoButton = screen.getByRole('button', { name: /contexto/i });
      await user.click(contextoButton);

      expect(
        screen.getByLabelText(/Añade contexto para mejores recomendaciones/i)
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/cena romántica, dieta vegetariana/i)
      ).toBeInTheDocument();
    });

    it('debe actualizar recomendaciones al presionar Enter en input contexto', async () => {
      renderComponent();
      const user = userEvent.setup();

      const contextoButton = screen.getByRole('button', { name: /contexto/i });
      await user.click(contextoButton);

      const input = screen.getByPlaceholderText(/cena romántica/i);
      await user.type(input, 'dieta vegetariana{Enter}');

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('debe cerrar input de contexto y limpiar valor al hacer clic en X', async () => {
      renderComponent();
      const user = userEvent.setup();

      const contextoButton = screen.getByRole('button', { name: /contexto/i });
      await user.click(contextoButton);

      const input = screen.getByPlaceholderText(/cena romántica/i);
      await user.type(input, 'test context');

      const closeButtons = screen.getAllByTestId('x-icon');
      const closeButton = closeButtons.find((btn) => btn.closest('button'));
      if (closeButton) {
        await user.click(closeButton.closest('button')!);
      }

      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/cena romántica/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Metadata y estadísticas', () => {
    it('debe mostrar metadata de procesamiento', () => {
      renderComponent();

      expect(screen.getByText(/3 recomendaciones en 150ms/i)).toBeInTheDocument();
    });

    it('debe mostrar contexto utilizado cuando existe', () => {
      mockUseRecommendations.mockReturnValueOnce({
        data: {
          data: {
            recommendations: mockRecommendations,
            metadata: {
              totalRecommendations: 3,
              processingTimeMs: 200,
              contextoUtilizado: 'cena romántica',
            },
          },
        },
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
        isFetching: false,
      });

      renderComponent();

      expect(screen.getByText(/Contexto: "cena romántica"/i)).toBeInTheDocument();
    });
  });

  describe('Botón de actualizar', () => {
    it('debe llamar a refetch al hacer clic en Actualizar', async () => {
      renderComponent();
      const user = userEvent.setup();

      const refreshButton = screen.getByRole('button', { name: /actualizar/i });
      await user.click(refreshButton);

      expect(mockRefetch).toHaveBeenCalled();
    });

    it('debe deshabilitar botón Actualizar durante fetching', () => {
      mockUseRecommendations.mockReturnValueOnce({
        data: { data: { recommendations: mockRecommendations, metadata: null } },
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
        isFetching: true,
      });

      renderComponent();

      const refreshButton = screen.getByRole('button', { name: /actualizar/i });
      expect(refreshButton).toBeDisabled();
    });
  });
});
