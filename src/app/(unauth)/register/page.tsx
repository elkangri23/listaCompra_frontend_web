import type { Metadata } from 'next'
import { Suspense } from 'react'

import { RegisterForm } from '@/features/auth/components/register-form'

export const metadata: Metadata = {
  title: 'Crear cuenta | ListaCompra',
  description:
    'Regístrate en segundos para comenzar a crear y compartir listas colaborativas con tu equipo o familia.',
}

export default function RegisterPage() {
  const heroUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAySoRRfzpm-wiSAK0-SOxYXr_-XoDASqzG8kb2i9_MExsIL8HVmVRkS25CZKo0X0xvfripKv-My8PPf0rEmpYXuUNVtG-Z_mr0h1lVSqOE8287OV6crIrRRVKpe3e8UeW57-I661S8saVF9DvnkGY6Fz22ScdGXi9QOGFCkW724ZNI4bOv_bg2FqLngU6s6_4pTpmaiA6YuDh-wBsvCyEns8MnCW4SIIr_UAwVrb_pE2ObN8jO0lm9wdQ6KdLU31tZ2atCuKzsw5Wq'

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
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
