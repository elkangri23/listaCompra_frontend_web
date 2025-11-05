import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Text } from '@/components/ui'
import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión | ListaCompra',
  description:
    'Accede a tus listas colaborativas con autenticación segura y protección contra accesos no autorizados.',
}

export default function LoginPage() {
  return (
    <Card className="border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Bienvenido de nuevo</CardTitle>
        <CardDescription>Ingresa tus credenciales para continuar gestionando tus listas.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Suspense fallback={<div>Cargando...</div>}>
          <LoginForm />
        </Suspense>
        <div className="text-right text-sm">
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Text className="text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?{' '}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register">
            Regístrate gratis
          </Link>
        </Text>
      </CardFooter>
    </Card>
  )
}
