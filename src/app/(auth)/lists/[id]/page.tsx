import Link from 'next/link'
import React from 'react'

export default function ListDetailPage() {
  // Placeholder for listId, as the actual listId would come from useParams()
  // For now, we'll use a static value or leave it as a placeholder for future integration.
  const listId = "list-id-placeholder";

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Lista de la compra familiar</p>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal">
                <span className="truncate">Compartir</span>
              </button>
            </div>
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label htmlFor="add-product" className="flex flex-col min-w-40 flex-1" aria-label="Añadir producto">
                <input id="add-product" className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border border-[#dbdfe6] bg-white focus:border-[#dbdfe6] h-14 placeholder:text-[#60708a] p-[15px] text-base font-normal leading-normal" placeholder="Añadir Producto" value="" />
              </label>
            </div>
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Frutas y Verduras</h2>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Manzanas</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">2 kg</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Plátanos</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">1 kg</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Tomates</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">500 g</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Lácteos</h2>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Leche</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">1 L</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Queso</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">200 g</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Huevos</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">12 unidades</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Carnes y Pescados</h2>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Pollo</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">500 g</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-7 items-center justify-center">
                  <input className="h-5 w-5 rounded border-[#dbdfe6] border-2 bg-transparent text-[#4387f4] checked:bg-[#4387f4] checked:border-[#4387f4] checked:bg-[image:--checkbox-tick-svg] focus:ring-0 focus:ring-offset-0 focus:border-[#dbdfe6] focus:outline-none" type="checkbox" />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">Salmón</p>
                  <p className="text-[#60708a] text-sm font-normal leading-normal line-clamp-2">300 g</p>
                </div>
              </div>
              <div className="shrink-0">
                <div className="text-[#111418] flex size-7 items-center justify-center" data-icon="Trash" data-size="24px" data-weight="regular">
                  <svg fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px" xmlns="http://www.w3.org/2000/svg">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="layout-content-container flex flex-col w-[360px]">
            <div className="pb-3">
              <div className="flex border-b border-[#dbdfe6] px-4 gap-8">
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-transparent text-[#60708a] pb-[13px] pt-4">
                  <p className="text-[#60708a] text-sm font-bold leading-normal tracking-[0.015em]">Sugerencias de IA</p>
                </button>
                <button className="flex flex-col items-center justify-center border-b-[3px] border-b-[#111418] text-[#111418] pb-[13px] pt-4">
                  <p className="text-[#111418] text-sm font-bold leading-normal tracking-[0.015em]">Detalles</p>
                </button>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-[#dbdfe6]">
                <p className="text-[#60708a] text-sm font-normal leading-normal">Fecha</p>
                <p className="text-[#111418] text-base font-medium leading-normal mt-1">12 de mayo de 2024</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-[#dbdfe6]">
                <p className="text-[#60708a] text-sm font-normal leading-normal">Tienda</p>
                <p className="text-[#111418] text-base font-medium leading-normal mt-1">Supermercado Central</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-[#dbdfe6]">
                <p className="text-[#60708a] text-sm font-normal leading-normal">Colaboradores</p>
                <p className="text-[#111418] text-base font-medium leading-normal mt-1">Elena, Carlos, Sofía</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
