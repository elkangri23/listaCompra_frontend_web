'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import styles from './profile.module.css';

type Tab = 'perfil' | 'seguridad' | 'preferencias';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleChangePassword = () => {
    // TODO: Implement change password logic
    alert('Funcionalidad de cambiar contraseña (por implementar)');
  };

  const handleSignOutAllDevices = () => {
    // TODO: Implement sign out all devices logic
    alert('Funcionalidad de cerrar sesión en todos los dispositivos (por implementar)');
  };

  return (
    <div className={styles.root}>
      <div className={styles.layoutContainer}>
        <div className={styles.mainContent}>
          {/* Sidebar */}
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
                <Link href="/templates" className={styles.navItem}>
                  <div className={styles.navIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z" />
                    </svg>
                  </div>
                  <span className={styles.navLabel}>Plantillas</span>
                </Link>
                <Link href="/profile" className={`${styles.navItem} ${styles.navItemActive}`}>
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

          {/* Content Area */}
          <main className={styles.contentArea}>
            <div className={styles.header}>
              <h1 className={styles.title}>Ajustes</h1>
            </div>

            <div className={styles.tabs}>
              <div className={styles.tabsContainer}>
                <button
                  className={`${styles.tab} ${activeTab === 'perfil' ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab('perfil')}
                >
                  <p className={styles.tabText}>Perfil</p>
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'seguridad' ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab('seguridad')}
                >
                  <p className={styles.tabText}>Seguridad</p>
                </button>
                <button
                  className={`${styles.tab} ${activeTab === 'preferencias' ? styles.tabActive : styles.tabInactive}`}
                  onClick={() => setActiveTab('preferencias')}
                >
                  <p className={styles.tabText}>Preferencias</p>
                </button>
              </div>
            </div>

            {activeTab === 'perfil' && (
              <>
                <h3 className={styles.sectionTitle}>Perfil</h3>
                <div className={styles.fieldWrapper}>
                  <label htmlFor="fullName" className={styles.fieldLabel}>
                    <p className={styles.labelText}>Nombre Completo</p>
                    <input
                      id="fullName"
                      className={styles.input}
                      value={fullName}
                      onChange={(e: any) => setFullName(e.target.value)}
                      placeholder="Ingresa tu nombre completo"
                    />
                  </label>
                </div>
                <div className={styles.fieldWrapper}>
                  <label htmlFor="email" className={styles.fieldLabel}>
                    <p className={styles.labelText}>Email</p>
                    <input
                      id="email"
                      type="email"
                      className={styles.input}
                      value={email}
                      onChange={(e: any) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </label>
                </div>
              </>
            )}

            {activeTab === 'seguridad' && (
              <>
                <h3 className={styles.sectionTitle}>Seguridad</h3>
                <div className={styles.actionCard}>
                  <div className={styles.actionCardInner}>
                    <div className={styles.actionCardText}>
                      <p className={styles.actionCardTitle}>Cambiar Contraseña</p>
                      <p className={styles.actionCardDescription}>
                        Actualiza tu contraseña para mantener tu cuenta segura.
                      </p>
                    </div>
                    <button className={styles.actionButton} onClick={handleChangePassword}>
                      <span>Cambiar Contraseña</span>
                    </button>
                  </div>
                </div>
                <div className={styles.actionCard}>
                  <div className={styles.actionCardInner}>
                    <div className={styles.actionCardText}>
                      <p className={styles.actionCardTitle}>Cerrar sesión en todos los dispositivos</p>
                      <p className={styles.actionCardDescription}>
                        Cerrar sesión en todos los dispositivos asociados con tu cuenta.
                      </p>
                    </div>
                    <button className={styles.actionButton} onClick={handleSignOutAllDevices}>
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'preferencias' && (
              <>
                <h3 className={styles.sectionTitle}>Preferencias</h3>
                <div className={styles.preferenceItem}>
                  <div className={styles.preferenceText}>
                    <p className={styles.preferenceTitle}>Notificaciones por correo electrónico</p>
                    <p className={styles.preferenceDescription}>
                      Recibe notificaciones por correo electrónico sobre cambios en tus listas.
                    </p>
                  </div>
                  <div className={styles.toggleWrapper}>
                    <button
                      className={`${styles.toggle} ${emailNotifications ? styles.checked : ''}`}
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      aria-label="Activar notificaciones por correo electrónico"
                    >
                      <div className={styles.toggleThumb}></div>
                      <input
                        type="checkbox"
                        className={styles.toggleInput}
                        checked={emailNotifications}
                        readOnly
                      />
                    </button>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
