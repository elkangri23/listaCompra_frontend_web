/**
 * Tests CRÍTICOS - use-ai-settings.ts (CU-31)
 * Hooks de React Query para la configuración IA
 */

import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

import {
  useAIConfig,
  useUpdateAIConfig,
  useTestAIConfig,
} from '@/features/settings/hooks/use-ai-settings'
import {
  aiSettingsService,
  AISafeConfig,
} from '@/features/settings/services/ai-settings-service'
import { createTestQueryClient } from '../../utils/test-utils'

jest.mock('@/features/settings/services/ai-settings-service', () => ({
  aiSettingsService: {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    testConfig: jest.fn(),
  },
  AI_PROVIDERS: [],
}))

const mockGetConfig = aiSettingsService.getConfig as jest.Mock
const mockUpdate = aiSettingsService.updateConfig as jest.Mock
const mockTest = aiSettingsService.testConfig as jest.Mock

const mockConfig: AISafeConfig = {
  provider: 'perplexity',
  apiUrl: 'https://api.perplexity.ai',
  model: 'llama-3.1-sonar-small-128k-online',
  temperature: 0.7,
  maxTokens: 1000,
  timeout: 30000,
  cache: { enabled: false, ttl: 3600 },
  rateLimit: { requestsPerMinute: 10 },
  apiKeyConfigured: true,
  apiKeyMasked: 'pplx-a...6789',
}

describe('use-ai-settings hooks (CU-31)', () => {
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

  describe('useAIConfig', () => {
    it('debe cargar la configuración sin opciones (enabled por defecto)', async () => {
      mockGetConfig.mockResolvedValue(mockConfig)

      const { result } = renderHook(() => useAIConfig(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetConfig).toHaveBeenCalled()
      expect(result.current.data).toEqual(mockConfig)
    })

    it('no consulta con enabled=false', () => {
      renderHook(() => useAIConfig({ enabled: false }), { wrapper })

      expect(mockGetConfig).not.toHaveBeenCalled()
    })
  })

  describe('useUpdateAIConfig', () => {
    it('debe actualizar y escribir la respuesta en la caché', async () => {
      const updated = { ...mockConfig, provider: 'openai' as const }
      mockGetConfig.mockResolvedValue(mockConfig)
      mockUpdate.mockResolvedValue(updated)

      // Observador de la query: sin él, gcTime: 0 recolectaría la entrada
      renderHook(() => useAIConfig(), { wrapper })
      await waitFor(() => expect(mockGetConfig).toHaveBeenCalled())

      const { result } = renderHook(() => useUpdateAIConfig(), { wrapper })

      result.current.mutate({ provider: 'openai' })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      const cached = queryClient.getQueryData(['ai-admin-config'])
      expect(cached).toEqual(updated)
    })

    it('debe exponer el error cuando la actualización falla', async () => {
      mockUpdate.mockRejectedValue(new Error('Key inválida'))

      const { result } = renderHook(() => useUpdateAIConfig(), { wrapper })

      result.current.mutate({ provider: 'openai' })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toBe('Key inválida')
    })
  })

  describe('useTestAIConfig', () => {
    it('debe probar la conexión con y sin key candidata', async () => {
      const testResult = {
        provider: 'perplexity',
        model: 'x',
        apiUrl: 'y',
        latencyMs: 42,
      }
      mockTest.mockResolvedValue(testResult)

      const { result } = renderHook(() => useTestAIConfig(), { wrapper })

      result.current.mutate(undefined)
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockTest).toHaveBeenCalledWith(undefined)

      result.current.reset()
      result.current.mutate('sk-candidata-0123456789abcdef012345')
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockTest).toHaveBeenCalledWith(
        'sk-candidata-0123456789abcdef012345',
      )
    })

    it('debe exponer el error cuando falla la conexión', async () => {
      mockTest.mockRejectedValue(new Error('Proveedor no responde'))

      const { result } = renderHook(() => useTestAIConfig(), { wrapper })

      result.current.mutate(undefined)

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toBe('Proveedor no responde')
    })
  })
})
