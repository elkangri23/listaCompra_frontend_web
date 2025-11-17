# 🔌 Guía de Adaptación Frontend - Share Links API

## 📋 Resumen

El backend **YA TIENE** la funcionalidad de share links implementada, pero usa un formato diferente al especificado inicialmente. Esta guía explica cómo adaptar el frontend para que funcione con la API existente **sin modificar el backend**.

---

## 🎯 Objetivo

Adaptar el código frontend para usar la API real del backend, evitando modificaciones innecesarias en el servidor.

---

## 📍 Endpoints Disponibles en Backend

### 1️⃣ Generar Enlace de Compartir

#### **Endpoint Real:**
```http
POST /api/invitations/:listaId/share
```

#### **Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### **Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| listaId | string (UUID) | ID de la lista a compartir |

#### **Request Body:**
```json
{
  "tipoPermiso": "LECTURA" | "ESCRITURA",
  "duracionHoras": 24  // Opcional, por defecto 24h, máximo 168h (7 días)
}
```

#### **Response Success (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-de-invitacion",
    "hash": "abc123xyz789",
    "tipoPermiso": "LECTURA",
    "expiraEn": "2025-11-24T10:30:00Z",
    "enlaceAcceso": "http://localhost:3333/invitations/abc123xyz789"
  }
}
```

#### **Response Errors:**

**400 Bad Request:**
```json
{
  "message": "tipoPermiso debe ser LECTURA o ESCRITURA"
}
```

**401 Unauthorized:**
```json
{
  "message": "Token de autenticación requerido"
}
```

**403 Forbidden:**
```json
{
  "message": "Sin permisos para compartir esta lista"
}
```

**404 Not Found:**
```json
{
  "message": "Lista no encontrada"
}
```

---

### 2️⃣ Acceder a Invitación por Hash

#### **Endpoint Real:**
```http
GET /api/invitations/:hash/access
```

#### **Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| hash | string | Hash único de la invitación |

#### **Response Success (200 OK):**
```json
{
  "success": true,
  "data": {
    "lista": {
      "id": "uuid-123",
      "nombre": "Mi Lista de Compras",
      "descripcion": "..."
    },
    "permiso": {
      "tipo": "LECTURA",
      "expiraEn": "2025-11-24T10:30:00Z"
    },
    "invitador": {
      "nombre": "Juan Pérez"
    }
  }
}
```

---

## 🔄 Tabla de Mapeo: Spec vs Backend Real

| Campo Spec | Formato Spec | Backend Real | Formato Backend |
|------------|-------------|--------------|-----------------|
| `permissions` | `"read"` \| `"write"` | `tipoPermiso` | `"LECTURA"` \| `"ESCRITURA"` |
| `expiresIn` | `"24h"` \| `"7d"` \| `"30d"` | `duracionHoras` | `24` \| `168` \| `720` (máx 168) |
| `hash` | `string` | `hash` | `string` ✅ |
| `url` | URL completa | `enlaceAcceso` | URL completa ✅ |
| `expiresAt` | ISO timestamp | `expiraEn` | ISO timestamp ✅ |

---

## 💻 Código de Adaptación (TypeScript)

### 📦 Paso 1: Crear el Adapter

Crea el archivo `src/adapters/invitationAdapter.ts`:

```typescript
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
```

---

### 🔌 Paso 2: Implementar el Hook/Service

#### **Opción A: React Hook**

Crea `src/hooks/useShareLink.ts`:

```typescript
import { useState } from 'react';
import { InvitationAdapter, ShareLinkRequestFrontend, ShareLinkResponseFrontend } from '../adapters/invitationAdapter';

interface UseShareLinkReturn {
  generateShareLink: (listId: string, request: ShareLinkRequestFrontend) => Promise<ShareLinkResponseFrontend>;
  loading: boolean;
  error: string | null;
}

