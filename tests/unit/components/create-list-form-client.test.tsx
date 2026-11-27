/**
 * Tests - CreateListFormClient (lote perfil/tiendas): diálogo «Nueva tienda»
 * dentro del formulario de crear lista; la tienda creada queda seleccionada.
 */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateListFormClient } from '@/features/lists/components/create-list-form-client';

const createListMock = jest.fn();
const createStoreMock = jest.fn();

jest.mock('@/features/lists/hooks/use-lists', () => ({
  useCreateList: () => ({
    mutateAsync: createListMock,
    isPending: false,
  }),
}));

jest.mock('@/features/stores/hooks/use-stores', () => ({
  useStores: () => ({
    data: {
      tiendas: [{ id: 't-mercadona', nombre: 'Mercadona' }],
      total: 1,
    },
    isLoading: false,
  }),
  useCreateStore: () => ({
    mutateAsync: createStoreMock,
    isPending: false,
  }),
}));

const renderForm = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreateListFormClient />
    </QueryClientProvider>
  );
};

describe('CreateListFormClient — Nueva tienda (lote perfil/tiendas)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createStoreMock.mockResolvedValue({ id: 't-lidl', nombre: 'Lidl' });
  });

  it('muestra las tiendas existentes y el botón de nueva tienda', () => {
    renderForm();

    expect(screen.getByLabelText(/tienda \(opcional\)/i)).toHaveValue('');
    expect(
      screen.getByRole('option', { name: 'Mercadona' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /nueva tienda/i })
    ).toBeInTheDocument();
  });

  it('abre el diálogo, crea la tienda y la deja seleccionada', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /nueva tienda/i }));

    expect(
      await screen.findByRole('dialog', { name: /crear nueva tienda/i })
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/nombre de la tienda/i), {
      target: { value: 'Lidl' },
    });
    fireEvent.click(screen.getByRole('button', { name: /crear tienda/i }));

    await waitFor(() => {
      expect(createStoreMock).toHaveBeenCalledWith({ nombre: 'Lidl' });
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', { name: /crear nueva tienda/i })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByLabelText(/tienda \(opcional\)/i)).toHaveValue(
      't-lidl'
    );
    expect(
      screen.getByRole('option', { name: 'Lidl' })
    ).toBeInTheDocument();
  });

  it('no crea la tienda con el nombre vacío', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /nueva tienda/i }));

    await screen.findByRole('dialog', { name: /crear nueva tienda/i });

    expect(
      screen.getByRole('button', { name: /crear tienda/i })
    ).toBeDisabled();
    expect(createStoreMock).not.toHaveBeenCalled();
  });

  it('muestra el error si la creación de la tienda falla', async () => {
    createStoreMock.mockRejectedValue(new Error('Fallo de red'));
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /nueva tienda/i }));

    await screen.findByRole('dialog', { name: /crear nueva tienda/i });

    fireEvent.change(screen.getByLabelText(/nombre de la tienda/i), {
      target: { value: 'Lidl' },
    });
    fireEvent.click(screen.getByRole('button', { name: /crear tienda/i }));

    expect(
      await screen.findByText('No se pudo crear la tienda. Inténtalo nuevamente.')
    ).toBeInTheDocument();
    expect(createStoreMock).toHaveBeenCalledWith({ nombre: 'Lidl' });
  });
});
