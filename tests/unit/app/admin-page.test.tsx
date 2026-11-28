/**
 * Tests - Panel de administración (/admin, fase 1): shell con las 7 pestañas.
 * Las secciones sin contenido real muestran el estado vacío honesto.
 */
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPage from '@/app/(auth)/admin/page';

const TAB_LABELS = [
  'Estado',
  'Usuarios',
  'IA',
  'Auditoría',
  'Seguridad',
  'Copias',
  'Métricas',
];

describe('Panel de administración (fase 1)', () => {
  it('muestra el título y las 7 pestañas', () => {
    render(<AdminPage />);

    expect(
      screen.getByRole('heading', { level: 1, name: /administración/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    for (const label of TAB_LABELS) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
    }
  });

  it('muestra la pestaña Estado por defecto con el estado vacío', () => {
    render(<AdminPage />);

    expect(screen.getByRole('tab', { name: 'Estado' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByText(/próximamente: esta sección llega en la siguiente fase/i),
    ).toBeInTheDocument();
  });

  it.each(TAB_LABELS.filter((label) => label !== 'Usuarios'))(
    'la pestaña %s muestra el estado vacío',
    (label) => {
      render(<AdminPage />);

      fireEvent.click(screen.getByRole('tab', { name: label }));

      expect(
        screen.getByText(/próximamente: esta sección llega en la siguiente fase/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 2, name: label }),
      ).toBeInTheDocument();
    },
  );

  it('la pestaña Usuarios enlaza a la gestión existente', () => {
    render(<AdminPage />);

    fireEvent.click(screen.getByRole('tab', { name: 'Usuarios' }));

    expect(
      screen.queryByText(
        /próximamente: esta sección llega en la siguiente fase/i,
      ),
    ).not.toBeInTheDocument();
    const link = screen.getByRole('link', {
      name: /abrir la gestión de usuarios/i,
    });
    expect(link).toHaveAttribute('href', '/admin/users');
  });
});
