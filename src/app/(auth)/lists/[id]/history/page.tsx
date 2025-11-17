'use client';

import { useParams, useRouter } from 'next/navigation';
import { useList } from '@/features/lists/hooks/use-lists';
import { useProducts } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import styles from './history.module.css';
import { useMemo } from 'react';

export default function ProductHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { data: listData, isLoading: listLoading } = useList(listId);
  const { data: productsData, isLoading: productsLoading } = useProducts(listId, { page: 1, limit: 200 });
  const { data: categoriesData } = useCategories();

  const list = listData?.data || listData;
  const products = productsData?.data?.items || productsData?.items || [];
  const categories = categoriesData?.data?.categorias || categoriesData?.categorias || [];

  // Filtrar solo productos comprados
  const purchasedProducts = useMemo(() => {
    return products.filter((product: any) => product.comprado);
  }, [products]);

  // Agrupar por categoría
  const productsByCategory = useMemo(() => {
    const grouped = new Map<string, any[]>();
    
    purchasedProducts.forEach((product: any) => {
      const categoryId = product.categoriaId || 'sin-categoria';
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(product);
    });

    return grouped;
  }, [purchasedProducts]);

  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'sin-categoria') return 'Sin categoría';
    const category = categories.find((cat: any) => cat.id === categoryId);
    return category?.nombre || 'Sin categoría';
  };

  const isLoading = listLoading || productsLoading;

  if (isLoading) {
    return (
      <section className={styles.root}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Cargando historial...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={() => router.push(`/lists/${listId}`)}
          aria-label="Volver a la lista"
        >
          <svg className={styles.backIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Historial de Compras</h1>
          <p className={styles.subtitle}>
            Lista: <strong>{list?.nombre || 'Cargando...'}</strong>
          </p>
        </div>
      </header>

      <div className={styles.content}>
        {purchasedProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className={styles.emptyTitle}>No hay productos comprados aún</h2>
            <p className={styles.emptyText}>
              Los productos que marques como comprados aparecerán aquí en el historial.
            </p>
            <button 
              className={styles.emptyButton}
              onClick={() => router.push(`/lists/${listId}`)}
            >
              Ir a la lista
            </button>
          </div>
        ) : (
          <>
            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{purchasedProducts.length}</span>
                <span className={styles.statLabel}>Productos comprados</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{productsByCategory.size}</span>
                <span className={styles.statLabel}>Categorías</span>
              </div>
            </div>

            <div className={styles.categoriesContainer}>
              {Array.from(productsByCategory.entries()).map(([categoryId, items]) => (
                <div key={categoryId} className={styles.categorySection}>
                  <h3 className={styles.categoryTitle}>
                    <svg className={styles.categoryIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {getCategoryName(categoryId)}
                    <span className={styles.categoryCount}>({items.length})</span>
                  </h3>
                  
                  <ul className={styles.productList}>
                    {items.map((product: any) => (
                      <li key={product.id} className={styles.productItem}>
                        <div className={styles.productCheck}>
                          <svg className={styles.checkIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className={styles.productInfo}>
                          <span className={styles.productQuantity}>{product.cantidad}</span>
                          <span className={styles.productName}>{product.nombre}</span>
                          {product.descripcion && (
                            <span className={styles.productDescription}>{product.descripcion}</span>
                          )}
                        </div>
                        {product.precio && (
                          <span className={styles.productPrice}>
                            ${product.precio.toFixed(2)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <button 
          className={styles.actionButton}
          onClick={() => router.push(`/lists/${listId}`)}
        >
          Volver a la lista
        </button>
      </footer>
    </section>
  );
}