'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useCreateList } from '@/features/lists/hooks/use-lists'
import styles from './create.module.css'

export default function CreateListPage() {
  const router = useRouter()
  const createListMutation = useCreateList()
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  })
  
  const [errors, setErrors] = useState<{nombre?: string}>({})

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error al escribir
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación simple
    if (!formData.nombre.trim()) {
      setErrors({ nombre: 'El nombre es requerido' })
      return
    }

    createListMutation.mutate(
      { nombre: formData.nombre.trim(), descripcion: formData.descripcion.trim() },
      {
        onSuccess: (data) => {
          // Redirigir al detalle de la lista creada
          router.push(`/lists/${data.id}`)
        },
        onError: (error) => {
          console.error('Error creating list:', error)
          setErrors({ nombre: 'Error al crear la lista. Inténtalo de nuevo.' })
        }
      }
    )
  }

  const handleCancel = () => {
    router.back()
  }

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
                  <Link href="/templates" className={styles.navItem}>
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
              <button onClick={handleCancel} className={styles.backButton} aria-label="Volver">
                <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
                </svg>
                Volver
              </button>
              <h1 className={styles.title}>Crear Nueva Lista</h1>
              <p className={styles.subtitle}>
                Crea una lista de compras para organizar tus productos
              </p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formCard}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombre" className={styles.label}>
                    Nombre de la lista <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Compra semanal, Fiesta de cumpleaños..."
                    className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
                    maxLength={100}
                    aria-invalid={!!errors.nombre}
                    aria-describedby={errors.nombre ? 'nombre-error' : undefined}
                  />
                  {errors.nombre && (
                    <p id="nombre-error" className={styles.errorMessage} role="alert">
                      {errors.nombre}
                    </p>
                  )}
                  <p className={styles.inputHint}>
                    {formData.nombre.length}/100 caracteres
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="descripcion" className={styles.label}>
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Agrega una descripción para tu lista..."
                    className={styles.textarea}
                    rows={4}
                    maxLength={500}
                  />
                  <p className={styles.inputHint}>
                    {formData.descripcion.length}/500 caracteres
                  </p>
                </div>

                <div className={styles.infoBox}>
                  <div className={styles.infoIcon}>
                    <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z" />
                    </svg>
                  </div>
                  <div>
                    <p className={styles.infoTitle}>Consejo</p>
                    <p className={styles.infoText}>
                      Después de crear la lista, podrás agregar productos y compartirla con otras personas.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  disabled={createListMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={createListMutation.isPending || !formData.nombre.trim()}
                >
                  {createListMutation.isPending ? (
                    <>
                      <svg className={styles.spinner} width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                      Creando...
                    </>
                  ) : (
                    'Crear Lista'
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
}
