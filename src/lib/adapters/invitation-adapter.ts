/**
 * Adapter para convertir entre el formato del frontend y el backend
 * para invitaciones/share links
 */

export interface ShareLinkRequestFrontend {
  permissions: 'read' | 'write';
  expiresIn?: '24h' | '7d' | '30d' | 'never';
}

export interface ShareLinkResponseFrontend {
  hash: string;
  url: string;
  expiresAt: string;
}

export interface ShareLinkRequestBackend {
  tipoPermiso: 'LECTURA' | 'ESCRITURA';
  duracionHoras?: number;
}

export interface ShareLinkResponseBackend {
  success: boolean;
  data: {
    id: string;
    hash: string;
    tipoPermiso: 'LECTURA' | 'ESCRITURA';
    expiraEn: string;
    enlaceAcceso: string;
  };
}

export class InvitationAdapter {
  /**
   * Convierte permisos del formato frontend al formato backend
   */
  static permissionsToTipoPermiso(permissions: 'read' | 'write'): 'LECTURA' | 'ESCRITURA' {
    return permissions === 'read' ? 'LECTURA' : 'ESCRITURA';
  }

  /**
   * Convierte tipo de permiso del formato backend al formato frontend
   */
  static tipoPermisoToPermissions(tipoPermiso: 'LECTURA' | 'ESCRITURA'): 'read' | 'write' {
    return tipoPermiso === 'LECTURA' ? 'read' : 'write';
  }

  /**
   * Convierte duración en formato frontend a horas
   */
  static expiresInToHours(expiresIn?: string): number {
    const durationMap: Record<string, number> = {
      '24h': 24,
      '7d': 168,   // 7 días * 24 horas
      '30d': 168,  // Backend limita a 168h máximo (7 días)
      'never': 168 // Usar máximo permitido
    };

    return durationMap[expiresIn || '24h'] || 24;
  }

  /**
   * Convierte horas a formato de duración frontend (aproximado)
   */
  static hoursToExpiresIn(hours: number): '24h' | '7d' | '30d' {
    if (hours <= 24) return '24h';
    if (hours <= 168) return '7d';
    return '30d';
  }

  /**
   * Convierte request del frontend al formato del backend
   */
  static toBackendRequest(frontendRequest: ShareLinkRequestFrontend): ShareLinkRequestBackend {
    return {
      tipoPermiso: this.permissionsToTipoPermiso(frontendRequest.permissions),
      duracionHoras: frontendRequest.expiresIn 
        ? this.expiresInToHours(frontendRequest.expiresIn)
        : undefined
    };
  }

  /**
   * Convierte response del backend al formato del frontend
   */
  static fromBackendResponse(backendResponse: ShareLinkResponseBackend): ShareLinkResponseFrontend {
    return {
      hash: backendResponse.data.hash,
      url: backendResponse.data.enlaceAcceso,
      expiresAt: backendResponse.data.expiraEn
    };
  }
}
