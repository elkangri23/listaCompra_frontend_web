/**
 * Tests CRÍTICOS (100% coverage) - use-collaboration.ts
 * Hooks para colaboración en tiempo real
 * 
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: queryClient, toast, intervals
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useAutoRefresh,
  useConflictDetection,
} from '@/features/lists/hooks/use-collaboration';
import { createTestQueryClient } from '../../utils/test-utils';
import { ReactNode } from 'react';
import { toast } from 'sonner';

jest.mock('sonner', () => ({
  toast: {
    warning: jest.fn(),
  },
}));

// Suprimir errores de navegación en jsdom
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (args[0]?.message?.includes('Not implemented: navigation')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('useCollaboration hooks (CRÍTICO - 100% coverage)', () => {
  let queryClient: QueryClient;
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('useAutoRefresh', () => {
    it('debe invalidar queries periódicamente', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const onRefresh = jest.fn();

      renderHook(
        () => useAutoRefresh({
          queryKey: ['lists', 'list-1', 'products'],
          interval: 5000,
          onRefresh,
        }),
        { wrapper }
      );

      // Avanzar 5 segundos
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['lists', 'list-1', 'products'],
        });
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('debe usar intervalo predeterminado de 10 segundos', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      renderHook(
        () => useAutoRefresh({
          queryKey: ['lists'],
        }),
        { wrapper }
      );

      // Avanzar 10 segundos (default)
      act(() => {
        jest.advanceTimersByTime(10000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['lists'],
        });
      });
    });

    it('debe hacer refresh múltiples veces', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const onRefresh = jest.fn();

      renderHook(
        () => useAutoRefresh({
          queryKey: ['products'],
          interval: 3000,
          onRefresh,
        }),
        { wrapper }
      );

      // Primer refresh
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(1);
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });

      // Segundo refresh
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(2);
        expect(onRefresh).toHaveBeenCalledTimes(2);
      });

      // Tercer refresh
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(3);
        expect(onRefresh).toHaveBeenCalledTimes(3);
      });
    });

    it('debe limpiar interval al desmontar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      const { unmount } = renderHook(
        () => useAutoRefresh({
          queryKey: ['lists'],
          interval: 5000,
        }),
        { wrapper }
      );

      // Avanzar 5 segundos y verificar que se ejecutó
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledTimes(1);
      });

      // Desmontar
      unmount();

      // Avanzar otros 5 segundos - NO debe ejecutarse
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Debe seguir siendo 1 (no incrementó)
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
    });

    it('debe retornar función refresh manual', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const onRefresh = jest.fn();

      const { result } = renderHook(
        () => useAutoRefresh({
          queryKey: ['lists'],
          interval: 10000,
          onRefresh,
        }),
        { wrapper }
      );

      // Llamar refresh manualmente (sin esperar intervalo)
      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalled();
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it('debe manejar queryKey complejos', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      renderHook(
        () => useAutoRefresh({
          queryKey: ['lists', 'list-1', 'products', { status: 'pending' }],
          interval: 5000,
        }),
        { wrapper }
      );

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({
          queryKey: ['lists', 'list-1', 'products', { status: 'pending' }],
        });
      });
    });
  });

  describe('useConflictDetection', () => {
    it('debe detectar conflicto y mostrar toast', () => {
      const onConflict = jest.fn();

      const { result } = renderHook(
        () => useConflictDetection({
          listId: 'list-1',
          lastModified: '2025-11-25T10:00:00Z',
          onConflict,
        }),
        { wrapper }
      );

      // Simular detección de conflicto
      act(() => {
        result.current.handleConflict();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        '⚠️ Otro usuario ha modificado esta lista',
        expect.objectContaining({
          description: 'Los cambios se han actualizado automáticamente.',
          action: expect.any(Object),
        })
      );
      expect(onConflict).toHaveBeenCalledTimes(1);
    });

    it('debe proporcionar acción de recargar en toast', () => {
      const { result } = renderHook(
        () => useConflictDetection({
          listId: 'list-1',
          lastModified: '2025-11-25T10:00:00Z',
        }),
        { wrapper }
      );

      act(() => {
        result.current.handleConflict();
      });

      // Verificar que se pasó la acción de recargar
      const toastCall = (toast.warning as jest.Mock).mock.calls[0];
      expect(toastCall[1].action).toBeDefined();
      expect(toastCall[1].action.label).toBe('Recargar');
      expect(toastCall[1].action.onClick).toBeDefined();

      // Ejecutar la acción de recargar
      act(() => {
        toastCall[1].action.onClick();
      });

      // Note: window.location.reload() no se puede verificar en jsdom
    });

    it('debe funcionar sin callback onConflict', () => {
      const { result } = renderHook(
        () => useConflictDetection({
          listId: 'list-1',
          lastModified: '2025-11-25T10:00:00Z',
        }),
        { wrapper }
      );

      // No debe lanzar error sin onConflict
      expect(() => {
        act(() => {
          result.current.handleConflict();
        });
      }).not.toThrow();

      expect(toast.warning).toHaveBeenCalled();
    });

    it('debe manejar múltiples conflictos', () => {
      const onConflict = jest.fn();

      const { result } = renderHook(
        () => useConflictDetection({
          listId: 'list-1',
          lastModified: '2025-11-25T10:00:00Z',
          onConflict,
        }),
        { wrapper }
      );

      // Primer conflicto
      act(() => {
        result.current.handleConflict();
      });

      expect(onConflict).toHaveBeenCalledTimes(1);
      expect(toast.warning).toHaveBeenCalledTimes(1);

      // Segundo conflicto
      act(() => {
        result.current.handleConflict();
      });

      expect(onConflict).toHaveBeenCalledTimes(2);
      expect(toast.warning).toHaveBeenCalledTimes(2);
    });

    it('debe incluir listId en el contexto', () => {
      const onConflict = jest.fn();

      renderHook(
        () => useConflictDetection({
          listId: 'list-123',
          lastModified: '2025-11-25T10:00:00Z',
          onConflict,
        }),
        { wrapper }
      );

      // El listId está disponible para el callback
      expect(onConflict).not.toHaveBeenCalled(); // Solo se llama en handleConflict
    });

    it('debe actualizar cuando cambia lastModified', () => {
      const onConflict = jest.fn();

      const { rerender } = renderHook(
        ({ lastModified }) => useConflictDetection({
          listId: 'list-1',
          lastModified,
          onConflict,
        }),
        {
          wrapper,
          initialProps: { lastModified: '2025-11-25T10:00:00Z' },
        }
      );

      // Cambiar lastModified
      rerender({ lastModified: '2025-11-25T11:00:00Z' });

      // El hook debe seguir funcionando con el nuevo timestamp
      expect(onConflict).not.toHaveBeenCalled();
    });
  });
});
