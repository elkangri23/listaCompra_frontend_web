/**
 * DTOs para funcionalidades de Inteligencia Artificial
 */

// ==================== Categorización Masiva ====================

export interface ProductToCategorize {
  nombre: string;
  descripcion?: string;
}

export interface BulkCategorizeRequestDto {
  products: ProductToCategorize[];
  tiendaId?: string;
  enrichWithExistingCategories?: boolean;
}

export interface SuggestedCategory {
  nombre: string;
  tiendaId?: string;
  confidence: number;
}

export interface CategorizedProduct {
  nombre: string;
  descripcion?: string;
  suggestedCategory: SuggestedCategory;
  alternativeCategories?: SuggestedCategory[];
  source: 'ai' | 'cache' | 'database';
  processingTimeMs: number;
}

export interface BatchStats {
  totalProducts: number;
  successful: number;
  failed: number;
  fromCache: number;
  fromAI: number;
  averageConfidence: number;
  totalProcessingTimeMs: number;
  estimatedTokens?: number;
}

export interface BulkCategorizeResponseDto {
  success: boolean;
  data: {
    categorizedProducts: CategorizedProduct[];
    batchStats: BatchStats;
  };
}

// ==================== Listas por Ocasión ====================

export interface Occasion {
  id: string;
  nombre: string;
  descripcion: string;
  emoji: string;
  ejemplos?: string[];
}

export interface GetOccasionsResponseDto {
  success: boolean;
  data: {
    occasions: Occasion[];
  };
}

export interface GenerateOccasionListRequestDto {
  occasion: string;
  numPersonas?: number;
  contextoAdicional?: string;
  incluirPrecios?: boolean;
}

export interface OccasionProduct {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  unidad?: string;
  categoria?: string;
  prioridadSugerida?: 'alta' | 'media' | 'baja';
  precio?: number;
  notas?: string;
}

export interface GenerateOccasionListResponseDto {
  success: boolean;
  data: {
    list: {
      id: string;
      nombre: string;
      descripcion: string;
    };
    products: OccasionProduct[];
    metadata: {
      occasion: string;
      numPersonas?: number;
      totalProductos: number;
      processingTimeMs: number;
      estimatedTokens?: number;
    };
  };
}

export interface PreviewOccasionListRequestDto {
  occasion: string;
  numPersonas?: number;
  contextoAdicional?: string;
}

export interface PreviewOccasionListResponseDto {
  success: boolean;
  data: {
    preview: {
      nombre: string;
      descripcion: string;
      products: OccasionProduct[];
    };
    metadata: {
      occasion: string;
      numPersonas?: number;
      totalProductos: number;
      processingTimeMs: number;
    };
  };
}

// ==================== Recomendaciones ====================

export interface ContextExample {
  id: string;
  titulo: string;
  descripcion: string;
  ejemplo: string;
}

export interface GetContextExamplesResponseDto {
  success: boolean;
  data: {
    examples: ContextExample[];
  };
}

export interface Recommendation {
  productoNombre: string;
  descripcion?: string;
  categoria?: string;
  razon: string;
  confidence: number;
  prioridad: 'alta' | 'media' | 'baja';
  cantidad?: number;
  unidad?: string;
}

export interface GetRecommendationsRequestDto {
  contexto?: string;
  limit?: number;
}

export interface GetRecommendationsResponseDto {
  success: boolean;
  data: {
    recommendations: Recommendation[];
    metadata: {
      listId: string;
      totalRecommendations: number;
      processingTimeMs: number;
      contextoUtilizado?: string;
    };
  };
}

export interface GetProductRecommendationsResponseDto {
  success: boolean;
  data: {
    product: {
      id: string;
      nombre: string;
    };
    recommendations: Recommendation[];
    metadata: {
      totalRecommendations: number;
      processingTimeMs: number;
    };
  };
}

// ==================== Categorización Simple (existente) ====================

export interface CategorizeProductRequestDto {
  nombre: string;
  descripcion?: string;
  tiendaId?: string;
}

export interface CategorizeProductResponseDto {
  success: boolean;
  data: {
    suggestedCategory: SuggestedCategory;
    alternativeCategories?: SuggestedCategory[];
    source: 'ai' | 'cache' | 'database';
    processingTimeMs: number;
  };
}
