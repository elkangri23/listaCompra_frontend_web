'use client';

/**
 * Página de ajustes (CU-31): configuración del proveedor LLM.
 * Visible para administradores; el resto ve un aviso de permisos.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AISettingsForm } from '@/features/settings/components/ai-settings-form';
import { CacheAnalyticsSection } from '@/features/settings/components/cache-analytics-section';

export default function SettingsPage() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Ajustes</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Inteligencia Artificial</CardTitle>
          <CardDescription>
            Configura el proveedor LLM usado para la categorización automática
            y recomendaciones (solo administradores).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AISettingsForm />
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-6">
        <CardHeader>
          <CardTitle>Caché de IA</CardTitle>
          <CardDescription>
            Analítica de la caché de Redis en los últimos 5 minutos: aciertos,
            operaciones y llamadas a la API evitadas (solo administradores).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CacheAnalyticsSection />
        </CardContent>
      </Card>
    </main>
  );
}
