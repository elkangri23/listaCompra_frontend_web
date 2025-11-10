'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import styles from './list-detail.module.css';

interface Product {
  id: string;
  nombre: string;
  cantidad: string;
  checked: boolean;
  categoriaId: string;
}

interface Category {
  id: string;
  nombre: string;
  productos: Product[];
}

export default function ListDetailPage() {
  const params = useParams();
  const listId = params?.id as string;

  // Mock data - replace with actual API calls
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      nombre: 'Frutas y Verduras',
      productos: [
        { id: 'p1', nombre: 'Manzanas', cantidad: '2 kg', checked: false, categoriaId: '1' },
        { id: 'p2', nombre: 'Plátanos', cantidad: '1 kg', checked: false, categoriaId: '1' },
        { id: 'p3', nombre: 'Tomates', cantidad: '500 g', checked: false, categoriaId: '1' },
      ],
    },
    {
      id: '2',
      nombre: 'Lácteos',
      productos: [
        { id: 'p4', nombre: 'Leche', cantidad: '1 L', checked: false, categoriaId: '2' },
        { id: 'p5', nombre: 'Queso', cantidad: '200 g', checked: false, categoriaId: '2' },
        { id: 'p6', nombre: 'Huevos', cantidad: '12 unidades', checked: false, categoriaId: '2' },
      ],
    },
    {
      id: '3',
      nombre: 'Carnes y Pescados',
      productos: [
        { id: 'p7', nombre: 'Pollo', cantidad: '500 g', checked: false, categoriaId: '3' },
        { id: 'p8', nombre: 'Salmón', cantidad: '300 g', checked: false, categoriaId: '3' },
      ],
    },
  ]);

  const [newProduct, setNewProduct] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'details'>('details');

  const handleCheckProduct = (categoryId: string, productId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              productos: category.productos.map((product) =>
                product.id === productId ? { ...product, checked: !product.checked } : product
              ),
            }
          : category
      )
    );
  };

  const handleDeleteProduct = (categoryId: string, productId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              productos: category.productos.filter((product) => product.id !== productId),
            }
          : category
      )
    );
  };

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    // TODO: Implement add product logic
    setNewProduct('');
  };

  const handleShare = () => {
    // TODO: Implement share logic
    alert('Funcionalidad de compartir lista (por implementar)');
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>Lista de la compra familiar</h1>
              <button className={styles.shareButton} onClick={handleShare}>
                <span>Compartir</span>
              </button>
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

            {categories.map((category) => (
              <div key={category.id}>
                <h2 className={styles.categoryTitle}>{category.nombre}</h2>
                {category.productos.map((product) => (
                  <div key={product.id} className={styles.productItem}>
                    <div className={styles.productLeft}>
                      <div className={styles.checkboxWrapper}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={product.checked}
                          onChange={() => handleCheckProduct(category.id, product.id)}
                          aria-label={`Marcar ${product.nombre} como comprado`}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <p className={styles.productName}>{product.nombre}</p>
                        <p className={styles.productQuantity}>{product.cantidad}</p>
                      </div>
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteProduct(category.id, product.id)}
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
