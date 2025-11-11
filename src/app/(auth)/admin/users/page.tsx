'use client';

import { useState } from 'react';
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

  const handleViewDetails = (userId: number) => {
    alert(`Ver detalles del usuario ${userId} (por implementar)`);
  };

  const handleToggleStatus = (userId: number) => {
    alert(`Cambiar estado del usuario ${userId} (por implementar)`);
  };

  return (
    <div className={styles.container}>
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
    </div>
  );
}
