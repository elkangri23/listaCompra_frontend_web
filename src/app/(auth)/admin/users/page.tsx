import Link from 'next/link'
import React from 'react'

export default function UserManagementPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-80">
            <div className="flex h-full min-h-[700px] flex-col justify-between bg-white p-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <h1 className="text-[#111418] text-base font-medium leading-normal">Administrador</h1>
                  <p className="text-[#60758a] text-sm font-normal leading-normal">AplicaciÃ³n de Lista de la Compra</p>
                </div>
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
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#f0f2f5]">
                    <div className="text-[#111418]" data-icon="Users" data-size="24px" data-weight="fill">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M164.47,195.63a8,8,0,0,1-6.7,12.37H10.23a8,8,0,0,1-6.7-12.37,95.83,95.83,0,0,1,47.22-37.71,60,60,0,1,1,66.5,0A95.83,95.83,0,0,1,164.47,195.63Zm87.91-.15a95.87,95.87,0,0,0-47.13-37.56A60,60,0,0,0,144.7,54.59a4,4,0,0,0-1.33,6A75.83,75.83,0,0,1,147,150.53a4,4,0,0,0,1.07,5.53,112.32,112.32,0,0,1,29.85,30.83,23.92,23.92,0,0,1,3.65,16.47,4,4,0,0,0,3.95,4.64h60.3a8,8,0,0,0,7.73-5.93A8.22,8.22,0,0,0,252.38,195.48Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">GestiÃ³n de Usuarios</p>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="text-[#111418]" data-icon="FileText" data-size="24px" data-weight="regular">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path
                          d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-[#111418] text-sm font-medium leading-normal">Logs de AuditorÃ­a</p>
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
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">GestiÃ³n de Usuarios</p>
            </div>
            <div className="px-4 py-3">
              <label htmlFor="search-users" className="flex flex-col min-w-40 h-12 w-full" aria-label="Buscar usuarios">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div
                    className="text-[#60758a] flex border-none bg-[#f0f2f5] items-center justify-center pl-4 rounded-l-xl border-r-0"
                    data-icon="MagnifyingGlass"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    id="search-users"
                    placeholder="Buscar usuarios por nombre o email"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-full placeholder:text-[#60758a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value=""
                  />
                </div>
              </label>
            </div>
            <div className="px-4 py-3 @container">
              <div className="flex overflow-hidden rounded-xl border border-[#dbe0e6] bg-white">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-white">
                      <th className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Nombre</th>
                      <th className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">Email</th>
                      <th className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                        Fecha de Registro
                      </th>
                      <th className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-480 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">Estado</th>
                      <th
                        className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-600 px-4 py-3 text-left text-[#111418] w-60 text-[#60758a] text-sm font-medium leading-normal"
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-t-[#dbe0e6]">
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        Elena Ramirez
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        elena.ramirez@example.com
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        2023-08-15
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                        <button
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full"
                        >
                          <span className="truncate">Activo</span>
                        </button>
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-600 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]">
                        Ver Detalles
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dbe0e6]">
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        Carlos Mendoza
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        carlos.mendoza@example.com
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        2023-07-22
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                        <button
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full"
                        >
                          <span className="truncate">Activo</span>
                        </button>
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-600 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]">
                        Ver Detalles
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dbe0e6]">
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        Sofia Vargas
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        sofia.vargas@example.com
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        2023-06-10
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                        <button
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full"
                        >
                          <span className="truncate">Inactivo</span>
                        </button>
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-600 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]">
                        Ver Detalles
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dbe0e6]">
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        Javier Torres
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        javier.torres@example.com
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        2023-05-01
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                        <button
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full"
                        >
                          <span className="truncate">Activo</span>
                        </button>
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-600 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]">
                        Ver Detalles
                      </td>
                    </tr>
                    <tr className="border-t border-t-[#dbe0e6]">
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        Lucia Fernandez
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        lucia.fernandez@example.com
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        2023-04-18
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                        <button
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full"
                        >
                          <span className="truncate">Activo</span>
                        </button>
                      </td>
                      <td className="table-dac12f2e-3742-403f-9770-41530751a2fd-column-600 h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em]">
                        Ver Detalles
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <style>{`
                @container(max-width:120px){.table-dac12f2e-3742-403f-9770-41530751a2fd-column-120{display: none;}}
                @container(max-width:240px){.table-dac12f2e-3742-403f-9770-41530751a2fd-column-240{display: none;}}
                @container(max-width:360px){.table-dac12f2e-3742-403f-9770-41530751a2fd-column-360{display: none;}}
                @container(max-width:480px){.table-dac12f2e-3742-403f-9770-41530751a2fd-column-480{display: none;}}
                @container(max-width:600px){.table-dac12f2e-3742-403f-9770-41530751a2fd-column-600{display: none;}}
              `}</style>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}