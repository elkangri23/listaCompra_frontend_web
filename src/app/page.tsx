import Link from 'next/link'
import { Sparkles, Users, ListChecks } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-white">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f5] px-4 md:px-10 py-3">
          <div className="flex items-center gap-4 text-[#111418]">
            <div className="size-8">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">ListaCompra</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a className="text-[#111418] text-sm font-medium leading-normal hover:text-[#4387f4] transition-colors" href="#caracteristicas">
                Características
              </a>
              <a className="text-[#111418] text-sm font-medium leading-normal hover:text-[#4387f4] transition-colors" href="#precios">
                Precios
              </a>
            </div>
            <div className="flex gap-2">
              <Link href="/register">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#3577e4] transition-colors">
                  <span className="truncate">Registrarse</span>
                </button>
              </Link>
              <Link href="/login">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e1e4e8] transition-colors">
                  <span className="truncate">Iniciar Sesión</span>
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Hero Section */}
            <div className="@container">
              <div className="@[480px]:p-4">
                <div
                  className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80")',
                  }}
                >
                  <div className="flex flex-col gap-2 text-center">
                    <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em]">
                      Comprar, más inteligente, juntos.
                    </h1>
                    <h2 className="text-white text-sm font-normal leading-normal @[480px]:text-base @[480px]:font-normal @[480px]:leading-normal">
                      Simplifica tus compras con nuestra aplicación colaborativa. Planifica, comparte y compra de forma eficiente.
                    </h2>
                  </div>
                  <Link href="/register">
                    <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 bg-[#4387f4] text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base @[480px]:font-bold @[480px]:leading-normal @[480px]:tracking-[0.015em] hover:bg-[#3577e4] transition-colors">
                      <span className="truncate">Empieza Gratis</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div id="caracteristicas" className="flex flex-col gap-10 px-4 py-10 @container">
              <div className="flex flex-col gap-4">
                <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight @[480px]:text-4xl @[480px]:font-black @[480px]:leading-tight @[480px]:tracking-[-0.033em] max-w-[720px]">
                  Características Clave
                </h1>
                <p className="text-[#111418] text-base font-normal leading-normal max-w-[720px]">
                  Descubre cómo nuestra aplicación transforma la forma en que compras.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-0">
                {/* IA Suggestions */}
                <div className="flex flex-1 gap-3 rounded-lg border border-[#dbdfe6] bg-white p-4 flex-col">
                  <div className="text-[#111418]">
                    <Sparkles size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#111418] text-base font-bold leading-tight">Sugerencias con IA</h2>
                    <p className="text-[#60708a] text-sm font-normal leading-normal">
                      Recibe sugerencias inteligentes basadas en tus compras anteriores y las de tus colaboradores.
                    </p>
                  </div>
                </div>

                {/* Collaboration */}
                <div className="flex flex-1 gap-3 rounded-lg border border-[#dbdfe6] bg-white p-4 flex-col">
                  <div className="text-[#111418]">
                    <Users size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#111418] text-base font-bold leading-tight">Colaboración en Tiempo Real</h2>
                    <p className="text-[#60708a] text-sm font-normal leading-normal">
                      Edita y actualiza listas de compras en tiempo real con amigos y familiares.
                    </p>
                  </div>
                </div>

                {/* Smart Categorization */}
                <div className="flex flex-1 gap-3 rounded-lg border border-[#dbdfe6] bg-white p-4 flex-col">
                  <div className="text-[#111418]">
                    <ListChecks size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#111418] text-base font-bold leading-tight">Categorización Inteligente</h2>
                    <p className="text-[#60708a] text-sm font-normal leading-normal">
                      Organiza automáticamente los artículos por categoría para una compra más eficiente.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="flex flex-col gap-6 px-5 py-10 text-center border-t border-[#f0f2f5]">
              <div className="flex flex-wrap items-center justify-center gap-6">
                <button className="text-[#60708a] text-base font-normal leading-normal hover:text-[#4387f4] transition-colors bg-transparent border-none cursor-pointer">
                  Política de Privacidad
                </button>
                <button className="text-[#60708a] text-base font-normal leading-normal hover:text-[#4387f4] transition-colors bg-transparent border-none cursor-pointer">
                  Términos de Servicio
                </button>
              </div>
              <p className="text-[#60708a] text-base font-normal leading-normal">
                © 2025 ListaCompra. Todos los derechos reservados.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

