import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListsTable } from '@/features/lists/components/lists-table';
import { useDeleteList, useUpdateList } from '@/features/lists/hooks/use-lists';
import { Lista } from '@/types/Lista.types';

// Mock de Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock de dynamic import para EditListDialog
jest.mock('next/dynamic', () => {
  return (loader: any) => {
    const DynamicComponent = (props: any) => {
      const EditListDialogMock = ({ list, onSubmit }: any) => (
        <button data-testid={`edit-${list.id}`} onClick={() => onSubmit({ nombre: 'Updated', descripcion: 'Updated description' })}>
          Editar
        </button>
      );
      return <EditListDialogMock {...props} />;
    };
    DynamicComponent.displayName = 'EditListDialog';
    return DynamicComponent;
  };
});

// Mock de hooks de listas
jest.mock('@/features/lists/hooks/use-lists');

const mockUseDeleteList = useDeleteList as jest.MockedFunction<typeof useDeleteList>;
const mockUseUpdateList = useUpdateList as jest.MockedFunction<typeof useUpdateList>;

describe('ListsTable', () => {
  const mockDeleteMutate = jest.fn();
  const mockUpdateMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.confirm = jest.fn(() => true);

    mockUseDeleteList.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
    } as any);

    mockUseUpdateList.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
      data: undefined,
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockLists: Lista[] = [
    {
      id: 'list1',
      nombre: 'Lista de Compras',
      descripcion: 'Lista para el supermercado',
      creadoPor: 'user1',
      compartida: false,
      createdAt: new Date('2025-11-26T10:00:00Z').toISOString(),
      updatedAt: new Date('2025-11-26T10:00:00Z').toISOString(),
    },
    {
      id: 'list2',
      nombre: 'Lista de Ferretería',
      descripcion: 'Herramientas y materiales',
      creadoPor: 'user1',
      compartida: true,
      createdAt: new Date('2025-11-26T09:00:00Z').toISOString(),
      updatedAt: new Date('2025-11-26T09:00:00Z').toISOString(),
    },
  ];

  describe('Renderizado inicial', () => {
    it('debe renderizar la tabla con encabezados correctos', () => {
      render(<ListsTable lists={[]} />);

      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Descripción')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });

    it('debe renderizar una tabla vacía cuando no hay listas', () => {
      render(<ListsTable lists={[]} />);

      const tbody = screen.getByRole('table').querySelector('tbody');
      expect(tbody?.children).toHaveLength(0);
    });

    it('debe renderizar todas las listas en la tabla', () => {
      render(<ListsTable lists={mockLists} />);

      expect(screen.getByText('Lista de Compras')).toBeInTheDocument();
      expect(screen.getByText('Lista para el supermercado')).toBeInTheDocument();
      expect(screen.getByText('Lista de Ferretería')).toBeInTheDocument();
      expect(screen.getByText('Herramientas y materiales')).toBeInTheDocument();
    });

    it('debe renderizar links a las páginas de detalle de cada lista', () => {
      render(<ListsTable lists={mockLists} />);

      const link1 = screen.getByText('Lista de Compras').closest('a');
      const link2 = screen.getByText('Lista de Ferretería').closest('a');

      expect(link1).toHaveAttribute('href', '/lists/list1');
      expect(link2).toHaveAttribute('href', '/lists/list2');
    });
  });

  describe('Botones de acción', () => {
    it('debe renderizar botones Editar y Eliminar para cada lista', () => {
      render(<ListsTable lists={mockLists} />);

      expect(screen.getByTestId('edit-list1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-list2')).toBeInTheDocument();

      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons).toHaveLength(2);
    });

    it('debe renderizar botón Editar como EditListDialog para cada lista', () => {
      render(<ListsTable lists={mockLists} />);

      const editButton1 = screen.getByTestId('edit-list1');
      const editButton2 = screen.getByTestId('edit-list2');

      expect(editButton1).toHaveTextContent('Editar');
      expect(editButton2).toHaveTextContent('Editar');
    });
  });

  describe('Actualización de listas', () => {
    const user = userEvent.setup();

    it('debe llamar a updateListMutation.mutate al editar una lista', async () => {
      render(<ListsTable lists={mockLists} />);

      const editButton = screen.getByTestId('edit-list1');
      await user.click(editButton);

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          id: 'list1',
          data: {
            nombre: 'Updated',
            descripcion: 'Updated description',
          },
        });
      });
    });

    it('debe pasar el id correcto al actualizar cada lista', async () => {
      render(<ListsTable lists={mockLists} />);

      const editButton2 = screen.getByTestId('edit-list2');
      await user.click(editButton2);

      await waitFor(() => {
        expect(mockUpdateMutate).toHaveBeenCalledWith({
          id: 'list2',
          data: {
            nombre: 'Updated',
            descripcion: 'Updated description',
          },
        });
      });
    });
  });

  describe('Eliminación de listas', () => {
    const user = userEvent.setup();

    it('debe mostrar confirmación antes de eliminar una lista', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ListsTable lists={mockLists} />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith('¿Estás seguro de que quieres eliminar esta lista?');
      confirmSpy.mockRestore();
    });

    it('debe llamar a deleteListMutation.mutate si se confirma la eliminación', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ListsTable lists={mockLists} />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteMutate).toHaveBeenCalledWith('list1');
      });
    });

    it('NO debe eliminar si se cancela la confirmación', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(<ListsTable lists={mockLists} />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockDeleteMutate).not.toHaveBeenCalled();
      });
    });

    it('debe eliminar la lista correcta según el botón clickeado', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(<ListsTable lists={mockLists} />);

      const deleteButtons = screen.getAllByText('Eliminar');
      await user.click(deleteButtons[1]); // Segunda lista

      await waitFor(() => {
        expect(mockDeleteMutate).toHaveBeenCalledWith('list2');
      });
    });
  });
});
