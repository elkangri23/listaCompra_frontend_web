'use client';

/**
 * Formulario de configuración del proveedor LLM (CU-31)
 * Solo para administradores: provider, model, apiUrl y apiKey,
 * con verificación de conexión antes de guardar.
 */

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAIConfig, useUpdateAIConfig, useTestAIConfig } from '../hooks/use-ai-settings';
import { AI_PROVIDERS, AIProviderId } from '../services/ai-settings-service';

export function AISettingsForm() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('ADMIN') ?? false;

  const { data: config, isLoading, isError, error } = useAIConfig({ enabled: isAdmin });
  const updateMutation = useUpdateAIConfig();
  const testMutation = useTestAIConfig();

  const [provider, setProvider] = useState<AIProviderId>('perplexity');
  const [apiUrl, setApiUrl] = useState('');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Sincronizar el formulario con la configuración cargada
  useEffect(() => {
    if (config) {
      setProvider(config.provider);
      setApiUrl(config.apiUrl);
      setModel(config.model);
      setApiKey('');
    }
  }, [config]);

  if (!isAdmin) {
    return (
      <div role="alert" className="p-4">
        <p className="text-sm text-gray-700">
          No tienes permisos de administrador para ver esta sección.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <p className="p-4 text-sm text-gray-600">Cargando configuración…</p>;
  }

  if (isError) {
    return (
      <div role="alert" className="p-4">
        <p className="text-sm text-red-600">
          No se pudo cargar la configuración: {(error as Error)?.message}
        </p>
      </div>
    );
  }

  const providerMeta = AI_PROVIDERS.find((p) => p.id === provider);

  const handleProviderChange = (value: AIProviderId) => {
    setProvider(value);
    const meta = AI_PROVIDERS.find((p) => p.id === value);
    if (meta?.apiUrlPorDefecto) {
      setApiUrl(meta.apiUrlPorDefecto);
    }
    if (meta?.modelosSugeridos.length) {
      setModel(meta.modelosSugeridos[0]);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        provider,
        apiUrl: apiUrl.trim() || undefined,
        model: model.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
      });
      toast.success('Configuración guardada', {
        description: 'El proveedor LLM se ha actualizado sin reiniciar el servidor.',
      });
    } catch (err) {
      toast.error('Error al guardar', {
        description: err instanceof Error ? err.message : 'Error inesperado',
      });
    }
  };

  const handleTest = async () => {
    try {
      const result = await testMutation.mutateAsync(apiKey.trim() || undefined);
      toast.success('Conexión verificada', {
        description: `Latencia ${result.latencyMs} ms con ${result.model}.`,
      });
    } catch (err) {
      toast.error('Fallo de conexión', {
        description: err instanceof Error ? err.message : 'Error inesperado',
      });
    }
  };

  const isPending = updateMutation.isPending;
  const isTesting = testMutation.isPending;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
    >
      <div>
        <Label htmlFor="ai-provider">Proveedor LLM</Label>
        <Select value={provider} onValueChange={handleProviderChange}>
          <SelectTrigger id="ai-provider" className="w-72">
            <SelectValue placeholder="Selecciona un proveedor" />
          </SelectTrigger>
          <SelectContent>
            {AI_PROVIDERS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="ai-api-url">URL del API</Label>
        <Input
          id="ai-api-url"
          type="url"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder={providerMeta?.apiUrlPorDefecto || 'https://…'}
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="ai-model">Modelo</Label>
        <Input
          id="ai-model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="p. ej. llama-3.1-sonar-small-128k-online"
          autoComplete="off"
          list="ai-model-suggestions"
        />
        <datalist id="ai-model-suggestions">
          {(providerMeta?.modelosSugeridos ?? []).map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>

      <div>
        <Label htmlFor="ai-api-key">API Key</Label>
        <Input
          id="ai-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            config?.apiKeyConfigured
              ? `Configurada (${config.apiKeyMasked}) - deja vacío para conservarla`
              : 'Introduce la API key del proveedor'
          }
          autoComplete="new-password"
        />
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={handleTest} disabled={isTesting}>
          {isTesting ? 'Probando…' : 'Probar conexión'}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando…' : 'Guardar configuración'}
        </Button>
      </div>

      {config && (
        <p className="text-xs text-gray-500">
          Configuración actual: {config.provider} · {config.model} · key{' '}
          {config.apiKeyConfigured ? config.apiKeyMasked : 'no configurada'}
        </p>
      )}
    </form>
  );
}
