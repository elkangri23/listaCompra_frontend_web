'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import { groupDroppableId } from '../lib/compute-product-reorder';

type SortableReturn = ReturnType<typeof useSortable>;

export interface SortableRowRenderProps {
  attributes: SortableReturn['attributes'];
  listeners: SortableReturn['listeners'];
  isDragging: boolean;
}

interface SortableProductRowProps {
  /** Id del producto (id sortable, único en toda la lista). */
  sortableId: string;
  /** Id DOM de la fila (para scrollToFirstUnchecked). */
  domId?: string;
  /** Sin arrastre mientras el producto está en edición. */
  disabled?: boolean;
  className?: string;
  children: (props: SortableRowRenderProps) => ReactNode;
}

/**
 * Fila de producto arrastrable. Solo el tirador (GripVertical) activa el
 * arrastre: los listeners van en el tirador, no en toda la fila, para no
 * romper el tap en el checkbox, la edición ni el scroll táctil.
 * La fila arrastrada se muestra semi-transparente.
 */
export function SortableProductRow({
  sortableId,
  domId,
  disabled,
  className,
  children,
}: SortableProductRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sortableId, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div ref={setNodeRef} id={domId} style={style} className={className}>
      {children({ attributes, listeners, isDragging })}
    </div>
  );
}

interface DroppableProductGroupProps {
  groupKey: string;
  /** Ids de los productos del grupo, en orden. */
  itemIds: string[];
  /** Resaltado mientras un arrastre está sobre este grupo. */
  highlighted?: boolean;
  /** Clase CSS del anillo de destino (la pasa la página). */
  highlightClassName?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Contenedor de un grupo de categoría: es un destino droppable válido
 * (también su hueco vacío, no solo sus productos) y un SortableContext
 * para sus filas.
 */
export function DroppableProductGroup({
  groupKey,
  itemIds,
  highlighted,
  highlightClassName,
  className,
  children,
}: DroppableProductGroupProps) {
  const { setNodeRef, isOver } = useDroppable({ id: groupDroppableId(groupKey) });

  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ''}${(highlighted || isOver) && highlightClassName ? ` ${highlightClassName}` : ''}`}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  );
}
