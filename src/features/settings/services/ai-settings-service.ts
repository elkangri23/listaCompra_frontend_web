/**
 * Servicio de administración de la configuración IA (CU-31)
 * Endpoints del backend (solo administradores):
 *   GET  /ai/admin/config        - Config actual (key enmascarada)
 *   PUT  /ai/admin/config        - Actualizar provider/model/apiUrl/apiKey
 *   POST /ai/admin/config/test   - Verificar conectividad
 */

import { axiosInstance } from '@/lib/api/axios-instance';

export const AI_PROVIDERS = [
  {
    id: 'freellmapi',
    nombre: 'FreeLLMAPI (gratuito, local)',
    apiUrlPorDefecto: 'http://freellmapi:3001/v1',
    modelosSugeridos: ['qwen3.8-27b', 'gemini-3.5-flash-lite'],
  },
  {
    id: 'perplexity',
    nombre: 'Perplexity (Sonar online)',
    apiUrlPorDefecto: 'https://api.perplexity.ai',
    modelosSugeridos: [
      'llama-3.1-sonar-small-128k-online',
      'llama-3.1-sonar-large-128k-online',
      'llama-3.1-sonar-huge-128k-online',
    ],
  },
  {
    id: 'openai',
    nombre: 'OpenAI (GPT)',
    apiUrlPorDefecto: 'https://api.openai.com/v1',
    modelosSugeridos: ['gpt-4o-mini', 'gpt-4o'],
  },
  {
    id: 'openrouter',
    nombre: 'OpenRouter (multi-proveedor)',
    apiUrlPorDefecto: 'https://openrouter.ai/api/v1',
    modelosSugeridos: ['openai/gpt-4o-mini', 'meta-llama/llama-3.1-8b-instruct'],
  },
  {
    id: 'claude',
    nombre: 'Anthropic Claude (compatible OpenAI)',
    apiUrlPorDefecto: 'https://api.anthropic.com/v1',
    modelosSugeridos: [],
  },
  {
    id: 'azure-openai',
    nombre: 'Azure OpenAI',
    apiUrlPorDefecto: '',
    modelosSugeridos: [],
  },
] as const;

export type AIProviderId = (typeof AI_PROVIDERS)[number]['id'];

export interface AISafeConfig {
  provider: AIProviderId;
  apiUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  cache: { enabled: boolean; ttl: number };
  rateLimit: { requestsPerMinute: number };
  apiKeyConfigured: boolean;
  apiKeyMasked: string;
}

export interface AIConfigUpdateDto {
  provider?: AIProviderId;
  apiUrl?: string;
  model?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AITestResult {
  provider: AIProviderId;
  model: string;
  apiUrl: string;
  latencyMs: number;
}

const errorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const response = (error as { response?: { data?: { error?: string } } }).response;
    if (response?.data?.error) {
      return response.data.error;
    }
    const networkError = error as { message?: string };
    if (networkError.message) {
      return networkError.message;
    }
  }
  return 'Error inesperado';
};

export const aiSettingsService = {
  async getConfig(): Promise<AISafeConfig> {
    const response = await axiosInstance.get('/ai/admin/config');
    return response.data.data;
  },

  async updateConfig(dto: AIConfigUpdateDto): Promise<AISafeConfig> {
    try {
      const response = await axiosInstance.put('/ai/admin/config', dto);
      return response.data.data;
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  },

  async testConfig(apiKey?: string): Promise<AITestResult> {
    try {
      const response = await axiosInstance.post('/ai/admin/config/test', {
        ...(apiKey && apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      });
      return response.data.data;
    } catch (error) {
      throw new Error(errorMessage(error));
    }
  },
};
