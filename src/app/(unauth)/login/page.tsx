import type { Metadata } from 'next'
import { Suspense } from 'react'

import { LoginForm } from '@/features/auth/components/login-form'



export const metadata: Metadata = {
  title: 'Iniciar sesión | ListaCompra',
  description:
    'Accede a tus listas colaborativas con autenticación segura y protección contra accesos no autorizados.',
}

export default function LoginPage() {
  const heroUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUKmKFcOwLBHtR9WmpIiNK5cYkxO8QGTPTIkMiTSGi8WuRnTpC2zBCIyIMbMZWZB2a3EoIu_Na-NtFW8T5rWYULfqT2RZv1oQUj9JSqWy8SbpwQ4AfVc6D94PFud8aTy3sdff8dJ64e520BSaPTFxlD-NSvt5wIY-UuMmEv4tXL_G2MLV2QnCqBPNDqE5tjzv3JJ4V81ulnxujzGg8YzPcxZQrKGBvpMkz7cO_XnvONAGnstnT-ikQDNOIJExzWvT9OeTrUyKsW1a0'

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white group/design-root overflow-x-hidden" style={{ '--checkbox-tick-svg': 'url(\'data:image/svg+xml,%3csvg viewBox=%270 0 16 16%27 fill=%27rgb(255,255,255)%27 xmlns=%27http://www.w3.org/2000/svg%27%3e%3cpath d=%27M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z%27/%3e%3c/svg%3e\')', fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col items-center justify-center p-5">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5">
          <div className="@container">
            <div className="@[480px]:px-4 @[480px]:py-3">
              <div
                className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-lg min-h-[218px]"
                style={{ backgroundImage: `url("${heroUrl}")` }}
              ></div>
            </div>
          </div>
          <Suspense fallback={<div>Cargando...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
