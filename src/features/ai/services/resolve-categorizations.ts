import type { CategorizedProduct } from '@/types/dtos/ai';
import type { CategoryResponseDto } from '@/types/dtos/categories';
import type { ProductoListDto } from '@/types/dtos/products';

export interface ResolveCategorizationsResult {
  /** productId -> categoryId, listo para aplicar */
  categorizations: Map<string, string>;
  /** Nombres de las categorías creadas porque no existían */
  createdCategories: string[];
  /** Nombres de los productos que no se pudieron aplicar */
  skippedProducts: string[];
}

/**
 * Resuelve cada producto categorizado por la IA a su categoryId.
 *
 * - Busca la categoría por nombre exacto y, si no, sin distinguir
 *   mayúsculas/minúsculas.
 * - Si la categoría sugerida no existe, la crea (las categorías que crea
 *   la IA quedan registradas como tales) y reutiliza la creada si otro
 *   producto pide la misma.
 * - Nunca asigna una categoría distinta a la pedida: un producto sin
 *   sugerencia, con la creación fallida o que no está en la lista se
 *   deja fuera y se recoge en `skippedProducts`.
 */
export async function resolveCategorizations(
  results: CategorizedProduct[],
  products: ProductoListDto[],
  existingCategories: CategoryResponseDto[],
  overrides: Map<string, string>,
  createCategory: (nombre: string) => Promise<CategoryResponseDto>
): Promise<ResolveCategorizationsResult> {
  const categorizations = new Map<string, string>();
  const createdCategories: string[] = [];
  const skippedProducts: string[] = [];
  const knownCategories = [...existingCategories];

  for (const result of results) {
    const product = products.find(p => p.nombre === result.nombre);
    if (!product) {
      skippedProducts.push(result.nombre);
      continue;
    }

    const categoryName =
      overrides.get(product.id) ?? result.suggestedCategory?.nombre;
    if (!categoryName) {
      skippedProducts.push(product.nombre);
      continue;
    }

    let category =
      knownCategories.find(c => c.nombre === categoryName) ??
      knownCategories.find(
        c => c.nombre.toLowerCase() === categoryName.toLowerCase()
      );

    if (!category) {
      try {
        category = await createCategory(categoryName);
        knownCategories.push(category);
        createdCategories.push(categoryName);
      } catch {
        skippedProducts.push(product.nombre);
        continue;
      }
    }

    categorizations.set(product.id, category.id);
  }

  return { categorizations, createdCategories, skippedProducts };
}
