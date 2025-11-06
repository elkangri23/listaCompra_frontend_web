import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductForm } from '../product-form';

describe('ProductForm', () => {
  const mockCategories = [
    { id: 'frutas', nombre: 'Frutas' },
    { id: 'verduras', nombre: 'Verduras' },
  ];

  it('should display validation messages when fields are invalid', async () => {
    render(<ProductForm categories={mockCategories} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();
  });

  it('should submit the form when fields are valid', async () => {
    const onSubmitMock = jest.fn();
    render(<ProductForm categories={mockCategories} onSubmit={onSubmitMock} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Manzanas' } });
    fireEvent.change(screen.getByLabelText(/cantidad/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/precio/i), { target: { value: '1.5' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        nombre: 'Manzanas',
        descripcion: undefined,
        cantidad: 2,
        unidad: undefined,
        precio: 1.5,
        urgente: false,
        categoriaId: undefined,
      });
    });
  });
});
