# 🚀 Guía de Integración Sprint 2 - Funcionalidades IA

Esta guía muestra cómo integrar los nuevos componentes de IA en tu aplicación.

---

## 📦 Componentes Creados

### 1. Categorización Masiva (`BulkCategorizationDialog`)

**Ubicación**: `src/features/ai/components/bulk-categorization-dialog.tsx`

**Uso**:
```tsx
import { BulkCategorizationDialog } from '@/features/ai/components/bulk-categorization-dialog';
import { useUpdateProduct } from '@/features/products/hooks/use-products';

function MyProductsPage() {
  const updateProduct = useUpdateProduct(listId);
  
  const handleApplyCategories = async (categorizations: Map<string, string>) => {
    const promises = Array.from(categorizations.entries()).map(([productId, categoryId]) =>
      updateProduct.mutateAsync({
        productId,
        data: { categoriaId: categoryId },
      })
    );
    await Promise.all(promises);
  };

  return (
    <BulkCategorizationDialog
      listId={listId}
      products={products}
      onApply={handleApplyCategories}
    />
  );
}
```

**Características**:
- ✅ Selección múltiple de productos sin categoría
- ✅ Categorización en lotes de hasta 50 productos
- ✅ Preview de resultados con niveles de confianza
- ✅ Caché automático para productos repetidos
- ✅ Ajuste manual de categorías antes de aplicar

---

### 2. Listas por Ocasión (`OccasionListDialog`)

**Ubicación**: `src/features/ai/components/occasion-list-dialog.tsx`

**Uso**:
```tsx
import { OccasionListDialog } from '@/features/ai/components/occasion-list-dialog';

function MyDashboard() {
  return (
    <div>
      <h1>Mis Listas</h1>
      <OccasionListDialog />
      {/* Genera lista completa automáticamente */}
    </div>
  );
}
```

**Características**:
- ✅ 20+ ocasiones predefinidas (barbacoa, cena romántica, cumpleaños...)
- ✅ Parámetros opcionales: número de personas, contexto adicional
- ✅ Preview antes de crear la lista
- ✅ Creación automática con productos categorizados
- ✅ Redirección automática a la lista creada

---

### 3. Panel de Recomendaciones (`RecommendationsPanel`)

**Ubicación**: `src/features/ai/components/recommendations-panel.tsx`

**Uso**:
```tsx
import { RecommendationsPanel } from '@/features/ai/components/recommendations-panel';
import { useCreateProduct } from '@/features/products/hooks/use-products';

function ListDetailPage({ listId }: { listId: string }) {
  const createProduct = useCreateProduct(listId);
  
  const handleAddProduct = async (recommendation: Recommendation) => {
    await createProduct.mutateAsync({
      nombre: recommendation.productoNombre,
      descripcion: recommendation.descripcion,
      cantidad: recommendation.cantidad || 1,
      unidad: recommendation.unidad,
      categoriaId: undefined, // O buscar por nombre de categoría
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        {/* Lista de productos */}
      </div>
      <div>
        <RecommendationsPanel
          listId={listId}
          onAddProduct={handleAddProduct}
        />
      </div>
    </div>
  );
}
```

**Características**:
- ✅ Recomendaciones personalizadas basadas en productos existentes
- ✅ Contexto adicional opcional ("dieta vegetariana", "cena rápida"...)
- ✅ Niveles de prioridad (alta, media, baja)
- ✅ Auto-refresh cada 10 minutos
- ✅ Añadir productos directamente desde el panel

---

### 4. Vista Kanban (`ProductsKanban`)

**Ubicación**: `src/features/products/components/products-kanban.tsx`

**Uso**:
```tsx
import { ProductsKanban } from '@/features/products/components/products-kanban';
import { useUpdateProduct } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';

function ProductsPage({ listId }: { listId: string }) {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const { data: productsData } = useProducts(listId);
  const { data: categoriesData } = useCategories();
  const updateProduct = useUpdateProduct(listId);

  const handleMoveProduct = async (productId: string, newCategoryId: string | null) => {
    await updateProduct.mutateAsync({
      productId,
      data: { categoriaId: newCategoryId },
    });
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}>
          {viewMode === 'table' ? 'Vista Kanban' : 'Vista Tabla'}
        </Button>
      </div>
      
      {viewMode === 'kanban' ? (
        <ProductsKanban
          products={productsData.items}
          categories={categoriesData.categorias}
          onMoveProduct={handleMoveProduct}
        />
      ) : (
        <ProductsTable products={productsData.items} />
      )}
    </div>
  );
}
```

