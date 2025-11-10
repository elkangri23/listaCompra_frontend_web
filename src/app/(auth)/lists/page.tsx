'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useLists } from '@/features/lists/hooks/use-lists';
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

  // Mock list images (can be replaced with actual list images from backend)
  const listImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC9ckMvvb93Gr-McL5UIXxE5ZFQ-8e2s76c7KPXvuhgkr41CyBfExF27fAXmtYTBzh8ETG6I5MGKEhBlegJaug7-AvF4gwrEyPTEVFwqtVGAkL1llH4m4RyKREeTv6eF50Wt1_0piFE9SC0TC_cbS5bzC4eh2O4fDKD1x30A0_FOU_SdMYhfnkf7M_5sf4P3M6bC5fyqr-lg-xuPSLnb92TT1M42oKZJRaqmysNHHHRUwQ_pOf-Ggc7kZ-5B6TXiK-A0CskSVsY8V79',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCOZPifk-nvdK_-xrsA2u-kWUOZezroh0YRXuq9xtzv4YRlkrdVNZ5KcYGwJvvQBHR_FDIU0vzCAy9oo56xX8f9RtSyzcZi4d_66ITKvDQDjZ9HbQhlc4cnGz8HEv4skI_pcAqtFVO_V1dTQDUE2D0CZ92TsKLwwZUU-UBkRu6VOWDCVct5UCwYXacU4skwlsELAQ9bIvkpV2epcH6q-0sN57U32AQjbRoTJVE72wgE64Cj5qHRn3_Mc0rvQLWvR80opVmK-bjaoRZS',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCtzE_OZJ0h8fKSf2pYCLufco6eQtjHximqvOCVxzxSfZ-GP-hAbL9iMUEUd_577JZL9maEQk-uZf-acVmL-I1NgKyDEPSL8RECaRFnHhvKWLa5iAyGiA_J04BzUJ3u4TQxq6rVy0axaPJlw71t1OL2SCz03InSCsopHz3va38NRqrIbJIjGOwFpUqsU1Nhzv3mdTmUYMcjwfiR6TpY-7SiA4SMn5IavIZj71CpQTj2PbK3Ykr9p0xVeNTVIvWoHn2AQ4OWaXTgRIuO',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCaO6fCaHIZMFBZwnbuGTbX1W4nnhc3xPA46LUHMnQTz18f5swWMOkivm1XscdScnYcMpepKrrkOgkjyuXrfe5uk44UB143Lmv1g8RKuS-p8B2DNfRaO1Pc3k2iQyszLg2pDHUGGJ8I_j6XeFnY1ipWQJWwQdzwpdU90BfYX4BqFUBNe_MHDzYcplpiTp8FFBiuV6VND6WWnKOLRwTRhkTxvdUkEZ2ja3tToZ8Zfjz7clRi5lGey7itUUv-jE7x0YNy7namHO1MKjlH',
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>ListaColab</h1>
          <nav className={styles.navLinks}>
            <Link href="/lists" className={`${styles.navItem} ${styles.navItemActive}`}>
              <svg className={styles.navIcon} width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
              </svg>
              Panel Principal
            </Link>
            <Link href="/templates" className={styles.navItem}>
              <svg className={styles.navIcon} width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
              </svg>
              Plantillas
            </Link>
            <Link href="/profile" className={styles.navItem}>
              <svg className={styles.navIcon} width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
              </svg>
              Ajustes
            </Link>
          </nav>
        </div>
        <div className={styles.sidebarFooter}>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            <svg className={styles.navIcon} width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
              <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Mis Listas</h1>
          <Link href="/lists/new" className={styles.createButton}>
            Crear Nueva Lista
          </Link>
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
      </main>
    </div>
  );
}