/**
 * Tests CRÍTICOS - blueprint-service.ts
 * Servicios de blueprints (plantillas de listas)
 */

import { axiosInstance } from '@/lib/api/axios-instance';
import { blueprintService } from '@/features/blueprints/services/blueprint-service';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockBlueprint = {
  id: 'bp-1',
  nombre: 'Compra semanal',
  esPublico: false,
  productos: [],
};

describe('blueprintService (CRÍTICO)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBlueprints', () => {
    it('debe obtener blueprints sin filtros (query vacía)', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });

      await blueprintService.getBlueprints();

      expect(axiosInstance.get).toHaveBeenCalledWith('/blueprints?');
    });

    it('debe construir la query con los filtros aplicables', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });

      await blueprintService.getBlueprints({
        search: 'semana',
        esPublico: true,
        etiqueta: 'hogar',
        page: 2,
        limit: 5,
      });

      const calledUrl = (axiosInstance.get as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl.startsWith('/blueprints?')).toBe(true);
      expect(calledUrl).toContain('search=semana');
      expect(calledUrl).toContain('esPublico=true');
      expect(calledUrl).toContain('etiqueta=hogar');
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('limit=5');
    });

    it('debe omitir filtros indefinidos', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: [], total: 0 } });

      await blueprintService.getBlueprints({ search: undefined, esPublico: undefined, etiqueta: undefined, page: undefined, limit: undefined });

      const calledUrl = (axiosInstance.get as jest.Mock).mock.calls[0][0] as string;
      expect(calledUrl).toBe('/blueprints?');
    });
  });

  describe('getBlueprintById', () => {
    it('debe obtener un blueprint por id', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: mockBlueprint });

      const result = await blueprintService.getBlueprintById('bp-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/blueprints/bp-1');
      expect(result).toEqual(mockBlueprint);
    });
  });

  describe('createBlueprint', () => {
    it('debe crear un blueprint', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockBlueprint });

      const dto = { nombre: 'Compra semanal', productos: [] } as never;
      const result = await blueprintService.createBlueprint(dto);

      expect(axiosInstance.post).toHaveBeenCalledWith('/blueprints', dto);
      expect(result).toEqual(mockBlueprint);
    });
  });

  describe('updateBlueprint', () => {
    it('debe actualizar un blueprint por id', async () => {
      (axiosInstance.put as jest.Mock).mockResolvedValue({ data: mockBlueprint });

      const result = await blueprintService.updateBlueprint('bp-1', { nombre: 'Nuevo' } as never);

      expect(axiosInstance.put).toHaveBeenCalledWith('/blueprints/bp-1', { nombre: 'Nuevo' });
      expect(result).toEqual(mockBlueprint);
    });
  });

  describe('deleteBlueprint', () => {
    it('debe eliminar un blueprint por id', async () => {
      (axiosInstance.delete as jest.Mock).mockResolvedValue({ data: {} });

      await blueprintService.deleteBlueprint('bp-1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/blueprints/bp-1');
    });
  });

  describe('createListFromBlueprint', () => {
    it('debe crear una lista enviando el body vacío si no hay datos', async () => {
      const backendResponse = {
        lista: { id: 'list-1', nombre: 'Nueva lista' },
        resumen: { productosCreados: 3 },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: backendResponse });

      const result = await blueprintService.createListFromBlueprint('bp-1');

      expect(axiosInstance.post).toHaveBeenCalledWith('/blueprints/bp-1/crear-lista', {});
      expect(result).toEqual({ listaId: 'list-1', nombre: 'Nueva lista', productosCreados: 3 });
    });

    it('debe enviar los datos proporcionados mapeados a nombreLista/descripcionLista', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue({
        data: { lista: { id: 'list-1', nombre: 'Mi versión' }, resumen: { productosCreados: 2 } },
      });

      const dto = { nombre: 'Mi versión', descripcion: 'Para la semana' } as never;
      const result = await blueprintService.createListFromBlueprint('bp-1', dto);

      expect(axiosInstance.post).toHaveBeenCalledWith('/blueprints/bp-1/crear-lista', {
        nombreLista: 'Mi versión',
        descripcionLista: 'Para la semana',
      });
      expect(result).toEqual({ listaId: 'list-1', nombre: 'Mi versión', productosCreados: 2 });
    });
  });

  describe('searchBlueprints', () => {
    it('mapea la respuesta del backend (campos en español) al DTO del frontend', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: {
          blueprints: [
            {
              id: 'bp-9',
              nombre: 'Compra semanal',
              descripcion: 'La de cada semana',
              publico: true,
              productosCount: 12,
              fechaCreacion: '2026-11-01T10:00:00.000Z',
              fechaActualizacion: '2026-11-02T10:00:00.000Z',
              creadoPorId: 'u-2',
            },
          ],
          termino: 'semanal',
          pagina: 1,
          limite: 20,
          total: 1,
          totalPages: 1,
        },
      });

      const result = await blueprintService.searchBlueprints('semanal');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/blueprints/buscar?q=semanal&pagina=1&limite=20',
      );
      expect(result).toEqual({
        results: [
          {
            id: 'bp-9',
            nombre: 'Compra semanal',
            descripcion: 'La de cada semana',
            esPublico: true,
            productosCount: 12,
            fechaCreacion: '2026-11-01T10:00:00.000Z',
            creadoPorId: 'u-2',
          },
        ],
        termino: 'semanal',
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('codifica el término y respeta la página pedida', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: { blueprints: [], termino: 'a b', pagina: 2, limite: 20, total: 0, totalPages: 0 },
      });

      await blueprintService.searchBlueprints('a b', 2);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/blueprints/buscar?q=a%20b&pagina=2&limite=20',
      );
    });
  });

  describe('createBlueprintFromList', () => {
    it('debe obtener los productos, transformarlos y crear el blueprint', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: {
          items: [
            {
              nombre: 'Leche',
              descripcion: 'Entera',
              cantidad: 2,
              unidad: 'litros',
              categoriaId: 'cat-1',
              categoria: { nombre: 'Lácteos' },
            },
            {
              nombre: 'Pan',
              cantidad: undefined,
              unidad: undefined,
              categoriaId: undefined,
              categoria: undefined,
            },
          ],
        },
      });
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockBlueprint });

      const result = await blueprintService.createBlueprintFromList('list-1', {
        nombre: 'Mi plantilla',
      } as never);

      expect(axiosInstance.get).toHaveBeenCalledWith('/lists/list-1/products?limit=500');
      expect(axiosInstance.post).toHaveBeenCalledWith('/blueprints', {
        nombre: 'Mi plantilla',
        productos: [
          {
            nombre: 'Leche',
            descripcion: 'Entera',
            cantidad: 2,
            unidad: 'litros',
            categoriaId: 'cat-1',
            categoriaNombre: 'Lácteos',
          },
          {
            nombre: 'Pan',
            descripcion: undefined,
            cantidad: 1,
            unidad: undefined,
            categoriaId: undefined,
            categoriaNombre: undefined,
          },
        ],
      });
      expect(result).toEqual(mockBlueprint);
    });

    it('debe usar data.data.items si no hay items en el primer nivel', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: {
          data: {
            items: [{ nombre: 'Cereal', cantidad: 1 }],
          },
        },
      });
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: mockBlueprint });

      await blueprintService.createBlueprintFromList('list-1', { nombre: 'Plantilla' } as never);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/blueprints',
        expect.objectContaining({
          productos: [expect.objectContaining({ nombre: 'Cereal' })],
        })
      );
    });
  });
});
