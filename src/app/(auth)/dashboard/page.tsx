'use client'

import Link from 'next/link'
import React from 'react'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  return (
    <div className={styles.container}>
            <div className={styles.contentHeader}>
              <h2 className={styles.contentTitle}>Mis Listas</h2>
              <Link href="/lists/create" className={styles.createButton}>
                Crear Nueva Lista
              </Link>
            </div>
            
            <div className={styles.listsGrid}>
              <Link href="/lists/1" className={styles.listCard}>
                <div className={styles.listThumbnail} style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC9ckMvvb93Gr-McL5UIXxE5ZFQ-8e2s76c7KPXvuhgkr41CyBfExF27fAXmtYTBzh8ETG6I5MGKEhBlegJaug7-AvF4gwrEyPTEVFwqtVGAkL1llH4m4RyKREeTv6eF50Wt1_0piFE9SC0TC_cbS5bzC4eh2O4fDKD1x30A0_FOU_SdMYhfnkf7M_5sf4P3M6bC5fyqr-lg-xuPSLnb92TT1M42oKZJRaqmysNHHHRUwQ_pOf-Ggc7kZ-5B6TXiK-A0CskSVsY8V79")' }} />
                <div className={styles.listInfo}>
                  <h3 className={styles.listTitle}>Lista de Compras Semanal</h3>
                  <p className={styles.listProgress}>7/15 items comprados</p>
                </div>
              </Link>
              
              <Link href="/lists/2" className={styles.listCard}>
                <div className={styles.listThumbnail} style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCOZPifk-nvdK_-xrsA2u-kWUOZezroh0YRXuq9xtzv4YRlkrdVNZ5KcYGwJvvQBHR_FDIU0vzCAy9oo56xX8f9RtSyzcZi4d_66ITKvDQDjZ9HbQhlc4cnGz8HEv4skI_pcAqtFVO_V1dTQDUE2D0CZ92TsKLwwZUU-UBkRu6VOWDCVct5UCwYXacU4skWlsELAQ9bIvkpV2epcH6q-0sN57U32AQjbRoTJVE72wgE64Cj5qHRn3_Mc0rvQLWvR80opVmK-bjaoRZS")' }} />
                <div className={styles.listInfo}>
                  <h3 className={styles.listTitle}>Fiesta de Cumpleaños</h3>
                  <p className={styles.listProgress}>3/10 items comprados</p>
                </div>
              </Link>
              
              <Link href="/lists/3" className={styles.listCard}>
                <div className={styles.listThumbnail} style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCtzE_OZJ0h8fKSf2pYCLufco6eQtjHximqvOCVxzxSfZ-GP-hAbL9iMUEUd_577JZL9maEQk-uZf-acVmL-I1NgKyDEPSL8RECaRFnHhvKWLa5iAyGiA_J04BzUJ3u4TQxq6rVy0axaPJlw71t1OL2SCz03InSCsopHz3va38NRqrIbJIjGOwFpUqsU1Nhzv3mdTmUYMcjwfiR6TpY-7SiA4SMn5IavIZj71CpQTj2PbK3Ykr9p0xVeNTVIvWoHn2AQ4OWaXTgRIuO")' }} />
                <div className={styles.listInfo}>
                  <h3 className={styles.listTitle}>Viaje de Campamento</h3>
                  <p className={styles.listProgress}>12/20 items comprados</p>
                </div>
              </Link>
              
              <Link href="/lists/4" className={styles.listCard}>
                <div className={styles.listThumbnail} style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCaO6fCaHIZMFBZwnbuGTbX1W4nnhc3xPA46LUHMnQTz18f5swWMOkivm1XscdScnYcMpepKrrkOgkjyuXrfe5uk44UB143Lmv1g8RKuS-p8B2DNFRaO1Pc3k2iQyszLg2pDHUGGJ8I_j6XeFnY1ipWQJWwQdzwpdU90BfYX4BqFUBNe_MHDzYcplpiTp8FFBiuV6VND6WWnKOLRwTRhkTxvdUkEZ2ja3tToZ8Zfjz7clRi5lGey7itUUv-jE7x0YNy7namHO1MKjlH")' }} />
                <div className={styles.listInfo}>
                  <h3 className={styles.listTitle}>Cena Familiar</h3>
                  <p className={styles.listProgress}>5/8 items comprados</p>
                </div>
              </Link>
            </div>
          </div>
  )
}
