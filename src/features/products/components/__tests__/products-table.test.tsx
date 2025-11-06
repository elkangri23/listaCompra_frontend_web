import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductsTable } from '../products-table';
import { ProductoListDto } from '@/types/dtos/products';

const mockProducts: ProductoListDto[] = [
  {
    id: 'prod-1',
    nombre: 'Manzanas',
    descripcion: 'Manzanas verdes',
    cantidad: 2,
    unidad: 'kg',
    precio: 3.5,
    comprado: false,
    urgente: false,
    categoriaId: 'frutas',
    fechaCreacion: '2025-01-01T00:00:00.000Z',
    valorTotal: 7,
  },
  {
    id: 'prod-2',
    nombre: 'Pan integral',
    descripcion: 'Sin azúcar',
    cantidad: 1,
    unidad: 'ud',
    precio: 1.2,
    comprado: true,
    urgente: true,
    categoriaId: 'panaderia',
    fechaCreacion: '2025-01-02T00:00:00.000Z',
    fechaCompra: '2025-01-03T00:00:00.000Z',
    valorTotal: 1.2,
  },
];

const categories = [
  { id: 'frutas', nombre: 'Frutas' },
  { id: 'panaderia', nombre: 'Panadería' },
];

const categoriesMap = categories.reduce<Record<string, string>>((acc, category) => {
  acc[category.id] = category.nombre;
  return acc;
}, {});

describe('ProductsTable', () => {
  it('renders product information and categories', () => {
    render(
      <ProductsTable
        products={mockProducts}
        categories={categories}
        categoriesMap={categoriesMap}
        onTogglePurchased={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        onAdjustQuantity={jest.fn()}
        onReorder={jest.fn()}
      />
    );

    expect(screen.getByText('Manzanas')).toBeInTheDocument();
    expect(screen.getByText('Pan integral')).toBeInTheDocument();
    expect(screen.getByText('Frutas')).toBeInTheDocument();
    expect(screen.getByText('Panadería')).toBeInTheDocument();
  });

  it('calls handlers for quantity, toggle, delete and reorder actions', async () => {
    const onTogglePurchased = jest.fn().mockResolvedValue(undefined);
    const onDelete = jest.fn().mockResolvedValue(undefined);
    const onEdit = jest.fn().mockResolvedValue(undefined);
    const onAdjustQuantity = jest.fn().mockResolvedValue(undefined);
    const onReorder = jest.fn().mockResolvedValue(undefined);

    render(
      <ProductsTable
        products={mockProducts}
        categories={categories}
        categoriesMap={categoriesMap}
        onTogglePurchased={onTogglePurchased}
        onDelete={onDelete}
        onEdit={onEdit}
        onAdjustQuantity={onAdjustQuantity}
        onReorder={onReorder}
      />
    );

        const product1Row = screen.getByTestId('product-row-prod-1');
    const increaseButton = within(product1Row).getByLabelText('Aumentar cantidad');
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(onAdjustQuantity).toHaveBeenCalledWith('prod-1', 3);
    });

    const toggle = screen.getByLabelText('Marcar Pan integral como pendiente');
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(onTogglePurchased).toHaveBeenCalledWith('prod-2', false);
    });

    const deleteButton = screen.getByLabelText('Eliminar Manzanas');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('prod-1');
    });

    const firstRow = screen.getByTestId('product-row-prod-1');
    const secondRow = screen.getByTestId('product-row-prod-2');

    fireEvent.dragStart(firstRow);
    fireEvent.dragOver(secondRow);
    fireEvent.dragEnd(firstRow);

    await waitFor(() => {
      expect(onReorder).toHaveBeenCalledWith(['prod-2', 'prod-1']);
    });
  });
});
