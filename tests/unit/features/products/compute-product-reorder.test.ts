import {
  computeProductReorder,
  resolveOverGroupKey,
  groupDroppableId,
  type ReorderableProduct,
} from '@/features/products/lib/compute-product-reorder';

const groupKeyOf = (p: ReorderableProduct): string => p.categoriaId ?? '__nocat__';

describe('computeProductReorder', () => {
  const products: ReorderableProduct[] = [
    { id: 'a', categoriaId: 'cat1' },
    { id: 'b', categoriaId: 'cat1' },
    { id: 'c', categoriaId: 'cat1' },
    { id: 'x', categoriaId: 'cat2' },
    { id: 'y', categoriaId: 'cat2' },
  ];

  it('mueve un producto hacia abajo dentro de su grupo (semántica arrayMove)', () => {
    const result = computeProductReorder(products, 'a', 'c', groupKeyOf);
    expect(result).toEqual({ orderedIds: ['b', 'c', 'a', 'x', 'y'] });
  });

  it('mueve un producto hacia arriba dentro de su grupo', () => {
    const result = computeProductReorder(products, 'c', 'a', groupKeyOf);
    expect(result).toEqual({ orderedIds: ['c', 'a', 'b', 'x', 'y'] });
  });

  it('intercambia dos productos adyacentes del mismo grupo', () => {
    const result = computeProductReorder(products, 'a', 'b', groupKeyOf);
    expect(result).toEqual({ orderedIds: ['b', 'a', 'c', 'x', 'y'] });
  });

  it('devuelve null al soltar un producto sobre sí mismo', () => {
    expect(computeProductReorder(products, 'b', 'b', groupKeyOf)).toBeNull();
  });

  it('devuelve null al soltar fuera de cualquier destino', () => {
    expect(computeProductReorder(products, 'b', null, groupKeyOf)).toBeNull();
  });

  it('devuelve null con ids desconocidos', () => {
    expect(computeProductReorder(products, 'zzz', 'a', groupKeyOf)).toBeNull();
    expect(computeProductReorder(products, 'a', 'zzz', groupKeyOf)).toBeNull();
  });

  it('mueve un producto a otro grupo y cambia su categoría', () => {
    // 'c' (cat1) sobre 'x' (cat2): entra antes que 'x' en cat2.
    const result = computeProductReorder(products, 'c', 'x', groupKeyOf);
    expect(result).toEqual({
      orderedIds: ['a', 'b', 'c', 'x', 'y'],
      newCategoriaId: 'cat2',
    });
  });

  it('mueve un producto a otro grupo soltándolo sobre su segundo producto', () => {
    // 'a' (cat1) sobre 'y' (cat2): entra entre 'x' e 'y'.
    const result = computeProductReorder(products, 'a', 'y', groupKeyOf);
    expect(result).toEqual({
      orderedIds: ['b', 'c', 'x', 'a', 'y'],
      newCategoriaId: 'cat2',
    });
  });

  it('soltar en el contenedor de un grupo añade al final de ese grupo', () => {
    const result = computeProductReorder(products, 'a', groupDroppableId('cat2'), groupKeyOf);
    expect(result).toEqual({
      orderedIds: ['b', 'c', 'x', 'y', 'a'],
      newCategoriaId: 'cat2',
    });
  });

  it('soltar en el grupo sin categoría quita la categoría', () => {
    const result = computeProductReorder(products, 'a', groupDroppableId('__nocat__'), groupKeyOf);
    expect(result).toEqual({
      orderedIds: ['b', 'c', 'x', 'y', 'a'],
      newCategoriaId: null,
    });
  });

  it('soltar sobre un grupo vacío (sin productos) funciona', () => {
    const result = computeProductReorder(products, 'x', groupDroppableId('cat3'), groupKeyOf);
    expect(result).toEqual({
      orderedIds: ['a', 'b', 'c', 'y', 'x'],
      newCategoriaId: 'cat3',
    });
  });

  it('quitar la categoría de un producto con PATCH null la deja sin categoría', () => {
    const withNoCat: ReorderableProduct[] = [
      { id: 'a', categoriaId: 'cat1' },
      { id: 'b', categoriaId: null },
    ];
    // 'a' sobre el contenedor sin categoría: pasa a ser el segundo sin categoría.
    const result = computeProductReorder(withNoCat, 'a', groupDroppableId('__nocat__'), groupKeyOf);
    expect(result).toEqual({
      orderedIds: ['b', 'a'],
      newCategoriaId: null,
    });
  });

  it('mantiene el orden de los grupos según su primera aparición', () => {
    const mixed: ReorderableProduct[] = [
      { id: 'x', categoriaId: 'cat2' },
      { id: 'a', categoriaId: 'cat1' },
      { id: 'y', categoriaId: 'cat2' },
      { id: 'b', categoriaId: 'cat1' },
    ];
    const result = computeProductReorder(mixed, 'b', 'a', groupKeyOf);
    // Grupo cat1: [b, a]; grupo cat2: [x, y]; cat2 apareció primero.
    expect(result).toEqual({ orderedIds: ['x', 'y', 'b', 'a'] });
  });

  it('no muta la lista de entrada', () => {
    const snapshot = JSON.stringify(products);
    computeProductReorder(products, 'a', 'y', groupKeyOf);
    expect(JSON.stringify(products)).toBe(snapshot);
  });
});

describe('resolveOverGroupKey', () => {
  const products: ReorderableProduct[] = [
    { id: 'a', categoriaId: 'cat1' },
    { id: 'b', categoriaId: null },
  ];

  it('resuelve el grupo de un producto', () => {
    expect(resolveOverGroupKey('a', products, groupKeyOf)).toBe('cat1');
    expect(resolveOverGroupKey('b', products, groupKeyOf)).toBe('__nocat__');
  });

  it('resuelve el grupo de un contenedor', () => {
    expect(resolveOverGroupKey(groupDroppableId('cat2'), products, groupKeyOf)).toBe('cat2');
  });

  it('devuelve null sin destino o con destino desconocido', () => {
    expect(resolveOverGroupKey(null, products, groupKeyOf)).toBeNull();
    expect(resolveOverGroupKey('zzz', products, groupKeyOf)).toBeNull();
  });
});
