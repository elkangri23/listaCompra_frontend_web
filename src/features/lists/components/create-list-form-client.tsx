'use client'

import { useState } from 'react'
import { useCreateList } from '@/features/lists/hooks/use-lists'
import { useStores, useCreateStore } from '@/features/stores/hooks/use-stores'
import { CreateListDto } from '@/types/dtos/lists'
import { StoreResponseDto } from '@/types/dtos/stores'
import styles from './create-list-form-client.module.css'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface CreateListFormClientProps {
  onSuccess?: (listId: string) => void
  onCancel?: () => void
}

export function CreateListFormClient({ onSuccess, onCancel }: CreateListFormClientProps) {
  const [formData, setFormData] = useState<CreateListDto>({
    nombre: '',
    descripcion: '',
    tiendaId: undefined,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof CreateListDto, string>>>({})
  const [apiError, setApiError] = useState<string | null>(null)

  const createListMutation = useCreateList()
  const { data: storesData, isLoading: storesLoading } = useStores({ activas: true })
  const stores = storesData?.tiendas ?? []
  const createStoreMutation = useCreateStore()
  const [isCreateStoreDialogOpen, setIsCreateStoreDialogOpen] = useState(false)
  const [newStoreName, setNewStoreName] = useState('')
  const [storeError, setStoreError] = useState<string | null>(null)
  // La tienda recién creada se añade a las opciones al momento, sin
  // esperar a que se refresque la lista (useCreateStore ya invalida
  // la caché, pero el refetch puede tardar un instante).
  const [createdStore, setCreatedStore] = useState<StoreResponseDto | null>(null)
  const allStores =
    createdStore && !stores.some((s) => s.id === createdStore.id)
      ? [...stores, createdStore]
      : stores

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) return
    setStoreError(null)
    try {
      const store = await createStoreMutation.mutateAsync({
        nombre: newStoreName.trim(),
      })
      setCreatedStore(store)
      setFormData((prev) => ({ ...prev, tiendaId: store.id }))
      setNewStoreName('')
      setIsCreateStoreDialogOpen(false)
    } catch {
      setStoreError('No se pudo crear la tienda. Inténtalo nuevamente.')
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateListDto, string>> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la lista es obligatorio'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres'
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres'
    }

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!validateForm()) {
      return
    }

    try {
      const result = await createListMutation.mutateAsync({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || undefined,
        tiendaId: formData.tiendaId || undefined,
      })

      console.log('Lista creada exitosamente:', result)
      
      // The service now returns the Lista object directly
      if (result && result.id) {
        console.log('Redirigiendo a lista con ID:', result.id)
        onSuccess?.(result.id)
      } else {
        console.error('La respuesta no contiene un ID:', result)
        setApiError('Error: La lista se creó pero no se recibió el ID.')
      }
    } catch (error: any) {
      console.error('Error creating list:', error)
      
      // Extract error message from API response
      let errorMessage = 'Error al crear la lista. Por favor, intenta nuevamente.'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }

      // Check for specific error codes
      if (error?.response?.status === 409) {
        errorMessage = 'Ya existe una lista con ese nombre. Por favor, elige otro nombre.'
      } else if (error?.response?.status === 429) {
        errorMessage = 'Has alcanzado el límite de listas. Elimina algunas listas antes de crear nuevas.'
      } else if (error?.response?.status === 404 && error?.response?.data?.message?.includes('Tienda')) {
        errorMessage = 'La tienda seleccionada no existe. Por favor, selecciona otra tienda.'
      }

      setApiError(errorMessage)
    }
  }

  const handleChange = (field: keyof CreateListDto, value: string | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    // Clear API error when user makes changes
    if (apiError) {
      setApiError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      <div className={styles.formGroup}>
        <label htmlFor="nombre" className={styles.label}>
          Nombre de la lista <span className={styles.required}>*</span>
        </label>
        <input
          id="nombre"
          type="text"
          className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
          placeholder="Ej: Compra semanal, Lista del mes, Despensa..."
          value={formData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          autoComplete="off"
          maxLength={100}
          aria-invalid={errors.nombre ? 'true' : 'false'}
          aria-describedby={errors.nombre ? 'nombre-error' : undefined}
        />
        {errors.nombre && (
          <p id="nombre-error" className={styles.errorMessage} role="alert">
            {errors.nombre}
          </p>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="descripcion" className={styles.label}>
          Descripción (opcional)
        </label>
        <textarea
          id="descripcion"
          className={`${styles.textarea} ${errors.descripcion ? styles.inputError : ''}`}
          placeholder="Añade una descripción para tu lista..."
          value={formData.descripcion || ''}
          onChange={(e) => handleChange('descripcion', e.target.value)}
          rows={4}
          maxLength={500}
          aria-invalid={errors.descripcion ? 'true' : 'false'}
          aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
        />
        {errors.descripcion && (
          <p id="descripcion-error" className={styles.errorMessage} role="alert">
            {errors.descripcion}
          </p>
        )}
        <p className={styles.helperText}>
          {formData.descripcion?.length || 0}/500 caracteres
        </p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tiendaId" className={styles.label}>
          Tienda (opcional)
        </label>
        <select
          id="tiendaId"
          className={styles.select}
          value={formData.tiendaId || ''}
          onChange={(e) => handleChange('tiendaId', e.target.value || undefined)}
          disabled={storesLoading}
        >
          <option value="">Sin tienda asignada</option>
          {allStores.map((store: { id: string; nombre: string }) => (
            <option key={store.id} value={store.id}>
              {store.nombre}
            </option>
          ))}
        </select>
        <p className={styles.helperText}>
          Puedes seleccionar una tienda donde planeas comprar los productos
        </p>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setIsCreateStoreDialogOpen(true)}
        >
          + Nueva tienda
        </button>

        <Dialog
          open={isCreateStoreDialogOpen}
          onOpenChange={(open) => {
            setIsCreateStoreDialogOpen(open)
            if (!open) {
              setNewStoreName('')
              setStoreError(null)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Tienda</DialogTitle>
              <DialogDescription>
                Ingresa el nombre de la nueva tienda. Quedará seleccionada
                para esta lista.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="new-store-name" className="text-sm font-medium">
                  Nombre de la tienda
                </label>
                <Input
                  id="new-store-name"
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Ej: Mercadona, Carrefour, Lidl..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreateStore()
                    }
                  }}
                />
              </div>
              {storeError && (
                <p className={styles.errorMessage} role="alert">
                  {storeError}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsCreateStoreDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleCreateStore}
                disabled={createStoreMutation.isPending || !newStoreName.trim()}
              >
                {createStoreMutation.isPending ? 'Creando...' : 'Crear Tienda'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {apiError && (
        <div className={styles.errorBanner} role="alert">
          <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <div className={styles.formActions}>
        {onCancel && (
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={onCancel}
            disabled={createListMutation.isPending}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className={styles.buttonPrimary}
          disabled={createListMutation.isPending}
        >
          {createListMutation.isPending ? (
            <>
              <span className={styles.spinner}></span>
              Creando...
            </>
          ) : (
            'Crear Lista'
          )}
        </button>
      </div>
    </form>
  )
}
