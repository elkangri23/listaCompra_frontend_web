/**
 * Tests unitarios para ProductsKanban component (SECUNDARIO - 80% coverage)
 * 
 * @jest-environment jsdom
 * 
 * Componente testeado:
 * - ProductsKanban (tablero kanban con drag & drop para categorización de productos)
 * 
 * Este componente permite arrastrar productos entre columnas (categorías) para
 * recategorizarlos visualmente. Incluye columna especial "Sin Categoría".
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductsKanban } from '@/features/products/components/products-kanban';
import type { ProductoListDto } from '@/types/dtos/products';
import type { CategoryResponseDto } from '@/types/dtos/categories';

// Mock de lucide-react icons
jest.mock('lucide-react', () => ({
  GripVertical: () => <div data-testid="grip-icon" />,
  Package: () => <div data-testid="package-icon" />,
}));

describe('ProductsKanban (SECUNDARIO - 80% coverage)', () => {
  const mockCategories: CategoryResponseDto[] = [
    {
      id: 'cat-1',
      nombre: 'Frutas',
      descripcion: 'Frutas frescas',
      activa: true,
      tiendaId: 'store-1',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: 'cat-2',
      nombre: 'Verduras',
      descripcion: 'Verduras frescas',
      activa: true,
      tiendaId: 'store-1',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: 'cat-3',
      nombre: 'Lácteos',
      descripcion: 'Productos lácteos',
      activa: false, // Inactiva, no debe aparecer
      tiendaId: 'store-1',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    },
  ];

  const mockProducts: ProductoListDto[] = [
    {
      id: 'prod-1',
      nombre: 'Manzanas',
      cantidad: 5,
      categoriaId: 'cat-1',
      comprado: false,
      urgente: false,
      listaId: 'list-1',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      nombre: 'Lechuga',
      cantidad: 2,
      categoriaId: 'cat-2',
      comprado: true,
      urgente: false,
      listaId: 'list-1',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      nombre: 'Pan',
      cantidad: 1,
      categoriaId: null, // Sin categoría
      comprado: false,
      urgente: true,
      descripcion: 'Pan integral de centeno',
      listaId: 'list-1',
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    },
  ];

  const mockOnMoveProduct = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado básico', () => {
    it('debe renderizar columnas para categorías activas + columna "Sin Categoría"', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Columna "Sin Categoría" + 2 categorías activas (cat-3 está inactiva)
      expect(screen.getByText('Sin Categoría')).toBeInTheDocument();
      expect(screen.getByText('Frutas')).toBeInTheDocument();
      expect(screen.getByText('Verduras')).toBeInTheDocument();
      expect(screen.queryByText('Lácteos')).not.toBeInTheDocument(); // Inactiva
    });

    it('debe mostrar contador de productos en cada columna', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Sin Categoría: 1 producto (Pan)
      // Frutas: 1 producto (Manzanas)
      // Verduras: 1 producto (Lechuga)
      const badges = screen.getAllByText('1');
      expect(badges).toHaveLength(3);
    });

    it('debe renderizar productos en sus columnas correspondientes', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      expect(screen.getByText('Manzanas')).toBeInTheDocument();
      expect(screen.getByText('Lechuga')).toBeInTheDocument();
      expect(screen.getByText('Pan')).toBeInTheDocument();
    });

    it('debe mostrar badge "Comprado" para productos comprados', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      expect(screen.getByText('✓ Comprado')).toBeInTheDocument();
      expect(screen.getAllByText('Pendiente')).toHaveLength(2);
    });

    it('debe mostrar badge "Urgente" para productos urgentes', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      expect(screen.getByText('Urgente')).toBeInTheDocument();
    });

    it('debe mostrar descripción de productos si existe', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      expect(screen.getByText('Pan integral de centeno')).toBeInTheDocument();
    });
  });

  describe('Columnas vacías', () => {
    it('debe mostrar mensaje placeholder en columnas vacías', () => {
      const emptyProducts: ProductoListDto[] = [];

      render(
        <ProductsKanban
          products={emptyProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      expect(
        screen.getByText('Arrastra productos aquí para quitar su categoría')
      ).toBeInTheDocument();
      expect(
        screen.getAllByText('Arrastra productos aquí para categorizarlos')
      ).toHaveLength(2); // Frutas y Verduras
    });

    it('debe renderizar icono Package en columnas vacías', () => {
      const emptyProducts: ProductoListDto[] = [];

      render(
        <ProductsKanban
          products={emptyProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // 3 columnas vacías = 3 iconos Package (1 en "Sin Categoría" + 2 en categorías)
      const packageIcons = screen.getAllByTestId('package-icon');
      expect(packageIcons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Drag and Drop', () => {
    it('debe permitir hacer draggable los productos', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable="true"]');
      expect(manzanasDiv).toHaveAttribute('draggable', 'true');
    });

    it('debe establecer aria-grabbed=false por defecto', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable="true"]');
      expect(manzanasDiv).toHaveAttribute('aria-grabbed', 'false');
    });

    it('debe iniciar drag con onDragStart', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable="true"]');
      
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          effectAllowed: '',
          setData: jest.fn(),
        },
      });

      fireEvent(manzanasDiv!, dragStartEvent);

      // Verificar que se estableció effectAllowed
      expect((dragStartEvent as any).dataTransfer.effectAllowed).toBe('move');
    });

    it('debe llamar onMoveProduct al hacer drop en otra categoría', async () => {
      mockOnMoveProduct.mockResolvedValue(undefined);

      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Encontrar el producto "Pan" (prod-3, sin categoría)
      const panDiv = screen.getByText('Pan').closest('div[draggable="true"]');

      // Simular dragStart
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          effectAllowed: '',
          setData: jest.fn(),
        },
      });
      fireEvent(panDiv!, dragStartEvent);

      // Simular drop en columna "Frutas"
      const frutasColumn = screen.getByText('Frutas').closest('div[class*="flex-shrink-0"]');
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          dropEffect: 'move',
        },
      });
      
      fireEvent(frutasColumn!, dropEvent);

      await waitFor(() => {
        expect(mockOnMoveProduct).toHaveBeenCalledWith('prod-3', 'cat-1');
      });
    });

    it('debe pasar null al mover producto a "Sin Categoría"', async () => {
      mockOnMoveProduct.mockResolvedValue(undefined);

      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Producto "Manzanas" (prod-1, en cat-1)
      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable="true"]');

      // Simular dragStart
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          effectAllowed: '',
          setData: jest.fn(),
        },
      });
      fireEvent(manzanasDiv!, dragStartEvent);

      // Simular drop en "Sin Categoría"
      const sinCategoriaColumn = screen.getByText('Sin Categoría').closest('div[class*="flex-shrink-0"]');
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          dropEffect: 'move',
        },
      });
      
      fireEvent(sinCategoriaColumn!, dropEvent);

      await waitFor(() => {
        expect(mockOnMoveProduct).toHaveBeenCalledWith('prod-1', null);
      });
    });

    it('NO debe llamar onMoveProduct si se suelta en la misma categoría', async () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Producto "Manzanas" (ya está en cat-1)
      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable="true"]');

      // Simular dragStart
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          effectAllowed: '',
          setData: jest.fn(),
        },
      });
      fireEvent(manzanasDiv!, dragStartEvent);

      // Simular drop en la MISMA columna "Frutas"
      const frutasColumn = screen.getByText('Frutas').closest('div[class*="flex-shrink-0"]');
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: {
          dropEffect: 'move',
        },
      });
      
      fireEvent(frutasColumn!, dropEvent);

      // No debe llamarse porque ya está en esa categoría
      await waitFor(() => {
        expect(mockOnMoveProduct).not.toHaveBeenCalled();
      }, { timeout: 500 });
    });
  });

  describe('Estado isMoving', () => {
    it('debe deshabilitar drag cuando isMoving=true', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
          isMoving={true}
        />
      );

      // Buscar el div con draggable (el contenedor del producto, no solo el texto)
      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable]');
      expect(manzanasDiv).toHaveAttribute('draggable', 'false');
    });

    it('debe aplicar estilos de deshabilitado cuando isMoving=true', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
          isMoving={true}
        />
      );

      const manzanasDiv = screen.getByText('Manzanas').closest('div[draggable="false"]');
      expect(manzanasDiv?.className).toContain('cursor-not-allowed');
      expect(manzanasDiv?.className).toContain('opacity-60');
    });
  });

  describe('Agrupación de productos', () => {
    it('debe agrupar correctamente productos por categoría', () => {
      const multiProducts: ProductoListDto[] = [
        {
          id: 'prod-4',
          nombre: 'Naranjas',
          cantidad: 3,
          categoriaId: 'cat-1',
          comprado: false,
          urgente: false,
          listaId: 'list-1',
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        },
        {
          id: 'prod-5',
          nombre: 'Plátanos',
          cantidad: 6,
          categoriaId: 'cat-1',
          comprado: false,
          urgente: false,
          listaId: 'list-1',
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        },
      ];

      render(
        <ProductsKanban
          products={[...mockProducts, ...multiProducts]}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Columna Frutas debe tener 3 productos (Manzanas + Naranjas + Plátanos)
      expect(screen.getByText('Manzanas')).toBeInTheDocument();
      expect(screen.getByText('Naranjas')).toBeInTheDocument();
      expect(screen.getByText('Plátanos')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('debe manejar lista vacía de productos', () => {
      render(
        <ProductsKanban
          products={[]}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      expect(screen.getByText('Sin Categoría')).toBeInTheDocument();
      expect(screen.getByText('Frutas')).toBeInTheDocument();
      expect(screen.getAllByText('0')).toHaveLength(3); // Todas las columnas con 0
    });

    it('debe manejar lista vacía de categorías', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={[]}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // Solo debe aparecer "Sin Categoría"
      expect(screen.getByText('Sin Categoría')).toBeInTheDocument();
      expect(screen.queryByText('Frutas')).not.toBeInTheDocument();
      expect(screen.queryByText('Verduras')).not.toBeInTheDocument();
    });

    it('debe renderizar icono GripVertical en cada producto', () => {
      render(
        <ProductsKanban
          products={mockProducts}
          categories={mockCategories}
          onMoveProduct={mockOnMoveProduct}
        />
      );

      // 3 productos = 3 iconos GripVertical
      const gripIcons = screen.getAllByTestId('grip-icon');
      expect(gripIcons).toHaveLength(3);
    });
  });
});
