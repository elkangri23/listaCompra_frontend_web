/**
 * product-suggestions.test.tsx
 * Tests secundarios (80% coverage) para el componente ProductSuggestions
 * 
 * Componente: ProductSuggestions - Sugerencias inteligentes basadas en frecuencia de compras
 * Tests planificados: 18 tests
 * 
 * Características:
 * - Análisis de frecuencia de productos comprados
 * - Filtrado de productos ya existentes en lista actual
 * - Ordenamiento por frecuencia (2+ compras)
 * - Límite de 6 sugerencias máximo
 * - Agregar producto sugerido con loading state
 * - null render cuando no hay sugerencias o está cargando
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductSuggestions } from '@/features/products/components/product-suggestions';
import { useProducts, useCreateProduct } from '@/features/products/hooks/use-products';
import { toast } from 'sonner';

// Mock de hooks
jest.mock('@/features/products/hooks/use-products', () => ({
  useProducts: jest.fn(),
  useCreateProduct: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProductSuggestions', () => {
  const mockUseProducts = useProducts as jest.MockedFunction<typeof useProducts>;
  const mockUseCreateProduct = useCreateProduct as jest.MockedFunction<typeof useCreateProduct>;
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCreateProduct.mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);
  });

  describe('Estados de carga y vacío', () => {
    it('debe retornar null cuando está cargando', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return { data: undefined, isLoading: true } as any;
        }
        return { data: { items: [] } } as any;
      });

      const { container } = render(<ProductSuggestions listId="list1" />);
      expect(container.firstChild).toBeNull();
    });

    it('debe retornar null cuando no hay productos comprados', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return { data: { items: [] }, isLoading: false } as any;
        }
        return { data: { items: [] } } as any;
      });

      const { container } = render(<ProductSuggestions listId="list1" />);
      expect(container.firstChild).toBeNull();
    });

    it('debe retornar null cuando no hay sugerencias válidas (frecuencia < 2)', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Producto A', categoriaId: 'cat1' },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      const { container } = render(<ProductSuggestions listId="list1" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Renderizado básico', () => {
    beforeEach(() => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Leche', categoriaId: 'cat1', precio: 2.5 },
                { id: '2', nombre: 'Leche', categoriaId: 'cat1', precio: 2.5 },
                { id: '3', nombre: 'Pan', categoriaId: 'cat2', precio: 1.0 },
                { id: '4', nombre: 'Pan', categoriaId: 'cat2', precio: 1.0 },
                { id: '5', nombre: 'Pan', categoriaId: 'cat2', precio: 1.0 },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });
    });

    it('debe renderizar el título y descripción', () => {
      render(<ProductSuggestions listId="list1" />);
      
      expect(screen.getByText('Sugerencias de productos')).toBeInTheDocument();
      expect(screen.getByText(/Basado en tus compras frecuentes/i)).toBeInTheDocument();
    });

    it('debe renderizar el icono Sparkles', () => {
      render(<ProductSuggestions listId="list1" />);
      
      const card = screen.getByText('Sugerencias de productos').closest('.flex');
      expect(card?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Análisis de frecuencia', () => {
    it('debe ordenar sugerencias por frecuencia descendente', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Pan', categoriaId: 'cat1' },
                { id: '2', nombre: 'Pan', categoriaId: 'cat1' },
                { id: '3', nombre: 'Pan', categoriaId: 'cat1' },
                { id: '4', nombre: 'Leche', categoriaId: 'cat2' },
                { id: '5', nombre: 'Leche', categoriaId: 'cat2' },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      render(<ProductSuggestions listId="list1" />);
      
      // Pan (3x) debe aparecer antes que Leche (2x)
      expect(screen.getByText('3x comprado')).toBeInTheDocument();
      expect(screen.getByText('2x comprado')).toBeInTheDocument();
      
      const suggestions = screen.getAllByText(/x comprado/);
      expect(suggestions[0]).toHaveTextContent('3x comprado');
      expect(suggestions[1]).toHaveTextContent('2x comprado');
    });

    it('debe filtrar productos ya existentes en lista actual', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Pan', categoriaId: 'cat1' },
                { id: '2', nombre: 'Pan', categoriaId: 'cat1' },
                { id: '3', nombre: 'Leche', categoriaId: 'cat2' },
                { id: '4', nombre: 'Leche', categoriaId: 'cat2' },
              ],
            },
            isLoading: false,
          } as any;
        }
        // Leche ya está en la lista actual
        return {
          data: {
            items: [{ id: 'current1', nombre: 'Leche', categoriaId: 'cat2' }],
          },
        } as any;
      });

      render(<ProductSuggestions listId="list1" />);
      
      // Solo Pan debe aparecer, Leche está filtrada
      expect(screen.getByText('Pan')).toBeInTheDocument();
      expect(screen.queryByText('Leche')).not.toBeInTheDocument();
    });

    it('debe respetar límite de 6 sugerencias máximo', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Producto A', categoriaId: 'cat1' },
                { id: '2', nombre: 'Producto A', categoriaId: 'cat1' },
                { id: '3', nombre: 'Producto B', categoriaId: 'cat1' },
                { id: '4', nombre: 'Producto B', categoriaId: 'cat1' },
                { id: '5', nombre: 'Producto C', categoriaId: 'cat1' },
                { id: '6', nombre: 'Producto C', categoriaId: 'cat1' },
                { id: '7', nombre: 'Producto D', categoriaId: 'cat1' },
                { id: '8', nombre: 'Producto D', categoriaId: 'cat1' },
                { id: '9', nombre: 'Producto E', categoriaId: 'cat1' },
                { id: '10', nombre: 'Producto E', categoriaId: 'cat1' },
                { id: '11', nombre: 'Producto F', categoriaId: 'cat1' },
                { id: '12', nombre: 'Producto F', categoriaId: 'cat1' },
                { id: '13', nombre: 'Producto G', categoriaId: 'cat1' },
                { id: '14', nombre: 'Producto G', categoriaId: 'cat1' },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      render(<ProductSuggestions listId="list1" />);
      
      // Máximo 6 sugerencias
      const badges = screen.getAllByText(/x comprado/);
      expect(badges).toHaveLength(6);
    });

    it('debe ser case-insensitive al contar frecuencia', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'LECHE', categoriaId: 'cat1' },
                { id: '2', nombre: 'leche', categoriaId: 'cat1' },
                { id: '3', nombre: 'Leche', categoriaId: 'cat1' },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      render(<ProductSuggestions listId="list1" />);
      
      // Debe contar las 3 variantes como 1 solo producto
      expect(screen.getByText('3x comprado')).toBeInTheDocument();
      // Debe usar el primer nombre encontrado
      expect(screen.getByText('LECHE')).toBeInTheDocument();
    });
  });

  describe('Renderizado de sugerencias', () => {
    beforeEach(() => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                {
                  id: '1',
                  nombre: 'Pan Integral',
                  categoriaId: 'cat1',
                  descripcion: 'Pan de molde integral',
                  precio: 2.5,
                },
                {
                  id: '2',
                  nombre: 'Pan Integral',
                  categoriaId: 'cat1',
                  descripcion: 'Pan de molde integral',
                  precio: 2.5,
                },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });
    });

    it('debe mostrar nombre del producto', () => {
      render(<ProductSuggestions listId="list1" />);
      expect(screen.getByText('Pan Integral')).toBeInTheDocument();
    });

    it('debe mostrar descripción si existe', () => {
      render(<ProductSuggestions listId="list1" />);
      expect(screen.getByText('Pan de molde integral')).toBeInTheDocument();
    });

    it('debe mostrar badge con frecuencia', () => {
      render(<ProductSuggestions listId="list1" />);
      expect(screen.getByText('2x comprado')).toBeInTheDocument();
    });

    it('debe mostrar precio formateado si existe', () => {
      render(<ProductSuggestions listId="list1" />);
      expect(screen.getByText('$2.50')).toBeInTheDocument();
    });

    it('debe renderizar botón de agregar con icono Plus', () => {
      render(<ProductSuggestions listId="list1" />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('no debe mostrar descripción si no existe', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Producto', categoriaId: 'cat1' },
                { id: '2', nombre: 'Producto', categoriaId: 'cat1' },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      render(<ProductSuggestions listId="list1" />);
      
      const card = screen.getByText('Producto').closest('.p-4');
      expect(card?.querySelector('.text-muted-foreground.line-clamp-2')).not.toBeInTheDocument();
    });

    it('no debe mostrar precio si no existe', () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Producto', categoriaId: 'cat1', precio: undefined },
                { id: '2', nombre: 'Producto', categoriaId: 'cat1', precio: undefined },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      render(<ProductSuggestions listId="list1" />);
      
      expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
    });
  });

  describe('Agregar producto sugerido', () => {
    beforeEach(() => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                {
                  id: '1',
                  nombre: 'Pan',
                  categoriaId: 'cat1',
                  descripcion: 'Pan fresco',
                  precio: 1.5,
                },
                {
                  id: '2',
                  nombre: 'Pan',
                  categoriaId: 'cat1',
                  descripcion: 'Pan fresco',
                  precio: 1.5,
                },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });
    });

    it('debe llamar a createProductMutation.mutateAsync con datos correctos', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});

      render(<ProductSuggestions listId="list1" />);
      
      const addButton = screen.getByRole('button');
      await user.click(addButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          nombre: 'Pan',
          categoriaId: 'cat1',
          descripcion: 'Pan fresco',
          cantidad: 1,
          precio: 1.5,
          urgente: false,
        });
      });
    });

    it('debe deshabilitar botón durante la mutación', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<ProductSuggestions listId="list1" />);
      
      const addButton = screen.getByRole('button');
      await user.click(addButton);

      // Botón debe estar deshabilitado durante la mutación
      expect(addButton).toBeDisabled();
    });

    it('debe mostrar toast de éxito al agregar producto', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});

      render(<ProductSuggestions listId="list1" />);
      
      const addButton = screen.getByRole('button');
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('"Pan" agregado a la lista');
      });
    });

    it('debe mostrar toast de error si falla la mutación', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockMutateAsync.mockRejectedValueOnce(new Error('Network error'));

      render(<ProductSuggestions listId="list1" />);
      
      const addButton = screen.getByRole('button');
      await user.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al agregar el producto');
      });

      consoleErrorSpy.mockRestore();
    });

    it('debe habilitar botón después de completar la mutación', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});

      render(<ProductSuggestions listId="list1" />);
      
      const addButton = screen.getByRole('button');
      await user.click(addButton);

      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });

    it('debe manejar campos undefined correctamente', async () => {
      mockUseProducts.mockImplementation((listId, options) => {
        if (options?.status === 'purchased') {
          return {
            data: {
              items: [
                { id: '1', nombre: 'Producto', categoriaId: undefined },
                { id: '2', nombre: 'Producto', categoriaId: undefined },
              ],
            },
            isLoading: false,
          } as any;
        }
        return { data: { items: [] } } as any;
      });

      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});

      render(<ProductSuggestions listId="list1" />);
      
      const addButton = screen.getByRole('button');
      await user.click(addButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          nombre: 'Producto',
          categoriaId: undefined,
          descripcion: undefined,
          cantidad: 1,
          precio: undefined,
          urgente: false,
        });
      });
    });
  });
});
