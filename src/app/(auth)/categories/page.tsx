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
  
  if (isLoading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error al cargar las categorías: {error.message}</div>;

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
        <button onClick={handleCreateCategory} disabled={createCategory.isPending} className={styles.button}>
          {createCategory.isPending ? 'Creando...' : 'Crear Categoría'}
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
