/**
 * Cálculo puro del nuevo orden de productos tras un arrastre (drag & drop)
 * o un movimiento con las flechas.
 *
 * La página no puede probar un drag real en jsdom, así que toda la lógica
 * de reorden vive aquí y se cubre con tests unitarios. La página solo
 * resuelve el grupo de cada producto (con categoriesMap) y ejecuta las
 * mutaciones con el resultado.
 */

export interface ReorderableProduct {
  id: string;
  categoriaId?: string | null;
}

export interface ProductReorderResult {
  /** Nuevo orden completo de la lista (ids en orden, posiciones 1..N). */
  orderedIds: string[];
  /**
   * Nueva categoría del producto arrastrado cuando cambia de grupo.
   * Presente (incluso null) solo si el producto cambia de grupo:
   * null = sin categoría.
   */
  newCategoriaId?: string | null;
}

/** Prefijo de los ids de los contenedores de grupo (destinos droppables). */
export const GROUP_DROPPABLE_PREFIX = 'group:';

export function groupDroppableId(groupKey: string): string {
  return `${GROUP_DROPPABLE_PREFIX}${groupKey}`;
}

export function isGroupDroppableId(id: string): boolean {
  return id.startsWith(GROUP_DROPPABLE_PREFIX);
}

export function groupKeyFromDroppableId(id: string): string {
  return id.slice(GROUP_DROPPABLE_PREFIX.length);
}

function groupArrays(
  products: ReorderableProduct[],
  groupKeyOf: (product: ReorderableProduct) => string
): Map<string, ReorderableProduct[]> {
  const groups = new Map<string, ReorderableProduct[]>();
  for (const p of products) {
    const key = groupKeyOf(p);
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }
  return groups;
}

/**
 * Resuelve a qué grupo pertenece el destino de un arrastre (`over.id`):
 * el id de un producto → su grupo; el id de un contenedor (`group:<clave>`)
 * → ese grupo; cualquier otro valor (o null) → null.
 */
export function resolveOverGroupKey(
  overId: string | null | undefined,
  products: ReorderableProduct[],
  groupKeyOf: (product: ReorderableProduct) => string
): string | null {
  if (!overId) return null;
  if (isGroupDroppableId(overId)) return groupKeyFromDroppableId(overId);
  const over = products.find((p) => p.id === overId);
  return over ? groupKeyOf(over) : null;
}

/**
 * Calcula el nuevo orden tras soltar el producto `activeId` sobre `overId`.
 *
 * - `overId` puede ser el id de otro producto (soltar sobre él) o el id de
 *   un contenedor de grupo (`group:<clave>`, soltar en el hueco del grupo,
 *   también si está vacío).
 * - Mismo grupo: el producto ocupa el lugar del producto destino
 *   (semántica de `arrayMove` de dnd-kit/sortable).
 * - Grupo distinto: el producto sale de su grupo, entra en el destino en
 *   la posición del producto destino (o al final si se suelta en el
 *   contenedor) y `newCategoriaId` refleja el cambio (`null` = sin
 *   categoría).
 * - Devuelve null cuando no hay cambio (soltar sobre sí mismo, fuera de
 *   cualquier destino, o ids desconocidos): la página no debe llamar a la
 *   API en ese caso.
 */
export function computeProductReorder(
  products: ReorderableProduct[],
  activeId: string,
  overId: string | null | undefined,
  groupKeyOf: (product: ReorderableProduct) => string
): ProductReorderResult | null {
  if (!overId) return null;

  const active = products.find((p) => p.id === activeId);
  if (!active) return null;

  const sourceKey = groupKeyOf(active);
  const groups = groupArrays(products, groupKeyOf);
  const sourceGroup = groups.get(sourceKey) ?? [];
  const activeIndexInGroup = sourceGroup.findIndex((p) => p.id === activeId);
  if (activeIndexInGroup < 0) return null;

  let targetKey: string;
  let targetIndex: number;
  if (isGroupDroppableId(overId)) {
    targetKey = groupKeyFromDroppableId(overId);
    targetIndex = (groups.get(targetKey) ?? []).length;
  } else {
    const over = products.find((p) => p.id === overId);
    if (!over) return null;
    targetKey = groupKeyOf(over);
    const targetGroup = groups.get(targetKey) ?? [];
    targetIndex = targetGroup.findIndex((p) => p.id === overId);
    if (targetIndex < 0) return null;
  }

  const sameGroup = targetKey === sourceKey;
  if (sameGroup && targetIndex === activeIndexInGroup) return null;

  // Copia mutable de los grupos para reordenar sin tocar la entrada.
  const nextGroups = new Map<string, ReorderableProduct[]>();
  for (const [key, arr] of groups) nextGroups.set(key, [...arr]);

  if (sameGroup) {
    const group = nextGroups.get(sourceKey)!;
    const [moved] = group.splice(activeIndexInGroup, 1);
    group.splice(targetIndex, 0, moved);
  } else {
    const source = nextGroups.get(sourceKey)!;
    const [moved] = source.splice(activeIndexInGroup, 1);
    const target = nextGroups.get(targetKey) ?? [];
    // Si el destino está por debajo del origen en el mismo array global
    // no afecta: los grupos son independientes.
    target.splice(targetIndex, 0, moved);
    nextGroups.set(targetKey, target);
  }

  // Orden global: los grupos mantienen su orden de primera aparición en
  // la lista original; un grupo destino nuevo (vacío antes) va al final.
  const groupOrder: string[] = [];
  for (const p of products) {
    const key = groupKeyOf(p);
    if (!groupOrder.includes(key)) groupOrder.push(key);
  }
  if (!groupOrder.includes(targetKey)) groupOrder.push(targetKey);

  const orderedIds = groupOrder.flatMap((key) =>
    (nextGroups.get(key) ?? []).map((p) => p.id)
  );

  const result: ProductReorderResult = { orderedIds };
  if (!sameGroup) {
    result.newCategoriaId = targetKey === '__nocat__' ? null : targetKey;
  }
  return result;
}
