import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListDetailPage from '@/app/(auth)/lists/[id]/page';

// Mock the necessary hooks and services
jest.mock('@/features/lists/hooks/use-lists', () => ({
  useList: () => ({
    data: { data: { id: '1', nombre: 'Mi Lista', descripcion: 'Mi descripción' } },
    isLoading: false,
    isError: false,
  }),
  useUpdateList: () => ({ mutate: jest.fn() }),
  useDeleteList: () => ({ mutateAsync: jest.fn().mockResolvedValue(undefined) }),
}));

jest.mock('@/features/products/hooks/use-products', () => ({
  useProducts: () => ({
    data: {
      items: [
        { id: '1', nombre: 'Producto 1', cantidad: 1, comprado: false, categoriaId: '1' },
        { id: '2', nombre: 'Producto 2', cantidad: 2, comprado: true, categoriaId: '2' },
      ],
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
  }),
  useCreateProduct: () => ({ mutate: jest.fn() }),
  useDeleteProduct: () => ({ mutate: jest.fn() }),
  useToggleProductPurchased: () => ({ mutate: jest.fn() }),
  useUpdateProduct: () => ({ mutate: jest.fn() }),
}));

jest.mock('@/features/categories/hooks/use-categories', () => ({
  useCategories: () => ({
    data: {
      categorias: [
        { id: '1', nombre: 'Categoría 1' },
        { id: '2', nombre: 'Categoría 2' },
      ],
    },
    isLoading: false,
  }),
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient();
  return render(
    <SessionProvider session={{
      expires: '1',
      user: { email: 'test@example.com', id: '1', nombre: 'Test User' },
    }}>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </SessionProvider>
  );
};

describe('ListDetailPage', () => {
  it('should render the page with products', async () => {
    renderWithProviders(<ListDetailPage />);

    // Check for list details
    expect(screen.getByText('Mi Lista')).toBeInTheDocument();

    // Check for products
    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
  });
});
