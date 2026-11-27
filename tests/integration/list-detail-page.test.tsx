import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ListDetailPage from '@/app/(auth)/lists/[id]/page';

const mockUpdateMutate = jest.fn();
const mockReorderMutate = jest.fn();

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
        { id: '3', nombre: 'Producto 3', cantidad: 1, comprado: false, categoriaId: '1' },
      ],
      totalPages: 1,
    },
    isLoading: false,
    isError: false,
  }),
  useCreateProduct: () => ({ mutate: jest.fn() }),
  useDeleteProduct: () => ({ mutate: jest.fn() }),
  useToggleProductPurchased: () => ({ mutate: jest.fn() }),
  useUpdateProduct: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useReorderProducts: () => ({ mutate: mockReorderMutate, isPending: false }),
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

describe('ListDetailPage: categorizar a mano y reordenar', () => {
  beforeEach(() => {
    mockUpdateMutate.mockClear();
    mockReorderMutate.mockClear();
  });

  const startEditing = (productName: string) => {
    renderWithProviders(<ListDetailPage />);
    fireEvent.click(screen.getByLabelText(`Editar producto ${productName}`));
  };

  it('el desplegable de categoría muestra la categoría actual del producto', async () => {
    startEditing('Producto 1');

    const select = screen.getByLabelText('Categoría') as HTMLSelectElement;
    expect(select.value).toBe('1');
    expect(screen.getByRole('option', { name: 'Sin categoría' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Categoría 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Categoría 2' })).toBeInTheDocument();
  });

  it('guardar con otra categoría envía el cambio', async () => {
    startEditing('Producto 1');

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '2' } });
    fireEvent.click(screen.getByText('✓'));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '1',
        data: expect.objectContaining({ categoriaId: '2' }),
      }),
      expect.anything()
    );
  });

  it('guardar con Sin categoría envía null para quitarla', async () => {
    startEditing('Producto 1');

    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: '' } });
    fireEvent.click(screen.getByText('✓'));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '1',
        data: expect.objectContaining({ categoriaId: null }),
      }),
      expect.anything()
    );
  });

  it('guardar sin tocar la categoría no la envía', async () => {
    startEditing('Producto 1');

    fireEvent.click(screen.getByText('✓'));

    expect(mockUpdateMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '1',
        data: expect.objectContaining({ categoriaId: undefined }),
      }),
      expect.anything()
    );
  });

  it('las flechas de reorden están deshabilitadas en los extremos del grupo', async () => {
    startEditing('Producto 1');

    expect(screen.getByLabelText('Subir producto')).toBeDisabled();
    expect(screen.getByLabelText('Bajar producto')).toBeEnabled();
  });

  it('un producto solo en su grupo tiene las dos flechas deshabilitadas', async () => {
    startEditing('Producto 2');

    expect(screen.getByLabelText('Subir producto')).toBeDisabled();
    expect(screen.getByLabelText('Bajar producto')).toBeDisabled();
  });

  it('bajar el primer producto del grupo reordena la lista completa', async () => {
    startEditing('Producto 1');

    fireEvent.click(screen.getByLabelText('Bajar producto'));

    // Grupo Categoría 1: [Producto 1, Producto 3]; al bajar el 1 se
    // intercambia con el 3 en el orden global [1, 2, 3] -> [3, 2, 1].
    expect(mockReorderMutate).toHaveBeenCalledWith(['3', '2', '1']);
  });
});
