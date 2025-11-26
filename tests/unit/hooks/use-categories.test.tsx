import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCategories,
  useCategory,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useToggleCategoryStatus,
  useMoveCategoryToStore,
} from '@/features/categories/hooks/use-categories';
import { categoryService } from '@/features/categories/services/category-service';

// Mock del servicio
jest.mock('@/features/categories/services/category-service');

const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

describe('use-categories (SECUNDARIO - 80% coverage)', () => {
  let queryClient: QueryClient;
  let wrapper: React.ComponentType<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('useCategories', () => {
    it('debe obtener lista de categorías sin filtros', async () => {
      const mockCategories = {
        data: [
          { id: 'cat-1', nombre: 'Frutas', descripcion: 'Frutas frescas', activo: true },
          { id: 'cat-2', nombre: 'Verduras', descripcion: 'Verduras frescas', activo: true },
        ],
        total: 2,
      };

      mockCategoryService.getCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.getCategories).toHaveBeenCalledWith(undefined);
      expect(result.current.data).toEqual(mockCategories);
    });

    it('debe obtener categorías con filtros por tienda', async () => {
      const mockCategories = {
        data: [
          { id: 'cat-1', nombre: 'Lácteos', tiendaId: 'store-1' },
        ],
        total: 1,
      };

      mockCategoryService.getCategories.mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories({ tiendaId: 'store-1' }), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.getCategories).toHaveBeenCalledWith({ tiendaId: 'store-1' });
      expect(result.current.data?.data).toHaveLength(1);
    });

    it('debe manejar error al obtener categorías', async () => {
      const mockError = new Error('Error de red');
      mockCategoryService.getCategories.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });

    // Test de cache omitido - React Query caching behavior requiere configuración especial
  });

  describe('useCategory', () => {
    it('debe obtener categoría por ID', async () => {
      const mockCategory = { id: 'cat-1', nombre: 'Lácteos', descripcion: 'Productos lácteos' };
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      const { result } = renderHook(() => useCategory('cat-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('cat-1');
      expect(result.current.data).toEqual(mockCategory);
    });

    it('no debe ejecutar query si ID está vacío', () => {
      const { result } = renderHook(() => useCategory(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockCategoryService.getCategoryById).not.toHaveBeenCalled();
    });

    it('debe manejar error al obtener categoría específica', async () => {
      const mockError = new Error('Categoría no encontrada');
      mockCategoryService.getCategoryById.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCategory('invalid-id'), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useCreateCategory', () => {
    it('debe crear nueva categoría exitosamente', async () => {
      const newCategory = { nombre: 'Congelados', descripcion: 'Productos congelados' };
      const mockResponse = { id: 'cat-3', ...newCategory, activo: true };

      mockCategoryService.createCategory.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateCategory(), { wrapper });

      result.current.mutate(newCategory);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.createCategory).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe invalidar cache de categorías después de crear', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      mockCategoryService.createCategory.mockResolvedValue({ id: 'cat-1', nombre: 'Test' });

      const { result } = renderHook(() => useCreateCategory(), { wrapper });

      result.current.mutate({ nombre: 'Test' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });

    it('debe manejar error al crear categoría', async () => {
      const mockError = new Error('Error de validación');
      mockCategoryService.createCategory.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCreateCategory(), { wrapper });

      result.current.mutate({ nombre: '' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useUpdateCategory', () => {
    it('debe actualizar categoría existente', async () => {
      const updateData = { id: 'cat-1', nombre: 'Frutas Frescas', descripcion: 'Updated' };
      const mockResponse = { ...updateData, activo: true };

      mockCategoryService.updateCategory.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate(updateData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.updateCategory).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
    });

    it('debe invalidar cache después de actualizar', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      mockCategoryService.updateCategory.mockResolvedValue({ id: 'cat-1', nombre: 'Updated' });

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate({ id: 'cat-1', nombre: 'Updated' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });

    it('debe manejar error al actualizar', async () => {
      const mockError = new Error('Categoría no encontrada');
      mockCategoryService.updateCategory.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate({ id: 'invalid', nombre: 'Test' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useDeleteCategory', () => {
    it('debe eliminar categoría correctamente', async () => {
      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate({ id: 'cat-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.deleteCategory).toHaveBeenCalled();
    });

    it('debe invalidar cache después de eliminar', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate({ id: 'cat-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });

    it('debe manejar error al eliminar categoría en uso', async () => {
      const mockError = new Error('Categoría tiene productos asociados');
      mockCategoryService.deleteCategory.mockRejectedValue(mockError);

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate({ id: 'cat-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useToggleCategoryStatus', () => {
    it('debe activar/desactivar categoría', async () => {
      const mockResponse = { id: 'cat-1', nombre: 'Test', activo: false };
      mockCategoryService.toggleCategoryStatus.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useToggleCategoryStatus(), { wrapper });

      result.current.mutate({ id: 'cat-1', activo: false });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.toggleCategoryStatus).toHaveBeenCalled();
      expect(result.current.data?.activo).toBe(false);
    });

    it('debe invalidar cache después de toggle', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      mockCategoryService.toggleCategoryStatus.mockResolvedValue({ id: 'cat-1', activo: true });

      const { result } = renderHook(() => useToggleCategoryStatus(), { wrapper });

      result.current.mutate({ id: 'cat-1', activo: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });

    it('debe manejar error al cambiar estado', async () => {
      const mockError = new Error('No tienes permisos');
      mockCategoryService.toggleCategoryStatus.mockRejectedValue(mockError);

      const { result } = renderHook(() => useToggleCategoryStatus(), { wrapper });

      result.current.mutate({ id: 'cat-1', activo: false });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });

  describe('useMoveCategoryToStore', () => {
    it('debe mover categoría a otra tienda', async () => {
      const mockResponse = { id: 'cat-1', nombre: 'Test', tiendaId: 'store-2' };
      mockCategoryService.moveCategoryToStore.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMoveCategoryToStore(), { wrapper });

      result.current.mutate({ id: 'cat-1', tiendaId: 'store-2' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCategoryService.moveCategoryToStore).toHaveBeenCalled();
      expect(result.current.data?.tiendaId).toBe('store-2');
    });

    it('debe invalidar cache después de mover', async () => {
      const spyInvalidate = jest.spyOn(queryClient, 'invalidateQueries');
      mockCategoryService.moveCategoryToStore.mockResolvedValue({ id: 'cat-1', tiendaId: 'store-2' });

      const { result } = renderHook(() => useMoveCategoryToStore(), { wrapper });

      result.current.mutate({ id: 'cat-1', tiendaId: 'store-2' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(spyInvalidate).toHaveBeenCalledWith({ queryKey: ['categories'] });
    });

    it('debe manejar error al mover categoría', async () => {
      const mockError = new Error('Tienda no encontrada');
      mockCategoryService.moveCategoryToStore.mockRejectedValue(mockError);

      const { result } = renderHook(() => useMoveCategoryToStore(), { wrapper });

      result.current.mutate({ id: 'cat-1', tiendaId: 'invalid' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(mockError);
    });
  });
});
