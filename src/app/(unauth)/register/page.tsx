import type { Metadata } from 'next'

import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Crear cuenta | ListaCompra',
  description:
    'Regístrate en segundos para comenzar a crear y compartir listas colaborativas con tu equipo o familia.',
}

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <div className="layout-container flex h-full grow flex-col items-center justify-center p-5">
        <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5">
          {/* Hero Image */}
          <div>
            <div className="px-4 py-3">
              <div 
                className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white rounded-lg min-h-[218px]" 
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80")'
                }}
              ></div>
            </div>
          </div>

          {/* Register Form */}
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
