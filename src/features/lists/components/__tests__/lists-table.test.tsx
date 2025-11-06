import { render, screen } from '@testing-library/react';
import { ListsTable } from '../lists-table';
import { Lista } from '@/types/Lista.types';

const mockLists: Lista[] = [
  { id: '1', nombre: 'Lista 1', descripcion: 'Descripción 1' },
  { id: '2', nombre: 'Lista 2', descripcion: 'Descripción 2' },
];

describe('ListsTable', () => {
  it('should render the table with the provided lists', () => {
    render(<ListsTable lists={mockLists} />);

    expect(screen.getByText('Lista 1')).toBeInTheDocument();
    expect(screen.getByText('Descripción 1')).toBeInTheDocument();
    expect(screen.getByText('Lista 2')).toBeInTheDocument();
    expect(screen.getByText('Descripción 2')).toBeInTheDocument();
  });
});