export const useShareLink = (): UseShareLinkReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateShareLink = async (
    listId: string,
    request: ShareLinkRequestFrontend
  ): Promise<ShareLinkResponseFrontend> => {
    setLoading(true);
    setError(null);

    try {
      // Convertir request al formato del backend
      const backendRequest = InvitationAdapter.toBackendRequest(request);

      // Llamar al backend
      const response = await fetch(`http://localhost:3333/api/invitations/${listId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // O tu método de auth
        },
        body: JSON.stringify(backendRequest)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al generar enlace');
      }

      const backendResponse = await response.json();

      // Convertir response al formato del frontend
      return InvitationAdapter.fromBackendResponse(backendResponse);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateShareLink, loading, error };
};
```

#### **Opción B: Service con Axios**

Crea `src/services/invitationService.ts`:

```typescript
import axios from 'axios';
import { InvitationAdapter, ShareLinkRequestFrontend, ShareLinkResponseFrontend } from '../adapters/invitationAdapter';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';

class InvitationService {
  /**
   * Genera un enlace para compartir una lista
   */
  async generateShareLink(
    listId: string,
    request: ShareLinkRequestFrontend
  ): Promise<ShareLinkResponseFrontend> {
    try {
      // Convertir al formato del backend
      const backendRequest = InvitationAdapter.toBackendRequest(request);

      // Llamar al endpoint
      const response = await axios.post(
        `${API_BASE_URL}/invitations/${listId}/share`,
        backendRequest
      );

      // Convertir al formato del frontend
      return InvitationAdapter.fromBackendResponse(response.data);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error al generar enlace');
      }
      throw error;
    }
  }

  /**
   * Obtiene información de una invitación por hash
   */
  async getInvitationByHash(hash: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/invitations/${hash}/access`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Invitación no encontrada');
      }
      throw error;
    }
  }
}

export const invitationService = new InvitationService();
```

---

### 🎨 Paso 3: Uso en Componentes

#### **Ejemplo con React Hook:**

```tsx
import React from 'react';
import { useShareLink } from '../hooks/useShareLink';

