/**
 * Tests CRÍTICOS - category-service.ts
 * Servicios CRUD de categorías.
 * El backend envuelve las respuestas en { success, message, data }: el
 * servicio debe devolver el contenido de `data`, no el sobre entero.
 */

import { categoryService } from '@/features/categories/services/category-service';
import { axiosInstance } from '@/lib/api/axios-instance';
import {
  CategoryResponseDto,
  CategoriesListResponseDto,
} from '@/types/dtos/categories';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockCategory: CategoryResponseDto = {
  id: 'cat-1',
  nombre: 'Lácteos',
  activa: true,
} as unknown as CategoryResponseDto;

const mockCategoriesList = {
  categorias: [mockCategory],
  total: 1,
} as unknown as CategoriesListResponseDto;

// Respuesta real del backend: sobre { success, message, data }.
const envelope = <T>(data: T) => ({ data: { success: true, data } });

describe('categoryService (CRÍTICO)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('debe desempaquetar data.categorias del sobre del backend', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        envelope(mockCategoriesList)
      );

      const result = await categoryService.getCategories();

      expect(axiosInstance.get).toHaveBeenCalledWith('/categories', {
        params: undefined,
      });
      expect(result).toEqual(mockCategoriesList);
      expect(result.categorias).toHaveLength(1);
    });

    it('debe obtener categorías con filtros', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        envelope(mockCategoriesList)
      );

      await categoryService.getCategories({ tiendaId: 'store-1' });

      expect(axiosInstance.get).toHaveBeenCalledWith('/categories', {
        params: { tiendaId: 'store-1' },
      });
    });
  });

  describe('getCategoryById', () => {
    it('debe obtener una categoría por id', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue(
        envelope(mockCategory)
      );

      const result = await categoryService.getCategoryById('cat-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/categories/cat-1');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('debe crear una categoría', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue(
        envelope(mockCategory)
      );

      const dto = { nombre: 'Lácteos' };
      const result = await categoryService.createCategory(dto);

      expect(axiosInstance.post).toHaveBeenCalledWith('/categories', dto);
      expect(result).toEqual(mockCategory);
    });

    it('debe propagar errores del API', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue(
        new Error('Validation failed')
      );

      await expect(
        categoryService.createCategory({ nombre: '' })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('updateCategory', () => {
    it('debe actualizar la categoría separando el id del body', async () => {
      (axiosInstance.put as jest.Mock).mockResolvedValue(
        envelope(mockCategory)
      );

      const result = await categoryService.updateCategory({
        id: 'cat-1',
        nombre: 'Nuevo nombre',
      });

      expect(axiosInstance.put).toHaveBeenCalledWith('/categories/cat-1', {
        nombre: 'Nuevo nombre',
      });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('debe eliminar la categoría por id', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await categoryService.deleteCategory({ id: 'cat-1' });

      expect(axiosInstance.delete).toHaveBeenCalledWith('/categories/cat-1');
    });
  });

  describe('toggleCategoryStatus', () => {
    it('debe alternar el estado enviando el body sin el id', async () => {
      const toggled = { ...mockCategory, activa: false };
      (axiosInstance.patch as jest.Mock).mockResolvedValue(envelope(toggled));

      const result = await categoryService.toggleCategoryStatus({
        id: 'cat-1',
        activa: false,
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/categories/cat-1/toggle-status',
        { activa: false }
      );
      expect(result).toEqual(toggled);
    });
  });

  describe('moveCategoryToStore', () => {
    it('debe mover la categoría enviando el body sin el id', async () => {
      const moved = { ...mockCategory, tiendaId: 'store-1' };
      (axiosInstance.put as jest.Mock).mockResolvedValue(envelope(moved));

      const result = await categoryService.moveCategoryToStore({
        id: 'cat-1',
        tiendaId: 'store-1',
      });

      expect(axiosInstance.put).toHaveBeenCalledWith(
        '/categories/cat-1/move-to-store',
        { tiendaId: 'store-1' }
      );
      expect(result).toEqual(moved);
    });
  });
});
