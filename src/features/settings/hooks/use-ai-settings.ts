/**
 * Hook de configuración IA (CU-31)
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  aiSettingsService,
  AIConfigUpdateDto,
} from '../services/ai-settings-service';

const AI_CONFIG_QUERY_KEY = ['ai-admin-config'] as const;

export function useAIConfig(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: AI_CONFIG_QUERY_KEY,
    queryFn: () => aiSettingsService.getConfig(),
    staleTime: 0,
    enabled,
  });
}

export function useUpdateAIConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: AIConfigUpdateDto) => aiSettingsService.updateConfig(dto),
    onSuccess: (updated) => {
      queryClient.setQueryData(AI_CONFIG_QUERY_KEY, updated);
    },
  });
}

export function useTestAIConfig() {
  return useMutation({
    mutationFn: (apiKey?: string) => aiSettingsService.testConfig(apiKey),
  });
}
