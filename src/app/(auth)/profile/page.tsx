'use client'

import { useState } from 'react'
import styles from './profile.module.css'
import { TotpSecuritySection } from '@/features/settings/components/totp-security-section'
import { PasskeyList } from '@/features/settings/components/passkey-list'
import { GdprSection } from '@/features/gdpr/components/gdpr-section'

type Tab = 'perfil' | 'seguridad' | 'preferencias' | 'privacidad'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(false)

  const handleChangePassword = () => {
    // TODO: Implement change password logic
    alert('Funcionalidad de cambiar contraseña (por implementar)')
  }

  const handleSignOutAllDevices = () => {
    // TODO: Implement sign out all devices logic
    alert(
      'Funcionalidad de cerrar sesión en todos los dispositivos (por implementar)',
    )
  }

  return (
    <div className={styles.container}>
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
          <button
            className={`${styles.tab} ${activeTab === 'privacidad' ? styles.tabActive : styles.tabInactive}`}
            onClick={() => setActiveTab('privacidad')}
          >
            <p className={styles.tabText}>Privacidad</p>
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
                placeholder="Tu nombre completo"
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
              <button
                className={styles.actionButton}
                onClick={handleChangePassword}
              >
                <span>Cambiar Contraseña</span>
              </button>
            </div>
          </div>
          <div className={styles.actionCard}>
            <div className={styles.actionCardInner}>
              <div className={styles.actionCardText}>
                <p className={styles.actionCardTitle}>
                  Autenticación en dos pasos (TOTP)
                </p>
                <p className={styles.actionCardDescription}>
                  Añade un segundo factor a tu inicio de sesión con una app
                  autenticadora.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <TotpSecuritySection />
            </div>
          </div>
          <div className={styles.actionCard}>
            <div className={styles.actionCardInner}>
              <div className={styles.actionCardText}>
                <p className={styles.actionCardTitle}>Passkeys</p>
                <p className={styles.actionCardDescription}>
                  Entra sin contraseña con tu huella, Face ID o PIN del
                  dispositivo.
                </p>
              </div>
            </div>
            <div className="p-4 pt-0">
              <PasskeyList />
            </div>
          </div>
          <div className={styles.actionCard}>
            <div className={styles.actionCardInner}>
              <div className={styles.actionCardText}>
                <p className={styles.actionCardTitle}>
                  Cerrar sesión en todos los dispositivos
                </p>
                <p className={styles.actionCardDescription}>
                  Cerrar sesión en todos los dispositivos asociados con tu
                  cuenta.
                </p>
              </div>
              <button
                className={styles.actionButton}
                onClick={handleSignOutAllDevices}
              >
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
              <p className={styles.preferenceTitle}>
                Notificaciones por correo electrónico
              </p>
              <p className={styles.preferenceDescription}>
                Recibe notificaciones por correo electrónico sobre cambios en
                tus listas.
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
      {activeTab === 'privacidad' && (
        <>
          <h3 className={styles.sectionTitle}>Mis datos</h3>
          <GdprSection />
        </>
      )}
    </div>
  )
}
