'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLists, useCreateList } from '@/features/lists/hooks/use-lists';
import { useDebounce } from '@/hooks/use-debounce';
import styles from './lists.module.css';

export default function ListsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data, isLoading, isError } = useLists(
    debouncedSearchTerm,
    page,
    limit
  );

  const lists = data?.data ?? [];

  const createListMutation = useCreateList();
  const [newListName, setNewListName] = useState('');

  // Mock list images (can be replaced with actual list images from backend)
  const listImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC9ckMvvb93Gr-McL5UIXxE5ZFQ-8e2s76c7KPXvuhgkr41CyBfExF27fAXmtYTBzh8ETG6I5MGKEhBlegJaug7-AvF4gwrEyPTEVFwqtVGAkL1llH4m4RyKREeTv6eF50Wt1_0piFE9SC0TC_cbS5bzC4eh2O4fDKD1x30A0_FOU_SdMYhfnkf7M_5sf4P3M6bC5fyqr-lg-xuPSLnb92TT1M42oKZJRaqmysNHHHRUwQ_pOf-Ggc7kZ-5B6TXiK-A0CskSVsY8V79',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCOZPifk-nvdK_-xrsA2u-kWUOZezroh0YRXuq9xtzv4YRlkrdVNZ5KcYGwJvvQBHR_FDIU0vzCAy9oo56xX8f9RtSyzcZi4d_66ITKvDQDjZ9HbQhlc4cnGz8HEv4skI_pcAqtFVO_V1dTQDUE2D0CZ92TsKLwwZUU-UBkRu6VOWDCVct5UCwYXacU4skwlsELAQ9bIvkpV2epcH6q-0sN57U32AQjbRoTJVE72wgE64Cj5qHRn3_Mc0rvQLWvR80opVmK-bjaoRZS',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCtzE_OZJ0h8fKSf2pYCLufco6eQtjHximqvOCVxzxSfZ-GP-hAbL9iMUEUd_577JZL9maEQk-uZf-acVmL-I1NgKyDEPSL8RECaRFnHhvKWLa5iAyGiA_J04BzUJ3u4TQxq6rVy0axaPJlw71t1OL2SCz03InSCsopHz3va38NRqrIbJIjGOwFpUqsU1Nhzv3mdTmUYMcjwfiR6TpY-7SiA4SMn5IavIZj71CpQTj2PbK3Ykr9p0xVeNTVIvWoHn2AQ4OWaXTgRIuO',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCaO6fCaHIZMFBZwnbuGTbX1W4nnhc3xPA46LUHMnQTz18f5swWMOkivm1XscdScnYcMpepKrrkOgkjyuXrfe5uk44UB143Lmv1g8RKuS-p8B2DNfRaO1Pc3k2iQyszLg2pDHUGGJ8I_j6XeFnY1ipWQJWwQdzwpdU90BfYX4BqFUBNe_MHDzYcplpiTp8FFBiuV6VND6WWnKOLRwTRhkTxvdUkEZ2ja3tToZ8Zfjz7clRi5lGey7itUUv-jE7x0YNy7namHO1MKjlH',
  ];

  return (
    <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mis Listas</h1>
          <div className={styles.createContainer}>
            <input
              aria-label="Nombre de nueva lista"
              placeholder="Nueva lista"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className={styles.createInput}
            />
            <button
              className={styles.createButton}
              onClick={() => {
                if (!newListName.trim()) return;
                createListMutation.mutate({ nombre: newListName.trim() }, {
                  onSuccess: () => {
                    setNewListName('');
                    setPage(1);
                  },
                });
              }}
            >
              Crear
            </button>
            <Link href="/lists/new" className={styles.ghostLink}>
              Crear con plantilla
            </Link>
          </div>
        </header>

        {isLoading && <p style={{ padding: '16px' }}>Cargando...</p>}
        {isError && <p style={{ padding: '16px', color: '#ef4444' }}>Error al cargar las listas.</p>}
        
        {!isLoading && !isError && (
          <div className={styles.grid}>
            {lists.map((list, index) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className={styles.card}
              >
                <div
                  className={styles.cardImage}
                  style={{ backgroundImage: `url(${listImages[index % listImages.length]})` }}
                  role="img"
                  aria-label={`Imagen de ${list.nombre}`}
                />
                <div className={styles.cardContent}>
                  <h2 className={styles.cardTitle}>{list.nombre}</h2>
                  <p className={styles.cardSubtitle}>
                    {/* TODO: Add actual completed items count */}
                    0 items comprados
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && data && (
          <div className={styles.pagination}>
            <button
              className={styles.pageButton}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </button>
            <span className={styles.pageInfo}>
              Página {data.page} de {Math.ceil((data.total || 0) / data.limit || 1)}
            </span>
            <button
              className={styles.pageButton}
              onClick={() => setPage((p) => p + 1)}
              disabled={data.page * data.limit >= data.total}
            >
              Siguiente
            </button>
          </div>
        )}
    </div>
  );
}