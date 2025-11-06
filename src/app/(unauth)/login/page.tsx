import type { Metadata } from 'next'
import Link from 'next/link'
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
            {/* Hero Image */}
            <div className="flex flex-col w-full max-w-[480px] sm:w-[512px]">
              <div className="px-4 py-3">
                <div 
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white rounded-lg min-h-[218px]" 
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80")'
                  }}
                ></div>
              </div>
            </div>

            {/* Login Form */}
            <div className="w-full max-w-[480px] px-4">
              <Suspense fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="text-[#60708a]">Cargando...</div>
                </div>
              }>
                <LoginForm />
              </Suspense>

              {/* Register Link */}
              <p className="text-[#60708a] text-sm font-normal leading-normal pb-3 pt-4 text-center w-full">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="text-[#4387f4] underline hover:text-[#3577e4] transition-colors">
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
