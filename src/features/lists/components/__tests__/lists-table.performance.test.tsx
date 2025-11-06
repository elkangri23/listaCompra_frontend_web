import { render, screen } from '@testing-library/react';
import { ListsTable } from '../lists-table';
import { Lista } from '@/types/Lista.types';

function buildLists(total: number): Lista[] {
  return Array.from({ length: total }, (_, index) => ({
    id: `list-${index}`,
    nombre: `Lista ${index}`,
    descripcion: 'Descripción genérica',
    usuarioId: 'user-1',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
  }));
}

describe('ListsTable virtual scrolling', () => {
  it('limita la cantidad de filas renderizadas cuando hay muchas listas', () => {
    const lists = buildLists(150);

    render(<ListsTable lists={lists} />);

    const renderedRows = screen.getAllByRole('row');
    expect(renderedRows.length).toBeLessThan(lists.length + 1); // +1 por el header
  });

  it('renderiza todas las filas para colecciones pequeñas', () => {
    const lists = buildLists(4);

    render(<ListsTable lists={lists} />);

    const dataRows = screen.getAllByRole('row').slice(1); // excluir header
    expect(dataRows.length).toBe(lists.length);
  });
});
