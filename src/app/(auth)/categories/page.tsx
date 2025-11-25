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
import { toast } from 'sonner';

export default function CategoriesPage() {
  const { data: categoriesData, isLoading, error } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const toggleStatus = useToggleCategoryStatus();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryResponseDto | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }
    
    createCategory.mutate(
      { 
        nombre: newCategoryName.trim(),
        descripcion: newCategoryDesc.trim() || undefined
      },
      {
        onSuccess: () => {
          toast.success('Categoría creada exitosamente');
          setNewCategoryName('');
          setNewCategoryDesc('');
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Error al crear la categoría');
        }
      }
    );
  };

  const handleDelete = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría "${nombre}"?`)) {
      deleteCategory.mutate(
        { id },
        {
          onSuccess: () => {
            toast.success('Categoría eliminada exitosamente');
          },
          onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Error al eliminar la categoría');
          }
        }
      );
    }
  };

  const handleToggleStatus = (category: CategoryResponseDto) => {
    toggleStatus.mutate(
      { id: category.id, activa: !category.activa },
      {
        onSuccess: () => {
          toast.success(`Categoría ${category.activa ? 'desactivada' : 'activada'} exitosamente`);
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Error al cambiar el estado');
        }
      }
    );
  };

  const startEdit = (category: CategoryResponseDto) => {
    setEditingCategory(category);
    setEditName(category.nombre);
    setEditDesc(category.descripcion || '');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
    setEditDesc('');
  };

  const handleUpdate = () => {
    if (!editingCategory || !editName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    updateCategory.mutate(
      {
        id: editingCategory.id,
        nombre: editName.trim(),
        descripcion: editDesc.trim() || undefined
      },
      {
        onSuccess: () => {
          toast.success('Categoría actualizada exitosamente');
          cancelEdit();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || 'Error al actualizar la categoría');
        }
      }
    );
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
      <div className={styles.header}>
        <h1 className={styles.title}>Gestionar Categorías</h1>
        <p className={styles.subtitle}>Crea y organiza categorías personalizadas para tus listas de compra</p>
      </div>

      {/* Formulario de creación */}
      <div className={styles.createForm}>
        <h2 className={styles.sectionTitle}>Crear Nueva Categoría</h2>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="new-category-name" className={styles.label}>
              Nombre <span className={styles.required}>*</span>
            </label>
            <input
              id="new-category-name"
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleCreateCategory();
                }
              }}
              placeholder="Ej: Panadería, Lácteos, Limpieza..."
              className={styles.input}
              maxLength={50}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="new-category-desc" className={styles.label}>
              Descripción (opcional)
            </label>
            <input
              id="new-category-desc"
              type="text"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              placeholder="Breve descripción de la categoría"
              className={styles.input}
              maxLength={200}
            />
          </div>
        </div>
        <button 
          onClick={handleCreateCategory} 
          disabled={createCategory.isPending || !newCategoryName.trim()} 
          className={styles.button}
          aria-label="Crear nueva categoría"
        >
          {createCategory.isPending && (
            <svg className={styles.spinner} fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {createCategory.isPending ? 'Creando...' : '+ Crear Categoría'}
        </button>
      </div>

      {/* Lista de categorías */}
      <div className={styles.categorySection}>
        <h2 className={styles.sectionTitle}>
          Mis Categorías ({categoriesData?.categorias?.length || 0})
        </h2>
        
        {!categoriesData?.categorias?.length ? (
          <div className={styles.emptyState}>
            <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className={styles.emptyTitle}>No tienes categorías aún</h3>
            <p className={styles.emptyDescription}>Crea tu primera categoría para organizar mejor tus productos</p>
          </div>
        ) : (
          <ul className={styles.categoryList}>
            {categoriesData?.categorias.map((category) => (
              <li key={category.id} className={styles.categoryItem}>
                {editingCategory?.id === category.id ? (
                  /* Modo edición */
                  <div className={styles.editForm}>
                    <div className={styles.editFormGrid}>
                      <div className={styles.formGroup}>
                        <label htmlFor={`edit-name-${category.id}`} className={styles.label}>Nombre</label>
                        <input
                          id={`edit-name-${category.id}`}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={styles.input}
                          maxLength={50}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label htmlFor={`edit-desc-${category.id}`} className={styles.label}>Descripción</label>
                        <input
                          id={`edit-desc-${category.id}`}
                          type="text"
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          className={styles.input}
                          maxLength={200}
                        />
                      </div>
                    </div>
                    <div className={styles.editActions}>
                      <button 
                        onClick={handleUpdate} 
                        disabled={updateCategory.isPending || !editName.trim()}
                        className={styles.buttonSave}
                      >
                        {updateCategory.isPending ? 'Guardando...' : '✓ Guardar'}
                      </button>
                      <button 
                        onClick={cancelEdit} 
                        className={styles.buttonCancel}
                        disabled={updateCategory.isPending}
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Modo vista */
                  <>
                    <div className={styles.categoryInfo}>
                      <div className={styles.categoryHeader}>
                        <h3 className={styles.categoryName}>{category.nombre}</h3>
                        <span className={`${styles.badge} ${category.activa ? styles.badgeActive : styles.badgeInactive}`}>
                          {category.activa ? '✓ Activa' : '✕ Inactiva'}
                        </span>
                      </div>
                      {category.descripcion && (
                        <p className={styles.categoryDesc}>{category.descripcion}</p>
                      )}
                    </div>
                    <div className={styles.categoryActions}>
                      <button 
                        onClick={() => startEdit(category)} 
                        className={styles.buttonEdit}
                        aria-label={`Editar categoría ${category.nombre}`}
                        title="Editar"
                      >
                        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(category)} 
                        className={styles.buttonToggle}
                        disabled={toggleStatus.isPending}
                        aria-label={`${category.activa ? 'Desactivar' : 'Activar'} categoría ${category.nombre}`}
                      >
                        {category.activa ? 'Desactivar' : 'Activar'}
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id, category.nombre)} 
                        className={styles.buttonDelete}
                        disabled={deleteCategory.isPending}
                        aria-label={`Eliminar categoría ${category.nombre}`}
                        title="Eliminar"
                      >
                        <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
