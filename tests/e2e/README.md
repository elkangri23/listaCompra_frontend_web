# Tests E2E con Playwright

## 📋 Descripción

Tests end-to-end para validar flujos completos de usuario en la aplicación listaCompra.

## 🚀 Ejecución

### Ejecutar todos los tests E2E
```bash
npm run test:e2e
```

### Ejecutar en modo UI (interactivo)
```bash
npm run test:e2e:ui
```

### Ejecutar test específico
```bash
npx playwright test auth-flow
```

### Ejecutar en modo debug
```bash
npx playwright test --debug
```

### Ver reporte HTML
```bash
npx playwright show-report
```

## 📁 Estructura

```
tests/e2e/
├── helpers.ts                      # Utilidades compartidas
├── auth-flow.spec.ts              # Tests de autenticación
├── create-list-flow.spec.ts       # Tests de creación de listas
├── share-list-flow.spec.ts        # Tests de compartir listas
└── ai-categorization-flow.spec.ts # Tests de AI y categorización
```

## 🎯 Flujos Testeados

### 1. Autenticación (auth-flow.spec.ts)
- ✅ Login con credenciales válidas
- ✅ Error con credenciales incorrectas
- ✅ Validación de formato de email
- ✅ Registro de nuevo usuario
- ✅ Validación de contraseñas coincidentes
- ✅ Aceptación de términos obligatoria
- ✅ Logout correcto
- ✅ Persistencia de sesión
- ✅ Expiración de sesión
- ✅ CallbackUrl después de login

**Total**: 10 tests

### 2. Creación de Listas (create-list-flow.spec.ts)
- ✅ Crear lista vacía
- ✅ Crear lista y agregar productos
- ✅ Marcar producto como comprado
- ✅ Editar nombre y descripción
- ✅ Eliminar producto
- ✅ Filtrar por categoría
- ✅ Contador de productos
- ✅ Eliminar lista completa
- ✅ Validación de campos obligatorios (lista)
- ✅ Validación de campos obligatorios (producto)
- ✅ Mensaje de lista vacía
- ✅ Navegación entre listas

**Total**: 12 tests

### 3. Compartir Listas (share-list-flow.spec.ts)
- ✅ Compartir por email con LECTURA
- ✅ Compartir con permiso ESCRITURA
- ✅ Generar enlace temporal
- ✅ Copiar enlace al portapapeles
- ✅ Validación de email
- ✅ Lista de colaboradores actuales
- ✅ Aceptar invitación como invitado
- ✅ Rechazar invitación
- ✅ Permisos LECTURA (no puede editar)
- ✅ Permisos ESCRITURA (puede agregar)
- ✅ Revocar acceso
- ✅ Indicador de lista compartida

**Total**: 12 tests

### 4. Categorización AI (ai-categorization-flow.spec.ts)
- ✅ Categorizar producto individual
- ✅ Categorización masiva
- ✅ Generar lista por ocasión
- ✅ Recomendaciones de productos
- ✅ Contexto personalizado
- ✅ Nivel de confianza
- ✅ Cambiar categoría sugerida
- ✅ Historial de productos frecuentes
- ✅ Razón de recomendación
- ✅ Actualización dinámica
- ✅ Manejo de errores AI

**Total**: 11 tests

## 📊 Resumen

- **Total tests E2E**: 45 tests
- **Cobertura**: Flujos críticos de usuario
- **Navegadores**: Chromium (Firefox y WebKit opcionales)
- **Tiempo estimado**: ~5-10 minutos

## 🔧 Configuración

La configuración de Playwright está en `playwright.config.ts`:

- **Base URL**: `http://localhost:3000`
- **Timeout por test**: 30 segundos
- **Reintentos en CI**: 2
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Trace**: En primer reintento

## 🛠️ Utilidades (helpers.ts)

### Funciones de autenticación
```typescript
login(page, email, password)
logout(page)
register(page, email, password, nombre)
```

### Funciones de listas
```typescript
createList(page, nombre, descripcion?)
goToList(page, listId)
```

### Funciones de productos
```typescript
addProduct(page, nombre, options?)
```

### Funciones de compartir
```typescript
shareList(page, email, permission)
```

### Funciones de espera
```typescript
waitForToast(page, message)
waitForPageLoad(page)
```

## 📝 Mejores Prácticas

1. **Selectores estables**: Usar `data-testid` cuando sea posible
2. **Esperas inteligentes**: Usar `waitForSelector` en lugar de `waitForTimeout`
3. **Aislamiento**: Cada test debe ser independiente
4. **Cleanup**: Usar `beforeEach` para estado limpio
5. **Assertions claras**: Mensajes descriptivos en expects

## 🚨 Troubleshooting

### Error: "Browser not found"
```bash
npx playwright install chromium
```

### Error: "Timeout waiting for page"
- Asegúrate de que `npm run dev` esté corriendo
- Aumenta timeout en `playwright.config.ts`

### Error: "Element not found"
- Verifica que el selector sea correcto
- Usa `page.locator().or()` para múltiples opciones
- Aumenta timeout de `waitForSelector`

## 🔄 CI/CD

Para ejecutar en GitHub Actions:

```yaml
- name: Install Playwright
  run: npx playwright install chromium

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
- [Locators Guide](https://playwright.dev/docs/locators)
