'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className={styles.container}>
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
    </div>
  )
}
