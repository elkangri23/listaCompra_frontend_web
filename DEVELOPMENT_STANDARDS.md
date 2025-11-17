# 📋 Guía de Desarrollo - Estándares Obligatorios

## ⚠️ CONTEXTO PERMANENTE

**Estas reglas son obligatorias para TODO el código generado en este proyecto.**  
No son sugerencias, son requisitos mínimos de calidad.

---

## 1. Accesibilidad (A11y) - WCAG 2.2 AA

### ✅ HTML Semántico
```tsx
// ❌ MAL
<div onClick={handleClick}>Guardar</div>

// ✅ BIEN
<button onClick={handleClick}>Guardar cambios</button>
```

### ✅ Navegación por Teclado
```tsx
// ✅ Todos los elementos interactivos deben ser focables
<button onKeyDown={handleKeyDown}>Acción</button>
<a href="/ruta" onKeyDown={handleKeyDown}>Enlace</a>
```

### ✅ Estados de Focus Visibles
```css
/* ✅ Siempre incluir estilos de focus */
.button:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.button:focus-visible {
  box-shadow: 0 0 0 3px rgba(25, 128, 230, 0.3);
}
```

### ✅ Alt Text y Descripciones
```tsx
// ✅ Imágenes con alt descriptivo
<img src="/producto.jpg" alt="Manzanas Fuji rojas en cesta" />

// ✅ Iconos decorativos con aria-hidden
<svg aria-hidden="true" focusable="false">...</svg>

// ✅ Iconos funcionales con aria-label
<button aria-label="Eliminar producto">
  <TrashIcon />
</button>
```

### ✅ Contenido Dinámico
```tsx
// ✅ Notificaciones en tiempo real
<div role="status" aria-live="polite">
  {message}
</div>

// ✅ Alertas importantes
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

---

## 2. Feedback al Usuario

### ✅ Estados de Carga
```tsx
// ✅ SIEMPRE mostrar loading state
{isLoading && (
  <div className={styles.loadingContainer}>
    <div className={styles.spinner} role="status" aria-label="Cargando"></div>
    <p>Cargando productos...</p>
  </div>
)}

// ✅ Skeleton loaders para mejor UX
{isLoading && (
  <div className={styles.skeleton}>
    <div className={styles.skeletonLine}></div>
    <div className={styles.skeletonLine}></div>
  </div>
)}
```

### ✅ Estados de Error
```tsx
// ✅ Mensajes de error claros y accionables
{isError && (
  <div className={styles.errorBanner} role="alert">
    <svg className={styles.errorIcon} aria-hidden="true">...</svg>
    <span>
      No se pudieron cargar los productos. 
      <button onClick={retry}>Intentar de nuevo</button>
    </span>
  </div>
)}
```

### ✅ Estados de Éxito
```tsx
// ✅ Confirmación de acciones
{isSuccess && (
  <div className={styles.successBanner} role="status">
    <svg className={styles.successIcon} aria-hidden="true">...</svg>
    <span>Producto añadido correctamente</span>
  </div>
)}
```

### ✅ Estados Vacíos
```tsx
// ✅ Empty states con CTA
{items.length === 0 && !isLoading && (
  <div className={styles.emptyState}>
    <svg className={styles.emptyIcon} aria-hidden="true">...</svg>
    <h3>No tienes productos aún</h3>
    <p>Añade tu primer producto para comenzar</p>
    <button onClick={openAddModal}>Añadir producto</button>
  </div>
)}
```

---

## 3. Microcopy Obligatoria

### ❌ MAL - Textos Genéricos
```tsx
<button>Aceptar</button>
<button>Confirmar</button>
<button>OK</button>
<button>Enviar</button>
```

### ✅ BIEN - Textos Orientados a la Acción
```tsx
<button>Guardar cambios</button>
<button>Eliminar producto</button>
<button>Añadir a la lista</button>
<button>Iniciar sesión</button>
<button>Crear lista nueva</button>
```

### ✅ Mensajes de Error Comprensibles
```tsx
// ❌ MAL - Error técnico
"Error 409: Conflict"

// ✅ BIEN - Mensaje comprensible
"Ya existe una lista con ese nombre. Por favor, elige otro nombre."

