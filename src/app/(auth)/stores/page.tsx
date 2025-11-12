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

  if (isLoading) return <div>Cargando tiendas...</div>;
  if (error) return <div>Error al cargar las tiendas: {error.message}</div>;

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
        <button onClick={handleCreateStore} disabled={createStore.isPending} className={styles.button}>
          {createStore.isPending ? 'Creando...' : 'Crear Tienda'}
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
