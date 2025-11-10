import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form'

export const metadata: Metadata = {
  title: 'Recuperar contraseña | ListaCompra',
  description:
    'Solicita un enlace de recuperación seguro para restablecer tu contraseña y seguir colaborando en tus listas.',
}

export default function ForgotPasswordPage() {
  return (
    <div>
      <header>
        <h2>Recuperar contraseña</h2>
        <p>Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
      </header>
      <div>
        <ForgotPasswordForm />
      </div>
      <footer>
        <p>
          Mantén tu cuenta segura utilizando contraseñas únicas y siguiendo las recomendaciones de seguridad.
        </p>
      </footer>
    </div>
  )
}