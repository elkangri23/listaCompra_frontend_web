import type { Metadata } from 'next'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Text } from '@/components/ui'
import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Crear cuenta | ListaCompra',
  description:
    'Regístrate en segundos para comenzar a crear y compartir listas colaborativas con tu equipo o familia.',
}

export default function RegisterPage() {
  return (
    <Card className="border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Crea tu cuenta</CardTitle>
        <CardDescription>Completa los campos para unirte a la plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex-col gap-2 text-center">
        <Text className="text-sm text-muted-foreground">
          Al registrarte aceptas los términos y condiciones del servicio.
        </Text>
      </CardFooter>
    </Card>
  )
}