// ❌ MAL - Sin contexto
"Error al guardar"

// ✅ BIEN - Con contexto y solución
"No se pudo guardar el producto. Verifica tu conexión e intenta nuevamente."
```

### ✅ Labels Descriptivos
```tsx
// ✅ Labels claros en inputs
<label htmlFor="nombre">
  Nombre del producto <span className={styles.required}>*</span>
</label>
<input 
  id="nombre" 
  placeholder="Ej: Leche desnatada 1L"
  aria-required="true"
/>

// ✅ Helper text útil
<p className={styles.helperText}>
  Sé específico para facilitar la búsqueda después
</p>
```

---

## 4. Loaders y Skeletons

### ✅ Spinner CSS Animado
```css
.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(25, 128, 230, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### ✅ Skeleton Loader
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## 5. Checklist de Calidad

### ✅ Antes de Crear un Componente
- [ ] ¿Usa HTML semántico?
- [ ] ¿Es accesible por teclado?
- [ ] ¿Tiene estados de focus visibles?
- [ ] ¿Incluye loaders para acciones asíncronas?
- [ ] ¿Maneja estados de error con mensajes claros?
- [ ] ¿Tiene estados vacíos con CTA?
- [ ] ¿Los botones tienen textos descriptivos?
- [ ] ¿Los inputs tienen labels y placeholders útiles?
- [ ] ¿Las imágenes tienen alt text?
- [ ] ¿Cumple con WCAG 2.2 AA?

### ✅ Antes de un Commit
- [ ] No hay errores de ESLint
- [ ] No hay errores de TypeScript
- [ ] Todos los componentes son accesibles
- [ ] Todas las acciones tienen feedback visual
- [ ] Los textos son claros y orientados a la acción
- [ ] El código está documentado
- [ ] Los nombres son autoexplicativos

---

## 6. Ejemplos Completos

### ✅ Formulario Completo Accesible
```tsx
export function CreateProductForm({ onSuccess, onCancel }: Props) {
  const [formData, setFormData] = useState({ nombre: '', cantidad: 1 })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = useCreateProduct()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setApiError(null)
    
    // Validación
    if (!formData.nombre.trim()) {
      setErrors({ nombre: 'El nombre es obligatorio' })
      return
    }

    try {
      await mutation.mutateAsync(formData)
      onSuccess()
    } catch (error: any) {
      setApiError(
        error?.response?.status === 409
          ? 'Ya existe un producto con ese nombre en la lista'
          : 'No se pudo añadir el producto. Intenta nuevamente.'
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className={styles.formGroup}>
        <label htmlFor="nombre" className={styles.label}>
          Nombre del producto <span className={styles.required}>*</span>
        </label>
        <input
          id="nombre"
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Leche desnatada 1L"
          className={errors.nombre ? styles.inputError : styles.input}
          aria-required="true"
          aria-invalid={errors.nombre ? 'true' : 'false'}
          aria-describedby={errors.nombre ? 'nombre-error' : undefined}
        />
        {errors.nombre && (
          <p id="nombre-error" className={styles.errorMessage} role="alert">
            {errors.nombre}
          </p>
        )}
      </div>

      {apiError && (
        <div className={styles.errorBanner} role="alert">
          <svg className={styles.errorIcon} aria-hidden="true">...</svg>
          <span>{apiError}</span>
        </div>
      )}

      <div className={styles.formActions}>
        <button 
          type="button" 
          onClick={onCancel}
          className={styles.buttonSecondary}
          disabled={mutation.isPending}
        >
          Cancelar
        </button>
        <button 
          type="submit"
          className={styles.buttonPrimary}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <span className={styles.spinner} role="status" aria-label="Añadiendo producto"></span>
              Añadiendo...
            </>
          ) : (
            'Añadir producto'
          )}
        </button>
      </div>
    </form>
  )
}
```

---

## 📌 Resumen

**Estas reglas NO son opcionales.**  
Son estándares mínimos que garantizan:
- ✅ Accesibilidad universal
- ✅ Mejor experiencia de usuario
- ✅ Código mantenible y escalable
- ✅ Profesionalismo y calidad

**Si una propuesta incumple estas reglas, debe ser corregida automáticamente.**
