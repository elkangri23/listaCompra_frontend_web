'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LayoutGrid, Table as TableIcon, Sparkles } from 'lucide-react';
import styles from './list-detail.module.css';
import { useList, useUpdateList, useDeleteList } from '@/features/lists/hooks/use-lists';
import { useProducts, useCreateProduct, useDeleteProduct, useToggleProductPurchased, useUpdateProduct } from '@/features/products/hooks/use-products';
import { useCategories } from '@/features/categories/hooks/use-categories';
import { ShareListDialog } from '@/features/invitations/components/share-list-dialog';
import { CollaboratorsSection } from '@/features/invitations/components/collaborators-section';
import { BulkCategorizationDialog } from '@/features/ai/components/bulk-categorization-dialog';
import { ProductsKanban } from '@/features/products/components/products-kanban';
import { RecommendationsPanel } from '@/features/ai/components/recommendations-panel';
import { CreateBlueprintFromListDialog } from '@/features/blueprints/components/create-blueprint-from-list-dialog';
import { CollaborationIndicator } from '@/features/lists/components/collaboration-indicator';
import { useAutoRefresh, useConflictDetection } from '@/features/lists/hooks/use-collaboration';
import { Button } from '@/components/ui/button';
import type { Recommendation } from '@/types/dtos/ai';

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params?.id as string;

  const [newProduct, setNewProduct] = useState('');
  const [newCantidad, setNewCantidad] = useState(1);
  const [newUrgente, setNewUrgente] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'details' | 'collaborators'>('details');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingNombre, setEditingNombre] = useState('');
  const [editingCantidad, setEditingCantidad] = useState(1);
  const [editingUrgente, setEditingUrgente] = useState(false);
  
  // Estados para Sprint 2
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  
  // Estados para editar nombre y descripción de la lista
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [isEditingListDesc, setIsEditingListDesc] = useState(false);
  const [editingListName, setEditingListName] = useState('');
  const [editingListDesc, setEditingListDesc] = useState('');
  
  // Estado para el dialog de compartir
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { data: listData, isLoading: isLoadingList } = useList(listId);
  const list = (listData as any)?.data || listData;

  // Fetch products for the list
  const { data: productsData, isError: isProductsError, error: productsError } = useProducts(listId, { page: 1, limit: 200 });

  // Fetch categories (use tiendaId from list if available)
  const tiendaId = (listData as any)?.tiendaId;
  const { data: categoriesResp } = useCategories(tiendaId ? { tiendaId } : undefined);

  const createProductMutation = useCreateProduct(listId);
  const deleteProductMutation = useDeleteProduct(listId);
  const togglePurchasedMutation = useToggleProductPurchased(listId);
  const updateProductMutation = useUpdateProduct(listId);
  const updateListMutation = useUpdateList();
  const deleteListMutation = useDeleteList();

  // Sprint 4: Colaboración en tiempo real
  // Auto-refresh cada 10 segundos
  useAutoRefresh({
    queryKey: ['lists', listId],
    interval: 10000,
  });

  // Detección de conflictos
  const { handleConflict } = useConflictDetection({
    listId,
    lastModified: list?.fechaActualizacion || '',
    onConflict: () => {
      // Los queries se invalidarán automáticamente por el hook
    },
  });

  // Handle nested response structure from backend - wrapped in useMemo to avoid dependency issues
  const products = useMemo(() => {
    return (productsData as any)?.data?.items ?? productsData?.items ?? [];
  }, [productsData]);

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
      // Si el producto no tiene categoría O la categoría no existe en el mapa, agruparlo como "sin categoría"
      const key = (p.categoriaId && categoriesMap.has(p.categoriaId)) 
        ? p.categoriaId 
        : '__nocat__';
      if (!byCat[key]) byCat[key] = [];
      byCat[key].push(p);
    });
    return byCat;
  }, [products, categoriesMap]);

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
    setShareDialogOpen(true);
  };

  const handleDeleteList = async () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la lista "${list?.nombre}"?\n\n` +
      `Esta acción eliminará:\n` +
      `• La lista y todos sus datos\n` +
      `• ${productStats.total} productos asociados\n` +
      `• Todas las invitaciones y colaboradores\n\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (confirmDelete) {
      try {
        await deleteListMutation.mutateAsync(listId);
        console.log('Lista eliminada correctamente, redirigiendo...');
        // Esperar un momento para que React Query invalide las queries
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/dashboard');
      } catch (error) {
        console.error('Error al eliminar la lista:', error);
        alert('Error al eliminar la lista. Por favor, intenta de nuevo.');
      }
    }
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

  const handleStartEditListName = () => {
    setEditingListName(list?.nombre || '');
    setIsEditingListName(true);
    setIsEditingListDesc(false);
  };

  const handleStartEditListDesc = () => {
    setEditingListDesc(list?.descripcion || '');
    setIsEditingListDesc(true);
    setIsEditingListName(false);
  };

  const handleSaveListName = () => {
    if (!editingListName.trim()) return;
    updateListMutation.mutate(
      {
        id: listId,
        data: { nombre: editingListName.trim() }
      },
      {
        onSuccess: () => {
          setIsEditingListName(false);
        }
      }
    );
  };

  const handleSaveListDesc = () => {
    updateListMutation.mutate(
      {
        id: listId,
        data: { descripcion: editingListDesc.trim() || undefined }
      },
      {
        onSuccess: () => {
          setIsEditingListDesc(false);
        }
      }
    );
  };

  const handleCancelListEdit = () => {
    setIsEditingListName(false);
    setIsEditingListDesc(false);
  };

  // Handlers Sprint 2
  const handleBulkCategorize = async (categorizations: Map<string, string>) => {
    const promises = Array.from(categorizations.entries()).map(([productId, categoryId]) =>
      updateProductMutation.mutateAsync({
        productId,
        data: { categoriaId: categoryId },
      })
    );
    await Promise.all(promises);
    setBulkDialogOpen(false);
  };

  const handleMoveProduct = async (productId: string, newCategoryId: string | null) => {
    await updateProductMutation.mutateAsync({
      productId,
      data: { categoriaId: newCategoryId || undefined },
    });
  };

  const handleAddRecommendation = async (recommendation: Recommendation) => {
    await createProductMutation.mutateAsync({
      nombre: recommendation.productoNombre,
      descripcion: recommendation.descripcion,
      cantidad: recommendation.cantidad || 1,
      unidad: recommendation.unidad,
      precio: undefined,
      urgente: recommendation.prioridad === 'alta',
      categoriaId: undefined,
    });
  };

  // Verificar si la lista está inactiva
  if (!isLoadingList && list && list.activa === false) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.inactiveListContainer}>
            <svg className={styles.inactiveIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={styles.inactiveTitle}>Lista no disponible</h2>
            <p className={styles.inactiveMessage}>
              Esta lista ha sido eliminada o desactivada y ya no está disponible.
            </p>
            <div className={styles.inactiveActions}>
              <Link href="/dashboard" className={styles.backToDashboardButton}>
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar error al cargar productos (bug backend: colaboradores no pueden ver productos)
  if (isProductsError && (productsError as any)?.response?.status === 404) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className={styles.inactiveListContainer}>
            <svg className={styles.inactiveIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color: '#f59e0b'}}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className={styles.inactiveTitle} style={{color: '#f59e0b'}}>Bug del Backend Detectado</h2>
            <p className={styles.inactiveMessage}>
              Eres colaborador de esta lista, pero el backend actualmente no permite que los colaboradores vean productos.
            </p>
            <p className={styles.inactiveMessage} style={{fontSize: '0.875rem', marginTop: '0.5rem'}}>
              <strong>Error técnico:</strong> El endpoint GET /lists/:listId/products solo valida si eres propietario, ignorando la tabla de permisos/colaboradores.
            </p>
            <div style={{marginTop: '1rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'left'}}>
              <p style={{fontWeight: '600', marginBottom: '0.5rem'}}>📋 Detalles para el equipo backend:</p>
              <ul style={{marginLeft: '1.5rem', marginTop: '0.5rem'}}>
                <li>Endpoint afectado: <code style={{backgroundColor: '#fff', padding: '0.125rem 0.25rem', borderRadius: '0.25rem'}}>GET /lists/:listId/products</code></li>
                <li>Lista ID: <code style={{backgroundColor: '#fff', padding: '0.125rem 0.25rem', borderRadius: '0.25rem'}}>{listId}</code></li>
                <li>Ver: <code style={{backgroundColor: '#fff', padding: '0.125rem 0.25rem', borderRadius: '0.25rem'}}>BACKEND_ISSUES.md</code></li>
              </ul>
            </div>
            <div className={styles.inactiveActions}>
              <Link href="/dashboard" className={styles.backToDashboardButton}>
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              {isEditingListName ? (
                <div className={styles.editListNameWrapper}>
                  <input
                    type="text"
                    className={styles.editListNameInput}
                    value={editingListName}
                    onChange={(e) => setEditingListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveListName();
                      } else if (e.key === 'Escape') {
                        handleCancelListEdit();
                      }
                    }}
                    aria-label="Editar nombre de la lista"
                  />
                  <button
                    className={styles.saveListButton}
                    onClick={handleSaveListName}
                    disabled={updateListMutation.isPending || !editingListName.trim()}
                  >
                    ✓
                  </button>
                  <button
                    className={styles.cancelListButton}
                    onClick={handleCancelListEdit}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button 
                  className={styles.title} 
                  onClick={handleStartEditListName}
                  onFocus={(e) => {
                    // Check if the focus is coming from a keyboard interaction
                    if (e.target.matches(':focus-visible')) {
                      handleStartEditListName();
                    }
                  }}
                  type="button"
                  title="Presiona Enter para editar"
                  aria-label="Nombre de la lista, presiona Enter para editar"
                >
                  {list?.nombre || 'Cargando...'}
                </button>
              )}
              
              {/* Sprint 4: Indicador de colaboración en tiempo real */}
              <CollaborationIndicator
                listId={listId}
                onConflictDetected={handleConflict}
              />
              
              <div className={styles.headerActions}>
                <CreateBlueprintFromListDialog
                  listId={listId}
                  listName={list?.nombre || ''}
                  productCount={products.length}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkDialogOpen(true)}
                  disabled={products.filter((p: any) => !p.categoriaId).length === 0}
                  title="Categorizar productos masivamente con IA"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Categorizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(prev => prev === 'table' ? 'kanban' : 'table')}
                  title={viewMode === 'table' ? 'Vista Kanban' : 'Vista Tabla'}
                >
                  {viewMode === 'table' ? (
                    <LayoutGrid className="h-4 w-4" />
                  ) : (
                    <TableIcon className="h-4 w-4" />
                  )}
                </Button>
                <Link href={`/lists/${listId}/history`} className={styles.historyButton}>
                  <span>Ver Historial</span>
                </Link>
                <button className={styles.shareButton} onClick={handleShare}>
                  <span>Compartir</span>
                </button>
                <button 
                  className={styles.deleteListButton} 
                  onClick={handleDeleteList}
                  disabled={deleteListMutation.isPending}
                  title="Eliminar lista"
                >
                  <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                  {deleteListMutation.isPending ? 'Eliminando...' : 'Eliminar'}
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
            ) : viewMode === 'kanban' ? (
              <ProductsKanban
                products={products}
                categories={categoriesResp?.categorias || []}
                onMoveProduct={handleMoveProduct}
              />
            ) : (
              Object.entries(grouped).map(([catId, productos]) => (
                <div key={catId}>
                  <h2 className={styles.categoryTitle}>
                    {catId === '__nocat__' ? 'Sin categoría' : categoriesMap.get(catId)}
                  </h2>
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
                            aria-label="Editar nombre del producto"
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
                        <button 
                          className={styles.productInfo} 
                          onClick={() => handleStartEdit(product)}
                          type="button"
                          aria-label={`Editar producto ${product.nombre}`}
                        >
                          <p className={styles.productName}>
                            <span className={styles.productCantidad}>{product.cantidad}</span>
                            {' '}
                            {product.nombre}
                            {product.urgente && (
                              <span className={styles.urgentBadge}>Urgente</span>
                            )}
                          </p>
                        </button>
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
                  <p className={styles.tabText}>Sugerencias</p>
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'details' ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab('details')}
                >
                  <p className={styles.tabText}>Detalles</p>
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'collaborators' ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab('collaborators')}
                >
                  <p className={styles.tabText}>Colaboradores</p>
                </button>
              </div>
            </div>

            <div className={styles.detailsContent}>
              {activeTab === 'details' ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                    {isEditingListDesc ? (
                      <div className={styles.editDescWrapper}>
                        <textarea
                          className={styles.editDescTextarea}
                          value={editingListDesc}
                          onChange={(e) => setEditingListDesc(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              handleCancelListEdit();
                            }
                          }}
                          aria-label="Editar descripción de la lista"
                          rows={4}
                        />
                        <div className={styles.editDescActions}>
                          <button
                            className={styles.cancelListButton}
                            onClick={handleCancelListEdit}
                          >
                            Cancelar
                          </button>
                          <button
                            className={styles.saveListButton}
                            onClick={handleSaveListDesc}
                            disabled={updateListMutation.isPending}
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="mt-1 text-sm text-gray-900 cursor-pointer"
                        onClick={handleStartEditListDesc}
                        onFocus={(e) => {
                          // Check if the focus is coming from a keyboard interaction
                          if (e.target.matches(':focus-visible')) {
                            handleStartEditListDesc();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleStartEditListDesc()}}
                      >
                        <p className="whitespace-pre-wrap">{list?.descripcion || <span className="text-gray-500">Sin descripción, haz click para añadir una.</span>}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Fecha de creación</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {list?.createdAt ? new Date(list.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Estadísticas</h4>
                    <ul className="mt-2 space-y-2">
                      <li className="flex justify-between text-sm">
                        <span>Total de productos:</span>
                        <span>{productStats.total}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Comprados:</span>
                        <span>{productStats.comprados}</span>
                      </li>
                      <li className="flex justify-between text-sm">
                        <span>Pendientes:</span>
                        <span>{productStats.total - productStats.comprados}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : activeTab === 'collaborators' ? (
                <CollaboratorsSection listId={listId} ownerId={list?.propietarioId} />
              ) : (
                <RecommendationsPanel
                  listId={listId}
                  onAddProduct={handleAddRecommendation}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
    
    {/* Dialogs fuera del contenedor principal para evitar conflictos de z-index y CSS */}
    <ShareListDialog
      listId={listId}
      listName={list?.nombre}
      open={shareDialogOpen}
      onOpenChange={setShareDialogOpen}
    />
    
    <BulkCategorizationDialog
      listId={listId}
      products={products.filter((p: any) => !p.categoriaId)}
      onApply={handleBulkCategorize}
      open={bulkDialogOpen}
      onOpenChange={setBulkDialogOpen}
    />
  </>
  );
}
