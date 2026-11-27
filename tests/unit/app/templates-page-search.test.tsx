import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import TemplatesPage from '@/app/(auth)/templates/page';

jest.mock('next-auth/react');
jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: (value: string) => value,
}));
jest.mock('@/features/blueprints/hooks/use-blueprints', () => ({
  useBlueprints: jest.fn(),
  useSearchBlueprints: jest.fn(),
  useCreateListFromBlueprint: jest.fn(),
  useDeleteBlueprint: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

import {
  useBlueprints,
  useSearchBlueprints,
  useCreateListFromBlueprint,
  useDeleteBlueprint,
} from '@/features/blueprints/hooks/use-blueprints';

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const emptyList = { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };

const searchResults = {
  results: [
    {
      id: 'bp-1',
      nombre: 'Compra semanal',
      descripcion: 'La de cada semana',
      esPublico: false,
      productosCount: 12,
      fechaCreacion: '2026-11-01T10:00:00.000Z',
      creadoPorId: 'u-me',
    },
    {
      id: 'bp-2',
      nombre: 'Compra mensual',
      descripcion: undefined,
      esPublico: true,
      productosCount: 30,
      fechaCreacion: '2026-11-01T10:00:00.000Z',
      creadoPorId: 'u-otra',
    },
  ],
  termino: 'compra',
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TemplatesPage />
    </QueryClientProvider>,
  );
}

describe('TemplatesPage: búsqueda de plantillas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ data: { user: { id: 'u-me' } } } as any);
    (useBlueprints as jest.Mock).mockReturnValue({ data: emptyList, isLoading: false });
    (useSearchBlueprints as jest.Mock).mockReturnValue({
      data: searchResults,
      isLoading: false,
    });
    (useCreateListFromBlueprint as jest.Mock).mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });
    (useDeleteBlueprint as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() });
  });

  it('con 2 o más caracteres muestra los resultados de /buscar en vez de las pestañas', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Buscar plantillas...'), {
      target: { value: 'compra' },
    });

    expect(screen.getByText(/Resultados para «compra»/)).toBeInTheDocument();
    expect(screen.getByText('(2)')).toBeInTheDocument();
    expect(screen.getByText('Compra semanal')).toBeInTheDocument();
    expect(screen.getByText('Compra mensual')).toBeInTheDocument();
    expect(screen.getByText('Mía')).toBeInTheDocument();
    expect(screen.getByText('Pública')).toBeInTheDocument();
    // Las pestañas quedan ocultas mientras se busca
    expect(screen.queryByText('Aún no tienes plantillas.')).not.toBeInTheDocument();
  });

  it('limpiar la búsqueda vuelve a las pestañas', () => {
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Buscar plantillas...'), {
      target: { value: 'compra' },
    });
    expect(screen.getByText(/Resultados para «compra»/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Limpiar búsqueda'));

    expect(screen.queryByText(/Resultados para/)).not.toBeInTheDocument();
    expect(screen.getByText('Aún no tienes plantillas.')).toBeInTheDocument();
  });

  it('sin resultados muestra el estado vacío de búsqueda', () => {
    (useSearchBlueprints as jest.Mock).mockReturnValue({
      data: { ...searchResults, results: [], total: 0 },
      isLoading: false,
    });
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('Buscar plantillas...'), {
      target: { value: 'zzz' },
    });

    expect(screen.getByText('Nada por aquí con «zzz».')).toBeInTheDocument();
  });
});
