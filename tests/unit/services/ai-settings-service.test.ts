/**
 * Tests CRÍTICOS - ai-settings-service.ts (CU-31)
 */

import { axiosInstance } from '@/lib/api/axios-instance';

import {
  aiSettingsService,
  AI_PROVIDERS,
} from '@/features/settings/services/ai-settings-service';

jest.mock('@/lib/api/axios-instance', () => ({
  axiosInstance: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}));

const mockConfig = {
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
};

describe('aiSettingsService (CU-31)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('debe obtener la configuración segura', async () => {
      (axiosInstance.get as jest.Mock).mockResolvedValue({ data: { data: mockConfig } });

      const result = await aiSettingsService.getConfig();

      expect(axiosInstance.get).toHaveBeenCalledWith('/ai/admin/config');
      expect(result).toEqual(mockConfig);
    });

    it('debe propagar errores del API', async () => {
      (axiosInstance.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      await expect(aiSettingsService.getConfig()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateConfig', () => {
    it('debe actualizar la configuración', async () => {
      (axiosInstance.put as jest.Mock).mockResolvedValue({ data: { data: mockConfig } });

      const dto = { provider: 'openai' as const, model: 'gpt-4o-mini' };
      const result = await aiSettingsService.updateConfig(dto);

      expect(axiosInstance.put).toHaveBeenCalledWith('/ai/admin/config', dto);
      expect(result).toEqual(mockConfig);
    });

    it('debe convertir el error del backend en Error legible', async () => {
      (axiosInstance.put as jest.Mock).mockRejectedValue({
        response: { data: { error: 'La API key debe ser una cadena válida de al menos 32 caracteres' } },
      });

      await expect(aiSettingsService.updateConfig({ provider: 'openai' })).rejects.toThrow(
        'La API key debe ser una cadena válida de al menos 32 caracteres'
      );
    });
  });

  describe('testConfig', () => {
    it('debe probar la conexión sin key candidata', async () => {
      const testResult = { provider: 'perplexity', model: 'x', apiUrl: 'y', latencyMs: 120 };
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { data: testResult } });

      const result = await aiSettingsService.testConfig();

      expect(axiosInstance.post).toHaveBeenCalledWith('/ai/admin/config/test', {});
      expect(result).toEqual(testResult);
    });

    it('debe incluir la key candidata si se proporciona', async () => {
      (axiosInstance.post as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await aiSettingsService.testConfig('sk-nueva-key-de-prueba-0123456789abcdef');

      expect(axiosInstance.post).toHaveBeenCalledWith('/ai/admin/config/test', {
        apiKey: 'sk-nueva-key-de-prueba-0123456789abcdef',
      });
    });

    it('debe convertir el error de conexión en Error legible', async () => {
      (axiosInstance.post as jest.Mock).mockRejectedValue({
        response: { data: { error: 'El proveedor respondió 401: verifica modelo y key' } },
      });

      await expect(aiSettingsService.testConfig()).rejects.toThrow('El proveedor respondió 401');
    });
  });

  describe('AI_PROVIDERS', () => {
    it('debe incluir los proveedores OpenAI-compatibles', () => {
      const ids = AI_PROVIDERS.map((p) => p.id);

      expect(ids).toEqual(
        expect.arrayContaining(['perplexity', 'openai', 'openrouter', 'claude', 'azure-openai'])
      );
    });

    it('debe tener apiUrl por defecto para perplexity, openai y openrouter', () => {
      const byId = Object.fromEntries(AI_PROVIDERS.map((p) => [p.id, p]));

      expect(byId['openai'].apiUrlPorDefecto).toBe('https://api.openai.com/v1');
      expect(byId['openrouter'].apiUrlPorDefecto).toBe('https://openrouter.ai/api/v1');
    });
  });
});
