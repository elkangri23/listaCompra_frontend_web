import { render, screen } from '@testing-library/react';
import { ProductsTable } from '../products-table';
import { ProductoListDto } from '@/types/dtos/products';

const baseProduct: ProductoListDto = {
  id: '1',
  nombre: 'Producto',
  descripcion: null,
  cantidad: 1,
  unidad: null,
  precio: null,
  comprado: false,
  urgente: false,
  categoriaId: null,
  fechaCreacion: new Date().toISOString(),
  fechaActualizacion: new Date().toISOString(),
};

function buildProducts(total: number): ProductoListDto[] {
  return Array.from({ length: total }, (_, index) => ({
    ...baseProduct,
    id: `prod-${index}`,
    nombre: `Producto ${index}`,
  }));
}

const noop = async () => {};

describe('ProductsTable performance optimizations', () => {
  it('virtualizes long product lists to limitar el número de nodos en el DOM', () => {
    const products = buildProducts(200);

    render(
      <ProductsTable
        products={products}
        categories={[]}
        categoriesMap={{}}
        onTogglePurchased={noop}
        onDelete={noop}
        onEdit={noop}
        onAdjustQuantity={noop}
        onReorder={async () => {}}
      />
    );

    const renderedRows = screen.getAllByTestId(/product-row-/i);
    expect(renderedRows.length).toBeLessThan(products.length);
    expect(renderedRows.length).toBeGreaterThan(0);
  });

  it('renderiza todas las filas cuando la lista es corta', () => {
    const products = buildProducts(5);

    render(
      <ProductsTable
        products={products}
        categories={[]}
        categoriesMap={{}}
        onTogglePurchased={noop}
        onDelete={noop}
        onEdit={noop}
        onAdjustQuantity={noop}
        onReorder={async () => {}}
      />
    );

    const renderedRows = screen.getAllByTestId(/product-row-/i);
    expect(renderedRows.length).toBe(products.length);
  });
});