**Características**:
- ✅ Columnas por categoría (incluyendo "Sin Categoría")
- ✅ Drag & drop HTML5 nativo
- ✅ Visual feedback al arrastrar
- ✅ Solo muestra categorías activas
- ✅ Actualización optimista de la UI

---

## 🎨 Ejemplo de Integración Completa

```tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sparkles, PartyPopper, Lightbulb, LayoutGrid, Table } from 'lucide-react';

// Import all AI components
import { BulkCategorizationDialog } from '@/features/ai/components/bulk-categorization-dialog';
import { OccasionListDialog } from '@/features/ai/components/occasion-list-dialog';
import { RecommendationsPanel } from '@/features/ai/components/recommendations-panel';
import { ProductsKanban } from '@/features/products/components/products-kanban';
import { ProductsTable } from '@/features/products/components/products-table';

export default function EnhancedListPage({ params }: { params: { id: string } }) {
  const listId = params.id;
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // ... hooks setup

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header con acciones IA */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{list?.nombre}</h1>
        <div className="flex items-center gap-2">
          <BulkCategorizationDialog
            listId={listId}
            products={products}
            onApply={handleBulkCategorize}
          />
          <OccasionListDialog />
          <Button
            variant="outline"
            onClick={() => setViewMode(prev => prev === 'table' ? 'kanban' : 'table')}
          >
            {viewMode === 'table' ? <LayoutGrid className="h-4 w-4" /> : <Table className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Área principal de productos */}
        <div className="lg:col-span-3 space-y-4">
          {viewMode === 'kanban' ? (
            <ProductsKanban
              products={products}
              categories={categories}
              onMoveProduct={handleMoveProduct}
            />
          ) : (
            <ProductsTable
              products={products}
              categories={categories}
              onTogglePurchased={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onAdjustQuantity={handleAdjustQuantity}
              onReorder={handleReorder}
            />
          )}
        </div>

        {/* Panel lateral de recomendaciones */}
        <div className="lg:col-span-1">
          <RecommendationsPanel
            listId={listId}
            onAddProduct={handleAddRecommendation}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## 🔗 Servicios y Hooks

Todos los servicios y hooks están listos:

### Servicios (`src/features/ai/services/ai-service.ts`)
- ✅ `bulkCategorize()`
- ✅ `getOccasions()`
- ✅ `generateOccasionList()`
- ✅ `previewOccasionList()`
- ✅ `getRecommendations()`
- ✅ `getProductRecommendations()`

### Hooks (`src/features/ai/hooks/use-ai.ts`)
- ✅ `useBulkCategorize()`
- ✅ `useOccasions()`
- ✅ `useGenerateOccasionList()`
- ✅ `usePreviewOccasionList()`
- ✅ `useRecommendations()`
- ✅ `useProductRecommendations()`

---

## 📝 Tipos TypeScript

Todos los tipos están definidos en `src/types/dtos/ai.ts`:

- `BulkCategorizeRequestDto` / `BulkCategorizeResponseDto`
- `GenerateOccasionListRequestDto` / `GenerateOccasionListResponseDto`
- `PreviewOccasionListRequestDto` / `PreviewOccasionListResponseDto`
- `GetRecommendationsRequestDto` / `GetRecommendationsResponseDto`
- `Occasion`, `OccasionProduct`, `Recommendation`, `CategorizedProduct`

---

## ✅ Checklist de Integración

1. [ ] Añadir `BulkCategorizationDialog` en página de productos
2. [ ] Añadir `OccasionListDialog` en dashboard principal
3. [ ] Añadir `RecommendationsPanel` en vista de detalle de lista
4. [ ] Añadir toggle para vista Kanban en productos
5. [ ] Implementar handlers para aplicar categorías masivas
6. [ ] Implementar handler para añadir productos desde recomendaciones
7. [ ] Implementar handler para mover productos en Kanban
8. [ ] Probar funcionalidades con backend real

---

**Nota**: Todos los componentes siguen los estándares de accesibilidad WCAG 2.2 AA y utilizan los componentes de shadcn/ui para consistencia visual.
