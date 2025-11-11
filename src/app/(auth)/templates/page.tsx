'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import styles from './templates.module.css'

export default function TemplatesPage() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  // Plantillas de ejemplo (mock data hasta que se implemente el endpoint de blueprints)
  const templates = [
    {
      id: '1',
      name: 'Compra Semanal',
      description: 'Lista básica para compras semanales del hogar',
      items: 12,
      category: 'Hogar',
      isPublic: true
    },
    {
      id: '2',
      name: 'Fiesta de Cumpleaños',
      description: 'Todo lo necesario para organizar una fiesta',
      items: 15,
      category: 'Eventos',
      isPublic: true
    },
    {
      id: '3',
      name: 'Viaje de Camping',
      description: 'Equipamiento y provisiones para acampada',
      items: 20,
      category: 'Viajes',
      isPublic: true
    },
    {
      id: '4',
      name: 'Cena Romántica',
      description: 'Ingredientes para una cena especial',
      items: 8,
      category: 'Eventos',
      isPublic: true
    },
    {
      id: '5',
      name: 'Barbacoa Familiar',
      description: 'Lista completa para una barbacoa',
      items: 18,
      category: 'Eventos',
      isPublic: false
    },
    {
      id: '6',
      name: 'Despensa Básica',
      description: 'Productos básicos de despensa',
      items: 25,
      category: 'Hogar',
      isPublic: true
    }
  ]

  return (
    <div className={styles.root}>
      <div className={styles.layoutContainer}>
        <div className={styles.mainContent}>
          <div className={styles.sidebarContainer}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarTop}>
                <h1 className={styles.logo}>ListaColab</h1>
                <nav className={styles.navItems}>
                  <Link href="/dashboard" className={styles.navItem}>
                    <div className={styles.navIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z" />
                      </svg>
                    </div>
                    <span className={styles.navLabel}>Panel Principal</span>
                  </Link>
                  <Link href="/templates" className={`${styles.navItem} ${styles.navItemActive}`}>
                    <div className={styles.navIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                      </svg>
                    </div>
                    <span className={styles.navLabel}>Plantillas</span>
                  </Link>
                  <Link href="/profile" className={styles.navItem}>
                    <div className={styles.navIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z" />
                      </svg>
                    </div>
                    <span className={styles.navLabel}>Ajustes</span>
                  </Link>
                </nav>
              </div>
              <div className={styles.sidebarBottom}>
                <button className={styles.navItem} onClick={handleSignOut}>
                  <div className={styles.navIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z" />
                    </svg>
                  </div>
                  <span className={styles.navLabel}>Cerrar Sesión</span>
                </button>
              </div>
            </aside>
          </div>

          <main className={styles.contentArea}>
            <div className={styles.contentHeader}>
              <h2 className={styles.contentTitle}>Plantillas de Listas</h2>
              <p className={styles.contentDescription}>
                Usa plantillas predefinidas para crear listas rápidamente
              </p>
            </div>

            <div className={styles.filtersSection}>
              <div className={styles.searchBox}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  className={styles.searchInput}
                  aria-label="Buscar plantillas"
                />
              </div>
              <div className={styles.filterButtons}>
                <button className={`${styles.filterButton} ${styles.filterButtonActive}`}>Todas</button>
                <button className={styles.filterButton}>Hogar</button>
                <button className={styles.filterButton}>Eventos</button>
                <button className={styles.filterButton}>Viajes</button>
              </div>
            </div>

            <div className={styles.templatesGrid}>
              {templates.map((template) => (
                <div key={template.id} className={styles.templateCard}>
                  <div className={styles.templateHeader}>
                    <div className={styles.templateIcon}>
                      <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                      </svg>
                    </div>
                    <div className={styles.templateBadge}>
                      {template.isPublic ? 'Pública' : 'Privada'}
                    </div>
                  </div>
                  <h3 className={styles.templateName}>{template.name}</h3>
                  <p className={styles.templateDescription}>{template.description}</p>
                  <div className={styles.templateMeta}>
                    <span className={styles.templateItems}>
                      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                        <path d="M224,128a8,8,0,0,1-8,8H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128ZM128,72h88a8,8,0,0,0,0-16H128a8,8,0,0,0,0,16Zm88,112H128a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16ZM82.34,42.34,56,68.69,45.66,58.34A8,8,0,0,0,34.34,69.66l16,16a8,8,0,0,0,11.32,0l32-32A8,8,0,0,0,82.34,42.34Zm0,64L56,132.69,45.66,122.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Zm0,64L56,196.69,45.66,186.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z" />
                      </svg>
                      {template.items} items
                    </span>
                    <span className={styles.templateCategory}>{template.category}</span>
                  </div>
                  <button className={styles.useTemplateButton}>
                    Usar Plantilla
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>
                <svg width="48" height="48" viewBox="0 0 256 256" fill="currentColor" opacity="0.3">
                  <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                </svg>
              </div>
              <p className={styles.emptyStateText}>
                Las plantillas te ayudarán a crear listas rápidamente. <br />
                Los endpoints de blueprints se implementarán próximamente.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
