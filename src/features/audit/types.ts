export type AuditChangeType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditEntryDto {
  id: string;
  entityType: string; // 'Lista' | 'Producto'
  entityId: string;
  changeType: AuditChangeType;
  changedByUserId?: string;
  timestamp: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  changedFields?: string[];
}

export interface AuditHistoryResponse {
  entries: AuditEntryDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditHistoryFilters {
  page?: number;
  pageSize?: number;
  changeType?: AuditChangeType;
  changedByUserId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListCollaboratorDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}
