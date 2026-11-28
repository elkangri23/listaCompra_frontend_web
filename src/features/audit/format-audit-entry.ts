import type { AuditChangeType, AuditEntryDto } from './types';

/**
 * Humanización de entradas de auditoría, compartida por el historial por
 * lista (detalle de lista, pestaña «Cambios») y la vista global del panel
 * de administración (pestaña Auditoría). No duplicar este formateo.
 */

const FIELD_LABELS: Record<string, string> = {
  nombre: 'nombre',
  descripcion: 'descripción',
  comprado: 'comprado',
  cantidad: 'cantidad',
  categoriaId: 'categoría',
  precio: 'precio',
  tiendaId: 'tienda',
  notas: 'notas',
  unidad: 'unidad',
  prioridad: 'prioridad',
  fechaCompra: 'fecha de compra',
};

// 'fechaCompra' acompaña siempre a 'comprado' y no aporta nada en el resumen.
const HIDDEN_FIELDS = new Set(['fechaCompra']);

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined) return 'vacío';
  if (typeof value === 'boolean') return value ? 'sí' : 'no';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function entityName(entry: AuditEntryDto): string {
  const snapshot = entry.changeType === 'DELETE' ? entry.oldValue : entry.newValue;
  if (entry.entityType === 'Lista') {
    return (snapshot?.['nombre'] as string) || 'la lista';
  }
  return (snapshot?.['nombre'] as string) || 'un producto';
}

/**
 * Frase en español con el actor («Tú marcaste…» / «Lucía actualizó…»).
 * `actor` es 'Tú' cuando la entrada la hizo el usuario actual.
 */
export function describeAuditEntry(entry: AuditEntryDto, actor: string): string {
  const isYou = actor === 'Tú';
  const verb = (you: string, other: string) => (isYou ? you : other);
  const name = entityName(entry);
  if (entry.entityType === 'Lista') {
    if (entry.changeType === 'DELETE') return `${actor} ${verb('eliminaste', 'eliminó')} la lista`;
    if (entry.changeType === 'CREATE') return `${actor} ${verb('creaste', 'creó')} la lista`;
    return `${actor} ${verb('actualizaste', 'actualizó')} la lista`;
  }
  // Producto
  if (entry.changeType === 'DELETE') return `${actor} ${verb('eliminaste', 'eliminó')} ${name}`;
  if (entry.changeType === 'CREATE') return `${actor} ${verb('añadiste', 'añadió')} ${name}`;
  if (entry.changedFields?.includes('comprado')) {
    return entry.newValue?.['comprado']
      ? `${actor} ${verb('marcaste', 'marcó')} como comprado ${name}`
      : `${actor} ${verb('desmarcaste', 'desmarcó')} ${name}`;
  }
  return `${actor} ${verb('actualizaste', 'actualizó')} ${name}`;
}

/** Resumen «campo: antes → después» de los campos cambiados, o null. */
export function auditChangeSummary(entry: AuditEntryDto): string | null {
  const fields = (entry.changedFields || []).filter((f) => !HIDDEN_FIELDS.has(f));
  if (fields.length === 0) return null;
  return fields
    .map((field) => {
      const label = FIELD_LABELS[field] || field;
      const oldV = entry.oldValue?.[field];
      const newV = entry.newValue?.[field];
      if (oldV === undefined && newV === undefined) return label;
      return `${label}: ${formatAuditValue(oldV)} → ${formatAuditValue(newV)}`;
    })
    .join(' · ');
}

export const CHANGE_BADGE: Record<AuditChangeType, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
};

export const CHANGE_LABEL: Record<AuditChangeType, string> = {
  CREATE: 'Creado',
  UPDATE: 'Actualizado',
  DELETE: 'Eliminado',
};
