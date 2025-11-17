'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import styles from './list-detail.module.css';
import { useList } from '@/features/lists/hooks/use-lists';
import { useProducts, useCreateProduct, useDeleteProduct, useToggleProductPurchased, useUpdateProduct } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';

export default function ListDetailPage() {
  const params = useParams();
  const listId = params?.id as string;

  const [newProduct, setNewProduct] = useState('');
  const [newCantidad, setNewCantidad] = useState(1);
  const [newUrgente, setNewUrgente] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'details'>('details');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingCantidad, setEditingCantidad] = useState(1);
  const [editingUrgente, setEditingUrgente] = useState(false);

  const { data: listData, isLoading: isLoadingList } = useList(listId);
  const list = (listData as any)?.data || listData;

  // Fetch products for the list
  const { data: productsData } = useProducts(listId, { page: 1, limit: 200 });

  // Fetch categories (use tiendaId from list if available)
  const tiendaId = (listData as any)?.tiendaId;
  const { data: categoriesResp } = useCategories(tiendaId ? { tiendaId } : undefined);

  const createProductMutation = useCreateProduct(listId);
  const deleteProductMutation = useDeleteProduct(listId);
  const togglePurchasedMutation = useToggleProductPurchased(listId);
  const updateProductMutation = useUpdateProduct(listId);

  // Handle nested response structure from backend
  const products = (productsData as any)?.data?.items ?? productsData?.items ?? [];

  const productStats = useMemo(() => {
    const total = products.length;
    const comprados = products.filter((p: any) => p.comprado).length;
    const porcentaje = total > 0 ? Math.round((comprados / total) * 100) : 0;
    const primerSinComprar = products.find((p: any) => !p.comprado);
    return { total, comprados, porcentaje, primerSinComprar };
  }, [products]);

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
    createProductMutation.mutate({
      nombre: newProduct.trim(),
      descripcion: undefined,
      cantidad: newCantidad,
      unidad: undefined,
      precio: undefined,
      urgente: newUrgente,
      categoriaId: undefined,
    });
    setNewProduct('');
    setNewCantidad(1);
    setNewUrgente(false);
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

  const scrollToFirstUnchecked = () => {
    if (productStats.primerSinComprar) {
      const element = document.getElementById(`product-${productStats.primerSinComprar.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Resaltar brevemente el elemento
        element.classList.add(styles.highlight);
        setTimeout(() => {
          element.classList.remove(styles.highlight);
        }, 2000);
      }
    }
  };

  const handleStartEdit = (product: any) => {
    setEditingProductId(product.id);
    setEditingNombre(product.nombre);
    setEditingCantidad(product.cantidad);
    setEditingUrgente(product.urgente || false);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditingNombre('');
    setEditingCantidad(1);
    setEditingUrgente(false);
  };

  const handleSaveEdit = (productId: string) => {
    if (!editingNombre.trim()) return;
    
    updateProductMutation.mutate(
      {
        productId,
        data: {
          nombre: editingNombre.trim(),
          cantidad: editingCantidad,
          urgente: editingUrgente,
          descripcion: undefined,
          unidad: undefined,
          precio: undefined,
          categoriaId: undefined,
        },
      },
      {
        onSuccess: () => {
          handleCancelEdit();
        },
      }
    );
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>{list?.nombre || 'Cargando...'}</h1>
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
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="add-product" className={styles.formLabel}>
                    <span>Nombre del producto</span>
                  </label>
                  <input
                    id="add-product"
                    className={styles.formInput}
                    placeholder="Ej: Leche, Pan, Huevos..."
                    value={newProduct}
                    onChange={(e: any) => setNewProduct(e.target.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddProduct();
                      }
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="add-cantidad" className={styles.formLabel}>
                    <span>Cantidad</span>
                  </label>
                  <input
                    id="add-cantidad"
                    type="number"
                    min="1"
                    className={styles.formInput}
                    value={newCantidad}
                    onChange={(e: any) => setNewCantidad(Number(e.target.value))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="add-urgente" className={styles.checkboxLabel}>
                    <input
                      id="add-urgente"
                      type="checkbox"
                      className={styles.formCheckbox}
                      checked={newUrgente}
                      onChange={(e: any) => setNewUrgente(e.target.checked)}
                    />
                    <span>Urgente</span>
                  </label>
                </div>

                <div className={styles.formActions}>
                  <button
                    className={styles.addButton}
                    onClick={handleAddProduct}
                    disabled={!newProduct.trim() || createProductMutation.isPending}
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <svg className={styles.spinner} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                        </svg>
                        <span>Añadiendo...</span>
                      </>
                    ) : (
                      <span>Añadir Producto</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyStateText}>No hay productos en esta lista. ¡Añade el primero!</p>
              </div>
            ) : (
              Object.entries(grouped).map(([catId, productos]) => (
                <div key={catId}>
                  <h2 className={styles.categoryTitle}>{categoriesMap.get(catId) ?? (catId === '__nocat__' ? 'Sin categoría' : catId)}</h2>
                  {productos.map((product: any) => (
                  <div 
                    key={product.id} 
                    id={`product-${product.id}`}
                    className={`${styles.productItem} ${product.urgente ? styles.urgent : ''} ${product.comprado ? styles.purchased : ''}`}
                  >
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
                      {editingProductId === product.id ? (
                        <div className={styles.editingWrapper}>
                          <input
                            type="number"
                            min="1"
                            className={styles.editCantidadInput}
                            value={editingCantidad}
                            onChange={(e) => setEditingCantidad(Number(e.target.value))}
                          />
                          <input
                            type="text"
                            className={styles.editNombreInput}
                            value={editingNombre}
                            onChange={(e) => setEditingNombre(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(product.id);
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <label className={styles.editUrgenteLabel}>
                            <input
                              type="checkbox"
                              className={styles.editUrgenteCheckbox}
                              checked={editingUrgente}
                              onChange={(e) => setEditingUrgente(e.target.checked)}
                            />
                            <span>Urgente</span>
                          </label>
                          <div className={styles.editActions}>
                            <button
                              className={styles.saveButton}
                              onClick={() => handleSaveEdit(product.id)}
                              disabled={updateProductMutation.isPending}
                            >
                              ✓
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={handleCancelEdit}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.productInfo} onClick={() => handleStartEdit(product)}>
                          <p className={styles.productName}>
                            <span className={styles.productCantidad}>{product.cantidad}</span>
                            {' '}
                            {product.nombre}
                            {product.urgente && (
                              <span className={styles.urgentBadge}>Urgente</span>
                            )}
                          </p>
                        </div>
                      )}
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
              ))
            )}
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
                    <p className={styles.detailLabel}>Nombre</p>
                    <p className={styles.detailValue}>{list?.nombre || '-'}</p>
                  </div>
                  {list?.descripcion && (
                    <div className={styles.detailCard}>
                      <p className={styles.detailLabel}>Descripción</p>
                      <p className={styles.detailValue}>{list.descripcion}</p>
                    </div>
                  )}
                  <div className={styles.detailCard}>
                    <p className={styles.detailLabel}>Fecha de creación</p>
                    <p className={styles.detailValue}>
                      {list?.fechaCreacion 
                        ? new Date(list.fechaCreacion).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : '-'
                      }
                    </p>
                  </div>
                  <div className={styles.detailCard}>
                    <p className={styles.detailLabel}>Estado</p>
                    <p className={styles.detailValue}>{list?.activa ? 'Activa' : 'Inactiva'}</p>
                  </div>
                  <div className={styles.detailCard}>
                    <p className={styles.detailLabel}>Productos</p>
                    <div className={styles.productStats}>
                      <p className={styles.detailValue}>
                        {productStats.total} productos / {productStats.comprados} comprados
                      </p>
                      <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${productStats.porcentaje}%` }}
                          />
                        </div>
                        <span className={styles.progressText}>{productStats.porcentaje}%</span>
                      </div>
                      {productStats.porcentaje < 100 && productStats.primerSinComprar && (
                        <button 
                          className={styles.goToUncheckedButton}
                          onClick={scrollToFirstUnchecked}
                        >
                          <span>🔍 Ver primer producto pendiente</span>
                        </button>
                      )}
                    </div>
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
