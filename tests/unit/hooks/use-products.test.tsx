/**
 * Tests CRÍTICOS (100% coverage) - use-products.ts
 * Hooks de React Query para gestión de productos
 *
 * Patrón: Arrange-Act-Assert
 * Testing Library: @testing-library/react-hooks
 * Mock: productService
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { productService } from '@/features/products/services/product-service'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useToggleProductPurchased,
  useAdjustQuantity,
  useReorderProducts,
  mapProductToFormValues,
} from '@/features/products/hooks/use-products'
import { createTestQueryClient } from '../../utils/test-utils'
import { ReactNode } from 'react'

jest.mock('@/features/products/services/product-service', () => ({
  productService: {
    getProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    togglePurchased: jest.fn(),
    reorderProducts: jest.fn(),
  },
}))

describe('useProducts hooks (CRÍTICO - 100% coverage)', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    jest.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useProducts', () => {
    it('debe obtener productos de una lista', async () => {
      const mockProducts = {
        items: [
          { id: 'p1', nombre: 'Leche', cantidad: 2, comprado: false },
          { id: 'p2', nombre: 'Pan', cantidad: 1, comprado: true },
        ],
        total: 2,
      }

      ;(productService.getProducts as jest.Mock).mockResolvedValue(mockProducts)

      const { result } = renderHook(
        () => useProducts('list-1', { page: 1, limit: 20 }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockProducts)
      expect(productService.getProducts).toHaveBeenCalledWith({
        listaId: 'list-1',
        busqueda: undefined,
        categoriaId: undefined,
        comprado: undefined,
        page: 1,
        limit: 20,
      })
    })

    it('debe aplicar filtros de búsqueda', async () => {
      const mockProducts = {
        items: [{ id: 'p1', nombre: 'Leche desnatada', cantidad: 1 }],
        total: 1,
      }
      ;(productService.getProducts as jest.Mock).mockResolvedValue(mockProducts)

      const { result } = renderHook(
        () => useProducts('list-1', { search: 'leche', page: 1, limit: 20 }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.getProducts).toHaveBeenCalledWith({
        listaId: 'list-1',
        busqueda: 'leche',
        categoriaId: undefined,
        comprado: undefined,
        page: 1,
        limit: 20,
      })
    })

    it('debe filtrar por categoría y estado', async () => {
      const mockProducts = { items: [], total: 0 }
      ;(productService.getProducts as jest.Mock).mockResolvedValue(mockProducts)

      const { result } = renderHook(
        () =>
          useProducts('list-1', {
            categoryId: 'cat-1',
            status: 'purchased',
            page: 1,
            limit: 10,
          }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.getProducts).toHaveBeenCalledWith({
        listaId: 'list-1',
        busqueda: undefined,
        categoriaId: 'cat-1',
        comprado: true,
        page: 1,
        limit: 10,
      })
    })

    it('NO debe hacer fetch si listId está vacío', async () => {
      const { result } = renderHook(
        () => useProducts('', { page: 1, limit: 20 }),
        { wrapper },
      )

      await waitFor(() => expect(result.current.isPending).toBe(true))

      expect(productService.getProducts).not.toHaveBeenCalled()
    })
  })

  describe('useCreateProduct', () => {
    it('debe crear producto correctamente', async () => {
      const newProduct = { id: 'p-new', nombre: 'Yogur', cantidad: 4 }
      const formData = { nombre: 'Yogur', cantidad: 4, urgente: false }

      ;(productService.createProduct as jest.Mock).mockResolvedValue(newProduct)

      const { result } = renderHook(() => useCreateProduct('list-1'), {
        wrapper,
      })

      result.current.mutate(formData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.createProduct).toHaveBeenCalledWith('list-1', {
        nombre: 'Yogur',
        descripcion: undefined,
        cantidad: 4,
        unidad: undefined,
        precio: undefined,
        urgente: false,
        categoriaId: undefined,
      })
    })

    it('debe sanitizar campos vacíos a undefined', async () => {
      const formData = {
        nombre: 'Producto',
        descripcion: '   ',
        cantidad: 1,
        unidad: '',
        urgente: false,
      }

      ;(productService.createProduct as jest.Mock).mockResolvedValue({
        id: 'p1',
      })

      const { result } = renderHook(() => useCreateProduct('list-1'), {
        wrapper,
      })

      result.current.mutate(formData)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.createProduct).toHaveBeenCalledWith(
        'list-1',
        expect.objectContaining({
          descripcion: undefined,
          unidad: undefined,
        }),
      )
    })

    it('debe invalidar cache después de crear', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
      ;(productService.createProduct as jest.Mock).mockResolvedValue({
        id: 'p1',
      })

      const { result } = renderHook(() => useCreateProduct('list-1'), {
        wrapper,
      })

      result.current.mutate({ nombre: 'Test', cantidad: 1, urgente: false })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'products'],
      })
    })
  })

  describe('useUpdateProduct', () => {
    it('debe actualizar producto correctamente', async () => {
      const updated = { id: 'p1', nombre: 'Leche Entera', cantidad: 3 }
      ;(productService.updateProduct as jest.Mock).mockResolvedValue(updated)

      const { result } = renderHook(() => useUpdateProduct('list-1'), {
        wrapper,
      })

      result.current.mutate({
        productId: 'p1',
        data: { nombre: 'Leche Entera', cantidad: 3 },
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.updateProduct).toHaveBeenCalledWith(
        'list-1',
        'p1',
        {
          nombre: 'Leche Entera',
          cantidad: 3,
        },
      )
    })

    it('debe manejar actualización parcial', async () => {
      ;(productService.updateProduct as jest.Mock).mockResolvedValue({
        id: 'p1',
      })

      const { result } = renderHook(() => useUpdateProduct('list-1'), {
        wrapper,
      })

      result.current.mutate({ productId: 'p1', data: { urgente: true } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.updateProduct).toHaveBeenCalledWith(
        'list-1',
        'p1',
        {
          urgente: true,
        },
      )
    })

    it('debe invalidar cache después de actualizar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
      ;(productService.updateProduct as jest.Mock).mockResolvedValue({
        id: 'p1',
      })

      const { result } = renderHook(() => useUpdateProduct('list-1'), {
        wrapper,
      })

      result.current.mutate({ productId: 'p1', data: { cantidad: 5 } })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'products'],
      })
    })
  })

  describe('useDeleteProduct', () => {
    it('debe eliminar producto correctamente', async () => {
      ;(productService.deleteProduct as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteProduct('list-1'), {
        wrapper,
      })

      result.current.mutate('p1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.deleteProduct).toHaveBeenCalledWith('list-1', 'p1')
    })

    it('debe invalidar cache después de eliminar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
      ;(productService.deleteProduct as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDeleteProduct('list-1'), {
        wrapper,
      })

      result.current.mutate('p1')

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'products'],
      })
    })
  })

  describe('useToggleProductPurchased', () => {
    it('debe marcar producto como comprado (optimistic update + API)', async () => {
      ;(productService.togglePurchased as jest.Mock).mockResolvedValue({
        id: 'p1',
        comprado: true,
      })

      const { result } = renderHook(() => useToggleProductPurchased('list-1'), {
        wrapper,
      })

      result.current.mutate({ productId: 'p1', purchased: true })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      // Debe persistir en el backend
      expect(productService.togglePurchased).toHaveBeenCalledWith(
        'list-1',
        'p1',
        {
          comprado: true,
        },
      )
    })

    it('debe manejar rollback en caso de error', async () => {
      const { result } = renderHook(() => useToggleProductPurchased('list-1'), {
        wrapper,
      })

      result.current.mutate({ productId: 'p1', purchased: false })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })
  })

  describe('useAdjustQuantity', () => {
    it('debe ajustar cantidad de producto', async () => {
      ;(productService.updateProduct as jest.Mock).mockResolvedValue({
        id: 'p1',
        cantidad: 10,
      })

      const { result } = renderHook(() => useAdjustQuantity('list-1'), {
        wrapper,
      })

      result.current.mutate({ productId: 'p1', cantidad: 10 })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.updateProduct).toHaveBeenCalledWith(
        'list-1',
        'p1',
        { cantidad: 10 },
      )
    })
  })

  describe('useReorderProducts', () => {
    it('debe reordenar productos correctamente', async () => {
      ;(productService.reorderProducts as jest.Mock).mockResolvedValue({
        success: true,
      })

      const { result } = renderHook(() => useReorderProducts('list-1'), {
        wrapper,
      })

      result.current.mutate(['p3', 'p1', 'p2'])

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(productService.reorderProducts).toHaveBeenCalledWith('list-1', {
        orden: [
          { productoId: 'p3', posicion: 1 },
          { productoId: 'p1', posicion: 2 },
          { productoId: 'p2', posicion: 3 },
        ],
      })
    })

    it('debe invalidar cache después de reordenar', async () => {
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries')
      ;(productService.reorderProducts as jest.Mock).mockResolvedValue({
        success: true,
      })

      const { result } = renderHook(() => useReorderProducts('list-1'), {
        wrapper,
      })

      result.current.mutate(['p1', 'p2'])

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['lists', 'list-1', 'products'],
      })
    })
  })

  describe('mapProductToFormValues', () => {
    it('debe mapear producto a valores de formulario', () => {
      const product = {
        id: 'p1',
        nombre: 'Leche',
        descripcion: 'Leche entera',
        cantidad: 2,
        unidad: 'litros',
        precio: 1.5,
        urgente: true,
        categoriaId: 'cat-1',
        comprado: false,
      }

      const formValues = mapProductToFormValues(product)

      expect(formValues).toEqual({
        nombre: 'Leche',
        descripcion: 'Leche entera',
        cantidad: 2,
        unidad: 'litros',
        precio: 1.5,
        urgente: true,
        categoriaId: 'cat-1',
      })
    })
  })
})

describe('useProducts: ramas restantes (mapToUpdateDto, optimismo y rollback)', () => {
  let queryClient: QueryClient
  let wrapper: ({ children }: { children: ReactNode }) => JSX.Element

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    jest.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('mapToUpdateDto: precio no numérico o NaN se descarta', async () => {
    ;(productService.updateProduct as jest.Mock).mockResolvedValue({ id: 'p1' })

    const { result } = renderHook(() => useUpdateProduct('list-1'), { wrapper })

    result.current.mutate({
      productId: 'p1',
      data: { precio: 'no-es-numero' as never },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    result.current.mutate({ productId: 'p1', data: { precio: Number('NaN') } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productService.updateProduct).toHaveBeenNthCalledWith(
      1,
      'list-1',
      'p1',
      {
        precio: undefined,
      },
    )
    expect(productService.updateProduct).toHaveBeenNthCalledWith(
      2,
      'list-1',
      'p1',
      {
        precio: undefined,
      },
    )
  })

  it('mapToUpdateDto: precio numérico válido se conserva y campos de texto se sanitizan', async () => {
    ;(productService.updateProduct as jest.Mock).mockResolvedValue({ id: 'p1' })

    const { result } = renderHook(() => useUpdateProduct('list-1'), { wrapper })

    result.current.mutate({
      productId: 'p1',
      data: {
        precio: 3.5,
        descripcion: '  Descripción con espacios  ',
        unidad: '  kg  ',
        categoriaId: '  cat-1  ',
      },
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productService.updateProduct).toHaveBeenCalledWith('list-1', 'p1', {
      precio: 3.5,
      descripcion: 'Descripción con espacios',
      unidad: 'kg',
      categoriaId: 'cat-1',
    })
  })

  it('toggle optimista: actualiza la query observada con estructura anidada { data: { items } }', async () => {
    ;(productService.getProducts as jest.Mock).mockResolvedValue({
      data: {
        items: [{ id: 'p1', nombre: 'Arroz', comprado: false }],
        total: 1,
      },
    })
    ;(productService.togglePurchased as jest.Mock).mockResolvedValue({
      id: 'p1',
      comprado: true,
    })

    // useProducts mantiene el observador: sin él React Query recolectaría la
    // entrada de caché no observada (gcTime: 0 en el cliente de test)
    const products = renderHook(
      () => useProducts('list-1', { page: 1, limit: 20 }),
      { wrapper },
    )
    await waitFor(() => expect(products.result.current.isSuccess).toBe(true))

    const { result } = renderHook(() => useToggleProductPurchased('list-1'), {
      wrapper,
    })
    result.current.mutate({ productId: 'p1', purchased: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueriesData({
      queryKey: ['lists', 'list-1', 'products'],
    })[0][1] as any
    expect(cached.data.items[0].comprado).toBe(true)
  })

  it('toggle optimista: actualiza la query observada con estructura plana { items }', async () => {
    ;(productService.getProducts as jest.Mock).mockResolvedValue({
      items: [{ id: 'p1', nombre: 'Arroz', comprado: false }],
      total: 1,
    })
    ;(productService.togglePurchased as jest.Mock).mockResolvedValue({
      id: 'p1',
      comprado: true,
    })

    const products = renderHook(
      () => useProducts('list-1', { page: 1, limit: 20 }),
      { wrapper },
    )
    await waitFor(() => expect(products.result.current.isSuccess).toBe(true))

    const { result } = renderHook(() => useToggleProductPurchased('list-1'), {
      wrapper,
    })
    result.current.mutate({ productId: 'p1', purchased: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const cached = queryClient.getQueriesData({
      queryKey: ['lists', 'list-1', 'products'],
    })[0][1] as any
    expect(cached.items[0].comprado).toBe(true)
  })

  it('toggle optimista: caché vacía (old undefined) no falla', async () => {
    ;(productService.togglePurchased as jest.Mock).mockResolvedValue({
      id: 'p3',
    })

    const { result } = renderHook(() => useToggleProductPurchased('list-1'), {
      wrapper,
    })
    result.current.mutate({ productId: 'p3', purchased: true })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // La query sin datos no se rompe: no hay caché que actualizar
    expect(
      queryClient.getQueryData(['lists', 'list-1', 'products']),
    ).toBeUndefined()
  })

  it('toggle: rollback real restaurando el snapshot ante error del API', async () => {
    ;(productService.getProducts as jest.Mock).mockResolvedValue({
      items: [{ id: 'p1', nombre: 'Arroz', comprado: false }],
      total: 1,
    })
    ;(productService.togglePurchased as jest.Mock).mockRejectedValue(
      new Error('Rate limit'),
    )

    const products = renderHook(
      () => useProducts('list-1', { page: 1, limit: 20 }),
      { wrapper },
    )
    await waitFor(() => expect(products.result.current.isSuccess).toBe(true))

    const { result } = renderHook(() => useToggleProductPurchased('list-1'), {
      wrapper,
    })
    result.current.mutate({ productId: 'p1', purchased: true })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // El snapshot previo se restauró: sigue descomprado
    const cached = queryClient.getQueriesData({
      queryKey: ['lists', 'list-1', 'products'],
    })[0][1] as any
    expect(cached.items[0].comprado).toBe(false)
  })
})

describe('useProducts: filtro de estado pending', () => {
  it('status "pending" mapea comprado=false en la petición', async () => {
    ;(productService.getProducts as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    })

    const qc = createTestQueryClient()
    const wrap = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(
      () => useProducts('list-1', { page: 1, limit: 20, status: 'pending' }),
      { wrapper: wrap },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(productService.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ comprado: false, listaId: 'list-1' }),
    )
  })
})
