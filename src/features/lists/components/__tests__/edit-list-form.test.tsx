import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EditListForm } from '../edit-list-form';
import { FormProvider, useForm } from 'react-hook-form';

const RenderWithFormProvider = ({ children }: { children: React.ReactElement }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithFormProvider = (ui: React.ReactElement) => {
  return render(<RenderWithFormProvider>{ui}</RenderWithFormProvider>);
};

describe('EditListForm', () => {
  const mockList = {
    nombre: 'Mi lista',
    descripcion: 'Una descripción de mi lista',
  };

  it('should display validation messages when fields are invalid', async () => {
    renderWithFormProvider(<EditListForm list={mockList} onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
  });

  it('should submit the form when fields are valid', async () => {
    const onSubmitMock = jest.fn();
    renderWithFormProvider(<EditListForm list={mockList} onSubmit={onSubmitMock} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Mi lista editada' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Una nueva descripción' } });
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        nombre: 'Mi lista editada',
        descripcion: 'Una nueva descripción',
      });
    });
  });
});
