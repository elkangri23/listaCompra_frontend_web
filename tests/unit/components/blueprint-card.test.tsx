/**
 * @file blueprint-card.test.tsx
 * @description Tests secundarios (80% coverage) para BlueprintCard component
 * 
 * Tests: 15 tests
 * - Renderizado básico: Card info, badges, productos count
 * - Dropdown menu: Editar, eliminar con confirmación
 * - Crear lista: Botón, loading state, redirección
 * - Visibilidad: Badges público/privado
 * - Edge cases: Sin descripción, sin etiquetas, sin callback onEdit
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlueprintCard } from '@/features/blueprints/components/blueprint-card';
import * as useBlueprintsHooks from '@/features/blueprints/hooks/use-blueprints';
import { useRouter } from 'next/navigation';
import type { BlueprintDto } from '@/types/dtos/blueprint';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('lucide-react', () => ({
  FileText: () => <div data-testid="file-text-icon" />,
  MoreVertical: () => <div data-testid="more-vertical-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Package: () => <div data-testid="package-icon" />,
}));

const mockUseDeleteBlueprint = jest.fn();
const mockUseCreateListFromBlueprint = jest.fn();

jest.mock('@/features/blueprints/hooks/use-blueprints', () => ({
  useDeleteBlueprint: () => mockUseDeleteBlueprint(),
  useCreateListFromBlueprint: () => mockUseCreateListFromBlueprint(),
}));

// Mock blueprint data
const mockBlueprint: BlueprintDto = {
  id: 'blueprint-1',
  nombre: 'Compra Semanal',
  descripcion: 'Lista de compras para la semana',
  productos: [
    { id: 'prod-1', nombre: 'Leche', cantidad: 2, unidad: 'litros' },
    { id: 'prod-2', nombre: 'Pan', cantidad: 1, unidad: 'ud' },
    { id: 'prod-3', nombre: 'Huevos', cantidad: 12, unidad: 'ud' },
  ],
  esPublico: true,
  usosCount: 5,
  etiquetas: ['semanal', 'básicos'],
  creadoPor: 'user-1',
  creadoEn: new Date().toISOString(),
};

describe('BlueprintCard (SECUNDARIO - 80% coverage)', () => {
  let queryClient: QueryClient;
  const mockPush = jest.fn();
  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    mockUseDeleteBlueprint.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });

    mockUseCreateListFromBlueprint.mockReturnValue({
      mutateAsync: jest.fn(),
      isPending: false,
    });

    // Mock window.confirm
    global.confirm = jest.fn(() => true);

    jest.clearAllMocks();
  });

  const renderComponent = (props: Partial<React.ComponentProps<typeof BlueprintCard>> = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BlueprintCard blueprint={mockBlueprint} {...props} />
      </QueryClientProvider>
    );
  };

  describe('Renderizado básico', () => {
    it('debe renderizar el nombre y descripción del blueprint', () => {
      renderComponent();

      expect(screen.getByText('Compra Semanal')).toBeInTheDocument();
      expect(screen.getByText('Lista de compras para la semana')).toBeInTheDocument();
    });

    it('debe renderizar el icono FileText', () => {
      renderComponent();

      expect(screen.getByTestId('file-text-icon')).toBeInTheDocument();
    });

    it('debe renderizar el contador de productos', () => {
      renderComponent();

      expect(screen.getByText('3 productos')).toBeInTheDocument();
      expect(screen.getByTestId('package-icon')).toBeInTheDocument();
    });

    it('debe renderizar badge "Pública" cuando esPublico=true', () => {
      renderComponent();

      expect(screen.getByText('Pública')).toBeInTheDocument();
      expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
    });

    it('debe renderizar badge "Privada" cuando esPublico=false', () => {
      const privateBlueprint = { ...mockBlueprint, esPublico: false };
      renderComponent({ blueprint: privateBlueprint });

      expect(screen.getByText('Privada')).toBeInTheDocument();
      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    it('debe renderizar el contador de usos', () => {
      renderComponent();

      expect(screen.getByText('5 usos')).toBeInTheDocument();
    });

    it('debe renderizar las etiquetas', () => {
      renderComponent();

      expect(screen.getByText('semanal')).toBeInTheDocument();
      expect(screen.getByText('básicos')).toBeInTheDocument();
    });
  });

  describe('Dropdown menu', () => {
    it('debe abrir el dropdown menu al hacer clic', async () => {
      renderComponent();
      const user = userEvent.setup();

      const menuButton = screen.getByRole('button', { name: /más opciones/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Eliminar')).toBeInTheDocument();
      });
    });

    it('debe mostrar opción "Editar" cuando se proporciona onEdit', async () => {
      const mockOnEdit = jest.fn();
      renderComponent({ onEdit: mockOnEdit });
      const user = userEvent.setup();

      const menuButton = screen.getByRole('button', { name: /más opciones/i });
      await user.click(menuButton);

      await waitFor(() => {
        expect(screen.getByText('Editar')).toBeInTheDocument();
      });
    });

    it('debe llamar a onEdit al hacer clic en "Editar"', async () => {
      const mockOnEdit = jest.fn();
      renderComponent({ onEdit: mockOnEdit });
      const user = userEvent.setup();

      const menuButton = screen.getByRole('button', { name: /más opciones/i });
      await user.click(menuButton);

      const editButton = await screen.findByText('Editar');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockBlueprint);
    });

    it('debe confirmar antes de eliminar blueprint', async () => {
      renderComponent();
      const user = userEvent.setup();

      const menuButton = screen.getByRole('button', { name: /más opciones/i });
      await user.click(menuButton);

      const deleteButton = await screen.findByText('Eliminar');
      await user.click(deleteButton);

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('¿Estás seguro de que quieres eliminar la plantilla "Compra Semanal"?')
      );
    });

    it('debe eliminar blueprint después de confirmar', async () => {
      renderComponent();
      const user = userEvent.setup();

      const menuButton = screen.getByRole('button', { name: /más opciones/i });
      await user.click(menuButton);

      const deleteButton = await screen.findByText('Eliminar');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith('blueprint-1');
      });
    });

    it('NO debe eliminar si se cancela la confirmación', async () => {
      (global.confirm as jest.Mock).mockReturnValueOnce(false);
      renderComponent();
      const user = userEvent.setup();

      const menuButton = screen.getByRole('button', { name: /más opciones/i });
      await user.click(menuButton);

      const deleteButton = await screen.findByText('Eliminar');
      await user.click(deleteButton);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Crear lista desde blueprint', () => {
    it('debe renderizar botón "Usar Plantilla"', () => {
      renderComponent();

      expect(screen.getByRole('button', { name: /usar plantilla/i })).toBeInTheDocument();
    });

    it('debe crear lista y redirigir al hacer clic en "Usar Plantilla"', async () => {
      const mockCreateMutate = jest.fn().mockResolvedValue({ listaId: 'list-123' });
      mockUseCreateListFromBlueprint.mockReturnValueOnce({
        mutateAsync: mockCreateMutate,
        isPending: false,
      });

      renderComponent();
      const user = userEvent.setup();

      const createButton = screen.getByRole('button', { name: /usar plantilla/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCreateMutate).toHaveBeenCalledWith({
          blueprintId: 'blueprint-1',
          data: {
            nombre: 'Compra Semanal',
            descripcion: 'Lista de compras para la semana',
          },
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/lists/list-123');
      });
    });

    it('debe deshabilitar botón mientras está creando lista', async () => {
      mockUseCreateListFromBlueprint.mockReturnValueOnce({
        mutateAsync: jest.fn().mockImplementation(() => new Promise(() => {})),
        isPending: true,
      });

      renderComponent();

      const createButton = screen.getByRole('button', { name: /creando/i });
      expect(createButton).toBeDisabled();
    });
  });

  describe('Edge cases', () => {
    it('debe renderizar "Sin descripción" cuando no hay descripción', () => {
      const blueprintWithoutDesc = { ...mockBlueprint, descripcion: '' };
      renderComponent({ blueprint: blueprintWithoutDesc });

      expect(screen.getByText('Sin descripción')).toBeInTheDocument();
    });

    it('NO debe renderizar etiquetas si no hay', () => {
      const blueprintWithoutTags = { ...mockBlueprint, etiquetas: [] };
      renderComponent({ blueprint: blueprintWithoutTags });

      expect(screen.queryByText('semanal')).not.toBeInTheDocument();
      expect(screen.queryByText('básicos')).not.toBeInTheDocument();
    });

    it('NO debe renderizar contador de usos si es 0', () => {
      const blueprintWithoutUses = { ...mockBlueprint, usosCount: 0 };
      renderComponent({ blueprint: blueprintWithoutUses });

      expect(screen.queryByText(/usos/i)).not.toBeInTheDocument();
    });

    it('debe renderizar "1 uso" en singular', () => {
      const blueprintWithOneUse = { ...mockBlueprint, usosCount: 1 };
      renderComponent({ blueprint: blueprintWithOneUse });

      expect(screen.getByText('1 uso')).toBeInTheDocument();
    });
  });
});
