import { render, screen } from '@testing-library/react';
import { Sidebar } from '../sidebar';

describe('Sidebar', () => {
  it('should render the sidebar navigation links', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Mis Listas')).toBeInTheDocument();
    expect(screen.getByText('Invitaciones')).toBeInTheDocument();
  });
});
