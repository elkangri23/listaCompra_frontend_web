'use client';

/**
 * Página de ajustes (CU-31): configuración del proveedor LLM.
 * Visible para administradores; el resto ve un aviso de permisos.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AISettingsForm } from '@/features/settings/components/ai-settings-form';

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
    </main>
  );
}