const ShareListButton: React.FC<{ listId: string }> = ({ listId }) => {
  const { generateShareLink, loading, error } = useShareLink();
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);

  const handleShare = async () => {
    try {
      const result = await generateShareLink(listId, {
        permissions: 'read',      // ✅ Formato frontend
        expiresIn: '7d'           // ✅ Formato frontend
      });

      setShareUrl(result.url);    // ✅ Formato frontend
      console.log('Hash:', result.hash);
      console.log('Expira en:', result.expiresAt);

      // Copiar al portapapeles
      navigator.clipboard.writeText(result.url);
      alert('Enlace copiado al portapapeles!');

    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div>
      <button onClick={handleShare} disabled={loading}>
        {loading ? 'Generando...' : 'Compartir Lista'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {shareUrl && (
        <div>
          <p>Enlace generado:</p>
          <input 
            type="text" 
            value={shareUrl} 
            readOnly 
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default ShareListButton;
```

#### **Ejemplo con Service:**

```tsx
import React, { useState } from 'react';
import { invitationService } from '../services/invitationService';

const ShareModal: React.FC<{ listId: string; onClose: () => void }> = ({ listId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<{
    url: string;
    hash: string;
    expiresAt: string;
  } | null>(null);

  const handleGenerateLink = async (permissions: 'read' | 'write') => {
    setLoading(true);
    try {
      const result = await invitationService.generateShareLink(listId, {
        permissions,
        expiresIn: '7d'
      });

      setShareData(result);

    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al generar enlace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Compartir Lista</h2>
      
      <div>
        <button 
          onClick={() => handleGenerateLink('read')}
          disabled={loading}
        >
          Solo Lectura
        </button>
        
        <button 
          onClick={() => handleGenerateLink('write')}
          disabled={loading}
        >
          Lectura y Escritura
        </button>
      </div>

      {shareData && (
        <div>
          <h3>Enlace generado:</h3>
          <input type="text" value={shareData.url} readOnly />
          <p>Expira el: {new Date(shareData.expiresAt).toLocaleString()}</p>
          <button onClick={() => navigator.clipboard.writeText(shareData.url)}>
            Copiar
          </button>
        </div>
      )}

      <button onClick={onClose}>Cerrar</button>
    </div>
  );
};

export default ShareModal;
```

---

## 🧪 Testing

### Unit Tests para el Adapter

```typescript
import { InvitationAdapter } from '../adapters/invitationAdapter';

describe('InvitationAdapter', () => {
  describe('permissionsToTipoPermiso', () => {
    it('should convert "read" to "LECTURA"', () => {
      expect(InvitationAdapter.permissionsToTipoPermiso('read')).toBe('LECTURA');
    });

    it('should convert "write" to "ESCRITURA"', () => {
      expect(InvitationAdapter.permissionsToTipoPermiso('write')).toBe('ESCRITURA');
    });
  });

  describe('expiresInToHours', () => {
    it('should convert "24h" to 24', () => {
      expect(InvitationAdapter.expiresInToHours('24h')).toBe(24);
    });

    it('should convert "7d" to 168', () => {
      expect(InvitationAdapter.expiresInToHours('7d')).toBe(168);
    });

    it('should default to 24 if no value provided', () => {
      expect(InvitationAdapter.expiresInToHours()).toBe(24);
    });
  });

  describe('toBackendRequest', () => {
    it('should convert frontend request to backend format', () => {
      const frontendRequest = {
        permissions: 'read' as const,
        expiresIn: '7d' as const
      };

      const result = InvitationAdapter.toBackendRequest(frontendRequest);

      expect(result).toEqual({
        tipoPermiso: 'LECTURA',
        duracionHoras: 168
      });
    });
  });

  describe('fromBackendResponse', () => {
    it('should convert backend response to frontend format', () => {
      const backendResponse = {
        success: true,
        data: {
          id: '123',
          hash: 'abc123',
          tipoPermiso: 'LECTURA' as const,
          expiraEn: '2025-11-24T10:30:00Z',
          enlaceAcceso: 'http://localhost:3333/invitations/abc123'
        }
      };

      const result = InvitationAdapter.fromBackendResponse(backendResponse);

      expect(result).toEqual({
        hash: 'abc123',
        url: 'http://localhost:3333/invitations/abc123',
        expiresAt: '2025-11-24T10:30:00Z'
      });
    });
  });
});
```

---

## ⚠️ Consideraciones Importantes

### 1. **Limitación de Duración**

El backend **limita la duración máxima a 168 horas (7 días)**. Si envías `expiresIn: '30d'`, el adapter lo convertirá a 168 horas automáticamente.

### 2. **Formato de Permisos**

- ✅ **Frontend**: `'read'` | `'write'` (minúsculas, inglés)
- ✅ **Backend**: `'LECTURA'` | `'ESCRITURA'` (mayúsculas, español)

El adapter se encarga de la conversión automáticamente.

### 3. **URL Base**

El backend devuelve la URL completa en `enlaceAcceso`. Asegúrate de usar esa URL directamente en lugar de construirla manualmente.

### 4. **Autenticación**

Todos los endpoints requieren el header `Authorization: Bearer <token>`. Asegúrate de incluirlo en todas las peticiones.

---

## 🚀 Resumen de Implementación

### ✅ Checklist

- [ ] Crear `invitationAdapter.ts` con las funciones de conversión
- [ ] Crear hook `useShareLink.ts` o service `invitationService.ts`
- [ ] Actualizar componentes para usar el adapter
- [ ] Probar con diferentes combinaciones de permisos y duraciones
- [ ] Escribir tests unitarios para el adapter
- [ ] Actualizar documentación del frontend

### 📦 Archivos a Crear

```
src/
├── adapters/
│   └── invitationAdapter.ts       ← Conversiones de formato
├── hooks/
│   └── useShareLink.ts             ← React Hook (opción A)
├── services/
│   └── invitationService.ts        ← Service con Axios (opción B)
└── components/
    ├── ShareListButton.tsx         ← Componente de ejemplo
    └── ShareModal.tsx              ← Modal de ejemplo
```

---

## 📞 Soporte

Si encuentras algún problema con la integración:

1. **Verificar que el backend esté corriendo** en `http://localhost:3333`
2. **Verificar token JWT válido** en las peticiones
3. **Revisar respuestas del backend** en DevTools → Network
4. **Consultar logs del backend** para errores específicos

---

## 🎯 Ventajas de Este Enfoque

✅ **No modifica el backend** - Evita riesgos y regresiones  
✅ **Código limpio** - Separación de concerns con adapter pattern  
✅ **Testeable** - Funciones puras fáciles de probar  
✅ **Mantenible** - Cambios futuros solo en el adapter  
✅ **Reusable** - El adapter puede usarse en múltiples componentes  

---

**Estado**: 📋 LISTO PARA IMPLEMENTAR EN FRONTEND  
**Prioridad**: 🔴 ALTA  
**Tiempo estimado**: 2-3 horas  

---

*Última actualización: 17 de noviembre de 2025*
