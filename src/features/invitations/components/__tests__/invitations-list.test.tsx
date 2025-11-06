import { render, screen } from '@testing-library/react';
import { InvitationsList } from '../invitations-list';
import { Invitacion } from '@/types/Invitacion.types';

const mockInvitations: Invitacion[] = [
  {
    id: '1',
    listaId: 'list-1',
    email: 'test1@example.com',
    estado: 'PENDIENTE',
  },
  {
    id: '2',
    listaId: 'list-2',
    email: 'test2@example.com',
    estado: 'ACEPTADA',
  },
];

describe('InvitationsList', () => {
  it('should render the list of invitations', () => {
    render(<InvitationsList invitations={mockInvitations} />);

    expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    expect(screen.getByText('test2@example.com')).toBeInTheDocument();
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
    expect(screen.getByText('ACEPTADA')).toBeInTheDocument();
  });
});
