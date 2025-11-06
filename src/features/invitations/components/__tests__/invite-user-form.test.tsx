import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { InviteUserForm } from '../invite-user-form';

describe('InviteUserForm', () => {
  it('should display a validation message when the email is invalid', async () => {
    render(<InviteUserForm onSubmit={jest.fn()} />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'invalid-email' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar invitación/i }));

    expect(await screen.findByText('Ingresa un correo electrónico válido.')).toBeInTheDocument();
  });

  it('should submit the form when the email is valid', async () => {
    const onSubmitMock = jest.fn();
    render(<InviteUserForm onSubmit={onSubmitMock} />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar invitación/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });
});
