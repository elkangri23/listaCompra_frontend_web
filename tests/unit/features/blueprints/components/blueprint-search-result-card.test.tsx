import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { BlueprintSearchResultCard } from '@/features/blueprints/components/blueprint-search-result-card';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/features/blueprints/hooks/use-blueprints', () => ({
  useCreateListFromBlueprint: jest.fn(),
}));

import { useCreateListFromBlueprint } from '@/features/blueprints/hooks/use-blueprints';

const mockPush = jest.fn();
const mockMutateAsync = jest.fn();

const result = {
  id: 'bp-9',
  nombre: 'Compra semanal',
  descripcion: 'La de cada semana',
  esPublico: true,
  productosCount: 12,
  fechaCreacion: '2026-11-01T10:00:00.000Z',
  creadoPorId: 'u-2',
};

describe('BlueprintSearchResultCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useCreateListFromBlueprint as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
    mockMutateAsync.mockResolvedValue({ listaId: 'l-1', nombre: 'Compra semanal', productosCreados: 12 });
  });

  it('muestra nombre, descripción, distintivo Pública y conteo de productos', () => {
    render(<BlueprintSearchResultCard result={result} isMine={false} />);

    expect(screen.getByText('Compra semanal')).toBeInTheDocument();
    expect(screen.getByText('La de cada semana')).toBeInTheDocument();
    expect(screen.getByText('Pública')).toBeInTheDocument();
    expect(screen.getByText('12 productos')).toBeInTheDocument();
  });

  it('muestra Mía y singulariza un producto', () => {
    render(
      <BlueprintSearchResultCard result={{ ...result, productosCount: 1 }} isMine={true} />,
    );

    expect(screen.getByText('Mía')).toBeInTheDocument();
    expect(screen.getByText('1 producto')).toBeInTheDocument();
  });

  it('crea la lista y navega a ella al pulsar Usar Plantilla', async () => {
    render(<BlueprintSearchResultCard result={result} isMine={false} />);
    fireEvent.click(screen.getByText('Usar Plantilla'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        blueprintId: 'bp-9',
        data: { nombre: 'Compra semanal', descripcion: 'La de cada semana' },
      });
      expect(mockPush).toHaveBeenCalledWith('/lists/l-1');
    });
  });
});
