'use client';

import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
} from '@/features/categories/hooks/use-categories';
import styles from './categories.module.css';
import type { CategoryResponseDto } from '@/types/dtos/categories';

export default function CategoriesPage() {
  const { data: categoriesData, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const toggleStatus = useToggleCategoryStatus();

  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategory.mutate({ nombre: newCategoryName });
    setNewCategoryName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      deleteCategory.mutate({ id });
    }
  };

  const handleToggleStatus = (category: CategoryResponseDto) => {
    toggleStatus.mutate({ id: category.id, activa: !category.activa });
  };
  
  if (isLoading) return (
    <div className={styles.root}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <svg className="animate-spin h-8 w-8 text-[#4387f4]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="sr-only">Cargando categorías...</span>
      </div>
    </div>
  );
  if (error) return (
    <div className={styles.root}>
      <div role="alert" style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px' }}>
        Error al cargar las categorías: {error.message}
      </div>
    </div>
  );

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Gestionar Categorías</h1>

      <div className={styles.createForm}>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Nombre de la nueva categoría"
          className={styles.input}
        />
        <button onClick={handleCreateCategory} disabled={createCategory.isPending} className={styles.button} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {createCategory.isPending && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {createCategory.isPending ? 'Creando categoría...' : 'Crear Categoría'}
        </button>
      </div>

      <ul className={styles.categoryList}>
        {categoriesData?.categorias.map((category) => (
          <li key={category.id} className={styles.categoryItem}>
            <span className={styles.categoryName}>{category.nombre} ({category.activa ? 'Activa' : 'Inactiva'})</span>
            <div className={styles.categoryActions}>
              <button onClick={() => handleToggleStatus(category)} className={styles.button}>
                {category.activa ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => handleDelete(category.id)} className={styles.buttonDelete}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
