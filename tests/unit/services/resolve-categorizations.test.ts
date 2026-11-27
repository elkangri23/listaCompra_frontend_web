import { resolveCategorizations } from '@/features/ai/services/resolve-categorizations';
import type { CategorizedProduct } from '@/types/dtos/ai';
import type { CategoryResponseDto } from '@/types/dtos/categories';
import type { ProductoListDto } from '@/types/dtos/products';

const lacteos = {
  id: 'cat-lacteos',
  nombre: 'Lácteos',
  activa: true,
} as CategoryResponseDto;
const panaderia = {
  id: 'cat-panaderia',
  nombre: 'Panadería',
  activa: true,
} as CategoryResponseDto;

const products = [
  { id: 'p-leche', nombre: 'leche', categoriaId: null },
  { id: 'p-pan', nombre: 'pan', categoriaId: null },
  { id: 'p-soja', nombre: 'soja salsa', categoriaId: null },
] as ProductoListDto[];

const categorized = (nombre: string, category: string): CategorizedProduct =>
  ({
    nombre,
    suggestedCategory: { nombre: category, confidence: 90 },
    alternativeCategories: [],
    source: 'ai',
    processingTimeMs: 100,
  }) as CategorizedProduct;

describe('resolveCategorizations', () => {
  it('resuelve categorías existentes por nombre exacto', async () => {
    const createCategory = jest.fn();

    const { categorizations, createdCategories, skippedProducts } =
      await resolveCategorizations(
        [categorized('leche', 'Lácteos'), categorized('pan', 'Panadería')],
        products,
        [lacteos, panaderia],
        new Map(),
        createCategory
      );

    expect(categorizations.get('p-leche')).toBe('cat-lacteos');
    expect(categorizations.get('p-pan')).toBe('cat-panaderia');
    expect(createCategory).not.toHaveBeenCalled();
    expect(createdCategories).toEqual([]);
    expect(skippedProducts).toEqual([]);
  });

  it('resuelve sin distinguir mayúsculas y minúsculas', async () => {
    const createCategory = jest.fn();

    const { categorizations } = await resolveCategorizations(
      [categorized('leche', 'lácteos')],
      products,
      [lacteos],
      new Map(),
      createCategory
    );

    expect(categorizations.get('p-leche')).toBe('cat-lacteos');
    expect(createCategory).not.toHaveBeenCalled();
  });

  it('el override del usuario manda sobre la sugerencia', async () => {
    const createCategory = jest.fn();

    const { categorizations } = await resolveCategorizations(
      [categorized('leche', 'Lácteos')],
      products,
      [lacteos, panaderia],
      new Map([['p-leche', 'Panadería']]),
      createCategory
    );

    expect(categorizations.get('p-leche')).toBe('cat-panaderia');
  });

  it('crea la categoría sugerida cuando no existe y la reutiliza', async () => {
    const created = {
      id: 'cat-salsas',
      nombre: 'Salsas',
      activa: true,
    } as CategoryResponseDto;
    const createCategory = jest.fn().mockResolvedValue(created);
    const twoProducts = [
      products[2],
      { id: 'p-barbacoa', nombre: 'salsa barbacoa', categoriaId: null },
    ] as ProductoListDto[];

    const { categorizations, createdCategories, skippedProducts } =
      await resolveCategorizations(
        [
          categorized('soja salsa', 'Salsas'),
          categorized('salsa barbacoa', 'Salsas'),
        ],
        twoProducts,
        [lacteos],
        new Map(),
        createCategory
      );

    expect(categorizations.get('p-soja')).toBe('cat-salsas');
    expect(categorizations.get('p-barbacoa')).toBe('cat-salsas');
    expect(createdCategories).toEqual(['Salsas']);
    expect(skippedProducts).toEqual([]);
    expect(createCategory).toHaveBeenCalledTimes(1);
  });

  it('deja fuera el producto si la creación de la categoría falla', async () => {
    const createCategory = jest
      .fn()
      .mockRejectedValue(new Error('No se pudo crear'));

    const { categorizations, createdCategories, skippedProducts } =
      await resolveCategorizations(
        [categorized('soja salsa', 'Salsas'), categorized('leche', 'Lácteos')],
        products,
        [lacteos],
        new Map(),
        createCategory
      );

    expect(categorizations.has('p-soja')).toBe(false);
    expect(categorizations.get('p-leche')).toBe('cat-lacteos');
    expect(createdCategories).toEqual([]);
    expect(skippedProducts).toEqual(['soja salsa']);
  });

  it('deja fuera el producto sin sugerencia y el que no está en la lista', async () => {
    const createCategory = jest.fn();
    const noSuggestion = {
      nombre: 'huevos',
      alternativeCategories: [],
      source: 'error',
      processingTimeMs: 0,
    } as unknown as CategorizedProduct;

    const { categorizations, skippedProducts } = await resolveCategorizations(
      [noSuggestion, categorized('inexistente', 'Lácteos')],
      products,
      [lacteos],
      new Map(),
      createCategory
    );

    expect(categorizations.size).toBe(0);
    expect(skippedProducts).toEqual(['huevos', 'inexistente']);
    expect(createCategory).not.toHaveBeenCalled();
  });
});
