import type { Metadata } from 'next'
import { Suspense } from 'react'

import { VerifyEmailForm } from '@/features/auth/components/verify-email-form'

export const metadata: Metadata = {
  title: 'Verifica tu correo | ListaCompra',
  description:
    'Introduce el código de 6 dígitos que te hemos enviado por correo para activar tu cuenta.',
}

export default function VerifyEmailPage() {

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-white group/design-root"
      style={
        {
          '--checkbox-tick-svg': `url('data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e')`,
          fontFamily: 'Inter, "Noto Sans", sans-serif',
        } as React.CSSProperties
      }
    >
      <div className="layout-container flex h-full grow flex-col items-center justify-center p-5">
        <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5">
          <div className="@container">
            <div className="@[480px]:px-4 @[480px]:py-3">
              <div className="w-full flex items-center justify-center gap-2 overflow-hidden bg-[#4387f4] @[480px]:rounded-lg min-h-[120px] px-4">
                <span aria-hidden="true" className="text-3xl">
                  🛒
                </span>
                <span className="text-white text-2xl font-extrabold tracking-tight">
                  ListaCompra
                </span>
              </div>
            </div>
          </div>
          <Suspense fallback={<div>Cargando...</div>}>
            <VerifyEmailForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
