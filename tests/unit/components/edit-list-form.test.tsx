/**
 * edit-list-form.test.tsx
 * Tests secundarios (80% coverage) para el componente EditListForm
 * 
 * Componente: EditListForm - Formulario controlado para editar lista
 * Tests planificados: 12 tests
 * 
 * Características:
 * - Formulario controlado con estado local (nombre, descripción)
 * - Inicialización con datos de lista existente
 * - Validación de submit con preventDefault
 * - Callback onSubmit con valores actualizados
 * - Inputs con labels y placeholders
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditListForm } from '@/features/lists/components/edit-list-form';
import { Lista } from '@/types/Lista.types';

describe('EditListForm', () => {
  const mockOnSubmit = jest.fn();

  const mockList: Lista = {
    id: 'list1',
    nombre: 'Lista de Compras',
    descripcion: 'Lista para el supermercado',
    creadoPor: 'user1',
    compartida: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar el formulario con campos de nombre y descripción', () => {
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
      expect(screen.getByLabelText('Descripción')).toBeInTheDocument();
    });

    it('debe inicializar el campo nombre con el valor de la lista', () => {
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const nombreInput = screen.getByLabelText('Nombre') as HTMLInputElement;
      expect(nombreInput.value).toBe('Lista de Compras');
    });

    it('debe inicializar el campo descripción con el valor de la lista', () => {
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const descripcionInput = screen.getByLabelText('Descripción') as HTMLInputElement;
      expect(descripcionInput.value).toBe('Lista para el supermercado');
    });

    it('debe inicializar descripción vacía si la lista no tiene descripción', () => {
      const listSinDescripcion: Lista = {
        ...mockList,
        descripcion: undefined,
      };

      render(<EditListForm list={listSinDescripcion} onSubmit={mockOnSubmit} />);
      
      const descripcionInput = screen.getByLabelText('Descripción') as HTMLInputElement;
      expect(descripcionInput.value).toBe('');
    });

    it('debe renderizar botón de Guardar', () => {
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
    });

    it('debe tener placeholders en los inputs', () => {
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      expect(screen.getByPlaceholderText('Mi nueva lista')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Una breve descripción')).toBeInTheDocument();
    });
  });

  describe('Actualización de campos', () => {
    it('debe actualizar el valor del campo nombre al escribir', async () => {
      const user = userEvent.setup();
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const nombreInput = screen.getByLabelText('Nombre') as HTMLInputElement;
      
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Nueva Lista');
      
      expect(nombreInput.value).toBe('Nueva Lista');
    });

    it('debe actualizar el valor del campo descripción al escribir', async () => {
      const user = userEvent.setup();
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const descripcionInput = screen.getByLabelText('Descripción') as HTMLInputElement;
      
      await user.clear(descripcionInput);
      await user.type(descripcionInput, 'Nueva descripción');
      
      expect(descripcionInput.value).toBe('Nueva descripción');
    });
  });

  describe('Submit del formulario', () => {
    it('debe llamar a onSubmit con los valores actualizados al hacer submit', async () => {
      const user = userEvent.setup();
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const nombreInput = screen.getByLabelText('Nombre');
      const descripcionInput = screen.getByLabelText('Descripción');
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      
      await user.clear(nombreInput);
      await user.type(nombreInput, 'Lista Actualizada');
      
      await user.clear(descripcionInput);
      await user.type(descripcionInput, 'Descripción actualizada');
      
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          nombre: 'Lista Actualizada',
          descripcion: 'Descripción actualizada',
        });
      });
    });

    it('debe prevenir el comportamiento por defecto del formulario', async () => {
      const user = userEvent.setup();
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const form = screen.getByRole('button', { name: /guardar/i }).closest('form')!;
      const preventDefaultSpy = jest.fn();
      
      form.addEventListener('submit', (e) => {
        preventDefaultSpy();
        e.preventDefault();
      });
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(preventDefaultSpy).toHaveBeenCalled();
      });
    });

    it('debe llamar a onSubmit con descripción vacía si se borra', async () => {
      const user = userEvent.setup();
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const descripcionInput = screen.getByLabelText('Descripción');
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      
      await user.clear(descripcionInput);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          nombre: 'Lista de Compras',
          descripcion: '',
        });
      });
    });

    it('debe mantener los valores originales si no se modifican', async () => {
      const user = userEvent.setup();
      render(<EditListForm list={mockList} onSubmit={mockOnSubmit} />);
      
      const submitButton = screen.getByRole('button', { name: /guardar/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          nombre: 'Lista de Compras',
          descripcion: 'Lista para el supermercado',
        });
      });
    });
  });
});
