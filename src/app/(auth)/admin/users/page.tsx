'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import styles from './admin-users.module.css';

interface User {
  id: number;
  name: string;
  email: string;
  registrationDate: string;
  status: 'Activo' | 'Inactivo';
}

export default function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - replace with actual API call
  const users: User[] = [
    { id: 1, name: 'Elena Ramirez', email: 'elena.ramirez@example.com', registrationDate: '2023-08-15', status: 'Activo' },
    { id: 2, name: 'Carlos Mendoza', email: 'carlos.mendoza@example.com', registrationDate: '2023-07-22', status: 'Activo' },
    { id: 3, name: 'Sofia Vargas', email: 'sofia.vargas@example.com', registrationDate: '2023-06-10', status: 'Inactivo' },
    { id: 4, name: 'Javier Torres', email: 'javier.torres@example.com', registrationDate: '2023-05-01', status: 'Activo' },
    { id: 5, name: 'Lucia Fernandez', email: 'lucia.fernandez@example.com', registrationDate: '2023-04-18', status: 'Activo' }
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleViewDetails = (userId: number) => {
    alert(`Ver detalles del usuario ${userId} (por implementar)`);
  };

  const handleToggleStatus = (userId: number) => {
    alert(`Cambiar estado del usuario ${userId} (por implementar)`);
  };

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              <div className={styles.sidebarTop}>
                <div className={styles.sidebarHeader}>
                  <h1 className={styles.sidebarTitle}>Administrador</h1>
                  <p className={styles.sidebarSubtitle}>Aplicación de Lista de la Compra</p>
                </div>
                
                <nav>
                  <ul className={styles.navList}>
                    <li>
                      <Link href="/dashboard" className={styles.navItem}>
                        <div className={styles.navIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.10Z" />
                          </svg>
                        </div>
                        <span className={styles.navText}>Panel Principal</span>
                      </Link>
                    </li>
                    
                    <li>
                      <Link href="/admin/users" className={`${styles.navItem} ${styles.active}`}>
                        <div className={styles.navIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M164.47,195.63a8,8,0,0,1-6.7,12.37H10.23a8,8,0,0,1-6.7-12.37,95.83,95.83,0,0,1,47.22-37.71,60,60,0,1,1,66.5,0A95.83,95.83,0,0,1,164.47,195.63Zm87.91-.15a95.87,95.87,0,0,0-47.13-37.56A60,60,0,0,0,144.7,54.59a4,4,0,0,0-1.33,6A75.83,75.83,0,0,1,147,150.53a4,4,0,0,0,1.07,5.53,112.32,112.32,0,0,1,29.85,30.83,23.92,23.92,0,0,1,3.65,16.47,4,4,0,0,0,3.95,4.64h60.3a8,8,0,0,0,7.73-5.93A8.22,8.22,0,0,0,252.38,195.48Z" />
                          </svg>
                        </div>
                        <span className={styles.navText}>Gestión de Usuarios</span>
                      </Link>
                    </li>
                    
                    <li>
                      <Link href="/admin/logs" className={styles.navItem}>
                        <div className={styles.navIcon}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z" />
                          </svg>
                        </div>
                        <span className={styles.navText}>Logs de Auditoría</span>
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
              
              <div className={styles.sidebarBottom}>
                <button 
                  onClick={handleSignOut}
                  className={styles.signOutItem}
                  aria-label="Cerrar sesión"
                >
                  <div className={styles.signOutIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z" />
                    </svg>
                  </div>
                  <span className={styles.signOutText}>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </aside>

          
          {/* Main Content */}
          <main className={styles.mainContent}>
            <header className={styles.header}>
              <h2 className={styles.title}>Gestión de Usuarios</h2>
            </header>
            
            <div className={styles.searchWrapper}>
              <label htmlFor="search-users" className={styles.searchLabel}>
                <div className={styles.searchContainer}>
                  <div className={styles.searchIconWrapper}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
                    </svg>
                  </div>
                  <input
                    id="search-users"
                    type="text"
                    placeholder="Buscar usuarios por nombre o email"
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Buscar usuarios por nombre o email"
                  />
                </div>
              </label>
            </div>
            
            <div className={styles.tableWrapper}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead className={styles.tableHead}>
                    <tr className={styles.tableRow}>
                      <th className={`${styles.tableHeader} ${styles.colName}`}>Nombre</th>
                      <th className={`${styles.tableHeader} ${styles.colEmail}`}>Email</th>
                      <th className={`${styles.tableHeader} ${styles.colDate}`}>Fecha de Registro</th>
                      <th className={`${styles.tableHeader} ${styles.colStatus}`}>Estado</th>
                      <th className={`${styles.tableHeader} ${styles.colDetails}`}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className={styles.tableRow}>
                        <td className={`${styles.tableCell} ${styles.cellName} ${styles.colName}`}>
                          {user.name}
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellEmail} ${styles.colEmail}`}>
                          {user.email}
                        </td>
                        <td className={`${styles.tableCell} ${styles.cellDate} ${styles.colDate}`}>
                          {user.registrationDate}
                        </td>
                        <td className={`${styles.tableCell} ${styles.colStatus}`}>
                          <button 
                            className={styles.statusButton}
                            onClick={() => handleToggleStatus(user.id)}
                            aria-label={`Estado actual: ${user.status}. Click para cambiar`}
                          >
                            <span>{user.status}</span>
                          </button>
                        </td>
                        <td className={`${styles.tableCell} ${styles.colDetails}`}>
                          <button 
                            className={styles.detailsButton}
                            onClick={() => handleViewDetails(user.id)}
                            aria-label={`Ver detalles de ${user.name}`}
                          >
                            Ver Detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
