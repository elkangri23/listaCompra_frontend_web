import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ayuda | ListaCompra',
  description:
    'Ayuda de ListaCompra: cómo empezar, crear y compartir listas, qué hace la IA y cómo gestionar tus datos. Y cómo contactar con nosotros.',
}

export default function HelpPage() {
  return (
    <div id="contenido" tabIndex={-1}
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f0f2f5] group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col items-center p-5">
        <div className="layout-content-container flex flex-col w-[720px] max-w-full py-5">
          <div className="bg-white rounded-lg px-6 py-8 sm:px-10">
            <p className="text-[#2563eb] text-lg font-bold leading-normal mb-1">🛒 ListaCompra</p>
            <h1 className="text-[#111418] text-3xl font-bold leading-tight mb-2">
              Ayuda
            </h1>
            <p className="text-[#5b6b82] text-sm font-normal leading-normal mb-6">
              Última actualización: 27 de noviembre de 2026
            </p>

            <p className="text-[#111418] text-base font-normal leading-relaxed mb-6">
              Aquí tienes las respuestas a lo que más se pregunta. Si no encuentras lo
              tuyo, escríbenos: te contesta una persona, no un robot.
            </p>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                1. Empezar
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Crea tu cuenta desde el registro con tu nombre, tu correo y una
                contraseña. Te llegará un código de 6 dígitos a ese correo: introdúcelo
                en la pantalla de verificación y listo. Si el código caduca (dura 15
                minutos), pide uno nuevo con el botón de reenviar. Para entrar después,
                usa tu correo y tu contraseña en el inicio de sesión.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                2. Listas y productos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Desde tu panel puedes crear una lista, ponerle nombre y añadir
                productos con su cantidad. Los productos se ordenan por categoría para
                que la compra sea más rápida, y puedes marcarlos como comprados
                tocando la casilla. Si haces siempre la misma compra, guárdala como
                plantilla y créala de nuevo con un toque.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                3. Compartir y colaborar
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Desde una lista puedes invitar por correo a tu familia o a tus
                compañeros de piso. Cuando aceptan, ven la misma lista que tú y los
                cambios se ven al momento: si uno tacha la leche en el súper, los
                demás lo ven tachado. Cada lista guarda su historial de cambios, así
                que siempre puedes ver quién añadió, cambió o tachó cada producto.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                4. Qué hace la IA
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                La inteligencia artificial te sugiere categorías para tus productos y
                aprende de tus hábitos de compra para ayudarte a hacer la lista. Solo
                usa los nombres de tus productos: tus datos no se venden ni se
                comparten con nadie.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                5. Tus datos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Desde tu perfil, en la pestaña «Privacidad», puedes descargar todos
                tus datos en un archivo y pedir el borrado de tu cuenta. El borrado
                tiene 30 días de gracia: durante ese tiempo tu cuenta queda
                desactivada y, si te arrepientes, escríbenos y la recuperamos.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                6. Contacto
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Para cualquier duda, problema o sugerencia, escríbenos a{' '}
                <a
                  className="text-[#2563eb] underline"
                  href="mailto:anthonymoles89@gmail.com"
                >
                  anthonymoles89@gmail.com
                </a>
                . Cuéntanos qué te ha pasado y con qué dispositivo, y te ayudamos.
              </p>
            </section>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/register"
                className="bg-[#2563eb] text-white font-bold px-4 py-2 rounded-lg no-underline"
              >
                Crear una cuenta
              </Link>
              <Link
                href="/login"
                className="bg-[#f0f2f5] text-[#111418] font-bold px-4 py-2 rounded-lg no-underline"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
