import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/features/auth/components/login-form'

export const metadata: Metadata = {
  title: 'Iniciar sesión | ListaCompra',
  description:
    'Accede a tus listas colaborativas con autenticación segura y protección contra accesos no autorizados.',
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="layout-content-container flex flex-col w-full max-w-screen-md lg:max-w-[80%] min-w-[320px] items-center">
            <div className="flex flex-col w-full max-w-[480px] sm:w-[512px] @container">
                <div className="@[480px]:px-4 @[480px]:py-3">
                    <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-lg min-h-[218px]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBUKmKFcOwLBHtR9WmpIiNK5cYkxO8QGTPTIkMiTSGi8WuRnTpC2zBCIyIMbMZWZB2a3EoIu_Na-NtFW8T5rWYULfqT2RZv1oQUj9JSqWy8SbpwQ4AfVc6D94PFud8aTy3sdff8dJ64e520BSaPTFxlD-NSvt5wIY-UuMmEv4tXL_G2MLV2QnCqBPNDqE5tjzv3JJ4V81ulnxujzGg8YzPcxZQrKGBvpMkz7cO_XnvONAGnstnT-ikQDNOIJExzWvT9OeTrUyKsW1a0")'}}></div>
                </div>
            </div>
            <div className="w-full max-w-[480px] px-4">
              <Suspense fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="text-[#60708a]">Cargando...</div>
                </div>
              }>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
