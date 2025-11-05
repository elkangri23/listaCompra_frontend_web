import type { Metadata } from 'next'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Text } from '@/components/ui'
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | ListaCompra',
  description:
    'Solicita un enlace de recuperación seguro para restablecer tu contraseña y seguir colaborando en tus listas.',
}

export default function ForgotPasswordPage() {
  return (
    <Card className="border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Recuperar contraseña</CardTitle>
        <CardDescription>Ingresa tu correo y te enviaremos un enlace para restablecerla.</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
      <CardFooter>
        <Text className="text-sm text-muted-foreground">
          Mantén tu cuenta segura utilizando contraseñas únicas y siguiendo las recomendaciones de seguridad.
        </Text>
      </CardFooter>
    </Card>
  )
}
