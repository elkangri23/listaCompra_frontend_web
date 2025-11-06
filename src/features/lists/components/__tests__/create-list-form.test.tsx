import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CreateListForm } from '../create-list-form';
import { FormProvider, useForm } from 'react-hook-form';

const RenderWithFormProvider = ({ children }: { children: React.ReactElement }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderWithFormProvider = (ui: React.ReactElement) => {
  return render(<RenderWithFormProvider>{ui}</RenderWithFormProvider>);
};

describe('CreateListForm', () => {
  it('should display validation messages when fields are invalid', async () => {
    renderWithFormProvider(<CreateListForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /crear/i }));

    expect(await screen.findByText('El nombre es requerido')).toBeInTheDocument();
  });

  it('should submit the form when fields are valid', async () => {
    const onSubmitMock = jest.fn();
    renderWithFormProvider(<CreateListForm onSubmit={onSubmitMock} />);

    fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Mi nueva lista' } });
    fireEvent.change(screen.getByLabelText(/descripción/i), { target: { value: 'Una descripción para mi lista' } });
    fireEvent.click(screen.getByRole('button', { name: /crear/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        nombre: 'Mi nueva lista',
        descripcion: 'Una descripción para mi lista',
      });
    });
  });
});
