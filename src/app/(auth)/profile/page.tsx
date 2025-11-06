import { Metadata } from 'next'

import { ProfileForm } from '@/features/auth/components/profile-form'
import { ChangePasswordForm } from '@/features/auth/components/change-password-form'

export const metadata: Metadata = {
  title: 'Ajustes',
  description: 'Gestiona tu perfil y configuración de seguridad',
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col max-w-[960px] w-full mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Ajustes
        </h1>
      </div>

      {/* Tabs Navigation */}
      <div className="pb-3">
        <div className="flex border-b border-[#dbdfe6] px-4 gap-8">
          <a
            className="flex flex-col items-center justify-center border-b-[3px] border-b-[#111418] text-[#111418] pb-[13px] pt-4"
            href="#perfil"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Perfil</p>
          </a>
          <a
            className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#60708a] pb-[13px] pt-4 hover:text-[#111418] transition-colors"
            href="#seguridad"
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Seguridad</p>
          </a>
        </div>
      </div>

      {/* Perfil Section */}
      <section id="perfil" className="space-y-4">
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Perfil
        </h3>
        <ProfileForm />
      </section>

      {/* Seguridad Section */}
      <section id="seguridad" className="space-y-4 mt-8">
        <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Seguridad
        </h3>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
