'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import styles from './list-detail.module.css';
import { useList } from '@/features/lists/hooks/use-lists';
import { useProducts, useCreateProduct, useDeleteProduct, useToggleProductPurchased } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';

export default function ListDetailPage() {
  const params = useParams();
  const listId = params?.id as string;

  const [newProduct, setNewProduct] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'details'>('details');

  const { data: listData } = useList(listId);

  // Fetch products for the list
  const { data: productsData } = useProducts(listId, { page: 1, limit: 200 });

  // Fetch categories (use tiendaId from list if available)
  const tiendaId = (listData as any)?.tiendaId;
  const { data: categoriesResp } = useCategories(tiendaId ? { tiendaId } : undefined);

  const createProductMutation = useCreateProduct(listId);
  const deleteProductMutation = useDeleteProduct(listId);
  const togglePurchasedMutation = useToggleProductPurchased(listId);

  const products = productsData?.items ?? [];

  const categoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    if (categoriesResp?.categorias) {
      categoriesResp.categorias.forEach((c: any) => map.set(c.id, c.nombre));
    }
    return map;
  }, [categoriesResp]);

  const grouped = useMemo(() => {
    const byCat: Record<string, any[]> = {};
    products.forEach((p: any) => {
      const key = p.categoriaId || '__nocat__';
      if (!byCat[key]) byCat[key] = [];
      byCat[key].push(p);
    });
    return byCat;
  }, [products]);

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    createProductMutation.mutate({ nombre: newProduct.trim(), cantidad: 1, urgente: false });
    setNewProduct('');
  };

  const handleDeleteProduct = (productoId: string) => {
    deleteProductMutation.mutate(productoId);
  };

  const handleToggle = (productId: string, current: boolean) => {
    togglePurchasedMutation.mutate({ productId, purchased: !current });
  };

  const handleShare = () => {
    // placeholder until share endpoint implemented
    alert('Funcionalidad de compartir lista (por implementar)');
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>Lista de la compra familiar</h1>
              <div className={styles.headerActions}>
                <Link href={`/lists/${listId}/history`} className={styles.historyButton}>
                  <span>Ver Historial</span>
                </Link>
                <button className={styles.shareButton} onClick={handleShare}>
                  <span>Compartir</span>
                </button>
              </div>
            </div>

            <div className={styles.addProductForm}>
              <label htmlFor="add-product" className={styles.inputLabel} aria-label="Añadir producto">
                <input
                  id="add-product"
                  className={styles.addProductInput}
                  placeholder="Añadir Producto"
                  value={newProduct}
                  onChange={(e: any) => setNewProduct(e.target.value)}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      handleAddProduct();
                    }
                  }}
                />
              </label>
            </div>

            {Object.entries(grouped).map(([catId, productos]) => (
              <div key={catId}>
                <h2 className={styles.categoryTitle}>{categoriesMap.get(catId) ?? (catId === '__nocat__' ? 'Sin categoría' : catId)}</h2>
                {productos.map((product: any) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productLeft}>
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={Boolean(product.comprado)}
                          onChange={() => handleToggle(product.id, Boolean(product.comprado))}
                          aria-label={`Marcar ${product.nombre} como comprado`}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <p className={styles.productName}>{product.nombre}</p>
                        <p className={styles.productQuantity}>{product.cantidad}{product.unidad ? ` ${product.unidad}` : ''}</p>
                      </div>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteProduct(product.id)}
                      aria-label={`Eliminar ${product.nombre}`}
                    >
                      <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                        <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.sidebar}>
            <div className={styles.tabs}>
              <div className={styles.tabsContainer}>
                <button
                  className={`${styles.tab} ${
                    activeTab === 'suggestions' ? styles.tabActive : styles.tabInactive
                  }`}
                  onClick={() => setActiveTab('suggestions')}
                >
                  <p className={styles.tabText}>Sugerencias de IA</p>
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab('details')}
                >
                  <p className={styles.tabText}>Detalles</p>
                </button>
              </div>
            </div>

            <div className={styles.detailsContent}>
              {activeTab === 'details' ? (
                <>
                  <div className={styles.detailCard}>
                    <p className={styles.detailLabel}>Fecha</p>
                    <p className={styles.detailValue}>12 de mayo de 2024</p>
                  </div>
                  <div className={styles.detailCard}>
                    <p className={styles.detailLabel}>Tienda</p>
                    <p className={styles.detailValue}>Supermercado Central</p>
                  </div>
                  <div className={styles.detailCard}>
                    <p className={styles.detailLabel}>Colaboradores</p>
                    <p className={styles.detailValue}>Elena, Carlos, Sofía</p>
                  </div>
                </>
              ) : (
                <div className={styles.detailCard}>
                  <p className={styles.detailLabel}>Sugerencias de IA</p>
                  <p className={styles.detailValue}>
                    Función de sugerencias de IA próximamente...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
