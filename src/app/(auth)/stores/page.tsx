'use client';

import { useState } from 'react';
import {
  useStores,
  useCreateStore,
  useDeleteStore,
  useToggleStoreStatus,
} from '@/features/stores/hooks/use-stores';
import styles from './stores.module.css';
import type { StoreResponseDto } from '@/types/dtos/stores';

export default function StoresPage() {
  const { data: storesData, isLoading, error } = useStores();
  const createStore = useCreateStore();
  const deleteStore = useDeleteStore();
  const toggleStatus = useToggleStoreStatus();

  const [newStoreName, setNewStoreName] = useState('');

  const handleCreateStore = () => {
    if (!newStoreName.trim()) return;
    createStore.mutate({ nombre: newStoreName });
    setNewStoreName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta tienda?')) {
      deleteStore.mutate({ id });
    }
  };

  const handleToggleStatus = (store: StoreResponseDto) => {
    toggleStatus.mutate({ id: store.id, activa: !store.activa });
  };

  if (isLoading) return (
    <div className={styles.root}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <svg className="animate-spin h-8 w-8 text-[#4387f4]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="sr-only">Cargando tiendas...</span>
      </div>
    </div>
  );
  if (error) return (
    <div className={styles.root}>
      <div role="alert" style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '8px' }}>
        Error al cargar las tiendas: {error.message}
      </div>
    </div>
  );

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Gestionar Tiendas</h1>

      <div className={styles.createForm}>
        <input
          type="text"
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
          placeholder="Nombre de la nueva tienda"
          className={styles.input}
        />
        <button onClick={handleCreateStore} disabled={createStore.isPending} className={styles.button} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {createStore.isPending && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {createStore.isPending ? 'Creando tienda...' : 'Crear Tienda'}
        </button>
      </div>

      <ul className={styles.storeList}>
        {storesData?.tiendas.map((store) => (
          <li key={store.id} className={styles.storeItem}>
            <span className={styles.storeName}>{store.nombre} ({store.activa ? 'Activa' : 'Inactiva'})</span>
            <div className={styles.storeActions}>
              <button onClick={() => handleToggleStatus(store)} className={styles.button}>
                {store.activa ? 'Desactivar' : 'Activar'}
              </button>
              <button onClick={() => handleDelete(store.id)} className={styles.buttonDelete}>
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
