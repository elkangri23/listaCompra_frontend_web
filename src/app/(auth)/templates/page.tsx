'use client'

import styles from './templates.module.css'

export default function TemplatesPage() {
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
    <div className={styles.container}>
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
    </div>
  )
}
