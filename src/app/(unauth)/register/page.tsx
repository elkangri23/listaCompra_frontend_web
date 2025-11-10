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
          <div className="@container">
            <div className="@[480px]:px-4 @[480px]:py-3">
              <div className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-white @[480px]:rounded-lg min-h-[218px]" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAySoRRfzpm-wiSAK0-SOxYXr_-XoDASqzG8kb2i9_MExsIL8HVmVRkS25CZKo0X0xvfripKv-My8PPf0rEmpYXuUNVtG-Z_mr0h1lVSqOE8287OV6crIrRRVKpe3e8UeW57-I661S8saVF9DvnkGY6Fz22ScdGXi9QOGFCkW724ZNI4bOv_bg2FqLngU6s6_4pTpmaiA6YuDh-wBsvCyEns8MnCW4SIIr_UAwVrb_pE2ObN8jO0lm9wdQ6KdLU31tZ2atCuKzsw5Wq")'}}></div>
            </div>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
