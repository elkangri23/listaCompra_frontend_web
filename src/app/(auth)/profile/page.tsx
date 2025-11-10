import Link from 'next/link'
import React from 'react'

export default function ProfilePage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
              <div className="flex flex-col gap-4">
                <h1 className="text-[#111418] text-base font-medium leading-normal">ListaColab</h1>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="House" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M218.83,103.77l-80-75.48a1.14,1.14,0,0,1-.11-.11,16,16,0,0,0-21.53,0l-.11.11L37.17,103.77A16,16,0,0,0,32,115.55V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V160h32v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V115.55A16,16,0,0,0,218.83,103.77ZM208,208H160V160a16,16,0,0,0-16-16H112a16,16,0,0,0-16,16v48H48V115.55l.11-.1L128,40l79.9,75.43.11.1Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Panel Principal</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="File" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Plantillas</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#f0f2f5]">
                    <div className="text-[#111418]" data-icon="Gear" data-size="24px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M216,130.16q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06ZM128,168a40,40,0,1,1,40-40A40,40,0,0,1,128,168Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Ajustes</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="text-[#111418]" data-icon="SignOut" data-size="24px" data-weight="regular">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-[#111418] text-sm font-medium leading-normal">Cerrar SesiÃ³n</p>
                </div>
              </div>
            </div>
          </div>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4"><p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Ajustes</p></div>
            <div className="pb-3">
              <div className="flex border-b border-[#dbdfe6] px-4 gap-8">
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-[#111418] text-[#111418] pb-[13px] pt-4">
                  <p className="text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]">Perfil</p>
                </button>
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#60708a] pb-[13px] pt-4">
                  <p className="text-[#60708a] text-sm font-bold leading-normal tracking-[0.015em]">Seguridad</p>
                </button>
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#60708a] pb-[13px] pt-4">
                  <p className="text-[#60708a] text-sm font-bold leading-normal tracking-[0.015em]">Preferencias</p>
                </button>
              </div>
            </div>
            <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Perfil</h3>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label htmlFor="fullName" className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Nombre Completo</p>
                <input
                  id="fullName"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal"
                  value=""
                />
              </label>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label htmlFor="email" className="flex flex-col min-w-40 flex-1">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  id="email"
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal"
                  value=""
                />
              </label>
            </div>
            <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Seguridad</h3>
            <div className="p-4 @container">
              <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-lg border border-[#dbdfe6] bg-white p-5 @[480px]:flex-row @[480px]:items-center">
                <div className="flex flex-col gap-1">
                  <p className="text-[#111418] text-base font-bold leading-tight">Cambiar ContraseÃ±a</p>
                  <p className="text-[#60708a] text-base font-normal leading-normal">Actualiza tu contraseÃ±a para mantener tu cuenta segura.</p>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#4387f4] text-white text-sm font-medium leading-normal"
                >
                  <span className="truncate">Cambiar ContraseÃ±a</span>
                </button>
              </div>
            </div>
            <div className="p-4 @container">
              <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-lg border border-[#dbdfe6] bg-white p-5 @[480px]:flex-row @[480px]:items-center">
                <div className="flex flex-col gap-1">
                  <p className="text-[#111418] text-base font-bold leading-tight">Cerrar sesiÃ³n en todos los dispositivos</p>
                  <p className="text-[#60708a] text-base font-normal leading-normal">Cerrar sesiÃ³n en todos los dispositivos asociados con tu cuenta.</p>
                </div>
                <button
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#4387f4] text-white text-sm font-medium leading-normal"
                >
                  <span className="truncate">Cerrar sesiÃ³n</span>
                </button>
              </div>
            </div>
            <h3 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Preferencias</h3>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex flex-col justify-center">
                <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Notificaciones por correo electrÃ³nico</p>
                <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">Recibe notificaciones por correo electrÃ³nico sobre cambios en tus listas.</p>
              </div>
              <div className="shrink-0">
                <label htmlFor="emailNotifications"
                  className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-[#f0f2f5] p-0.5 has-[:checked]:justify-end has-[:checked]:bg-[#4387f4]"
                  aria-label="Activar notificaciones por correo electrónico"
                >
                  <div className="h-full w-[27px] rounded-full bg-white" style={{ boxShadow: 'rgba(0, 0, 0, 0.15) 0px 3px 8px, rgba(0, 0, 0, 0.06) 0px 3px 1px' }}></div>
                  <input id="emailNotifications" type="checkbox" className="invisible absolute" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
