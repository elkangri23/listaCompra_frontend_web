import type { Metadata } from 'next'
import Link from 'next/link'

import { SessionStatus } from '@/features/auth/components/session/session-status'
import { auth } from '@/lib/auth/next-auth'
import {
  Heading,
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui'

export const metadata: Metadata = {
  title: 'Panel principal | ListaCompra',
  description: 'Resumen inicial para usuarios autenticados de ListaCompra.',
}

export default async function DashboardPage() {
  const session = await auth()
  const roles = session?.user?.roles ?? []

  return (
    <div className="container space-y-8 py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Heading level={1}>Hola, {session?.user?.name ?? 'equipo'} 👋</Heading>
          <Text variant="muted">
            Este es un adelanto del panel protegido. A medida que avancemos en los sprints, agregaremos métricas y accesos
            rápidos.
          </Text>
        </div>
        <SessionStatus />
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximos pasos</CardTitle>
            <CardDescription>
              Continúa con los siguientes módulos para habilitar la colaboración en listas y notificaciones en tiempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Completar la gestión de sesiones (Sprint 2.2).</li>
              <li>Construir el CRUD de listas (Sprint 3.1).</li>
              <li>Integrar notificaciones colaborativas.</li>
            </ul>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Ver avances del sistema de diseño
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de autenticación</CardTitle>
            <CardDescription>
              Validamos credenciales con NextAuth.js, tokens JWT y renovación automática del token de acceso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Usuario: <span className="font-medium text-foreground">{session?.user?.email}</span>
            </p>
            <p>
              Roles asignados:{' '}
              <span className="font-medium text-foreground">{roles.length > 0 ? roles.join(', ') : 'usuario'}</span>
            </p>
            <p>
              Usa el menú de navegación superior para continuar explorando la app.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
