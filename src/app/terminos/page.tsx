import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Servicio | ListaCompra',
  description:
    'Condiciones de uso de ListaCompra: qué es el servicio, tu cuenta, tus datos y el uso aceptable. En lenguaje claro, sin letra pequeña escondida.',
}

export default function TerminosPage() {
  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-[#f0f2f5] group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col items-center p-5">
        <div className="layout-content-container flex flex-col w-[720px] max-w-full py-5">
          <div className="bg-white rounded-lg px-6 py-8 sm:px-10">
            <p className="text-[#4387f4] text-lg font-bold leading-normal mb-1">🛒 ListaCompra</p>
            <h1 className="text-[#111418] text-3xl font-bold leading-tight mb-2">
              Términos de Servicio
            </h1>
            <p className="text-[#60708a] text-sm font-normal leading-normal mb-6">
              Última actualización: 26 de noviembre de 2026
            </p>

            <p className="text-[#111418] text-base font-normal leading-relaxed mb-6">
              Estos términos explican cómo funciona ListaCompra y qué se espera de ti al
              usarlo. Están escritos en lenguaje claro y sin letra pequeña escondida: si
              algo no se entiende, escríbenos y lo aclaramos. Al crear tu cuenta aceptas
              estos términos.
            </p>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                1. Qué es ListaCompra
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                ListaCompra es una aplicación web para crear listas de la compra y
                compartirlas con tu familia o tu equipo: cada uno ve lo mismo, marca lo
                que ya está comprado y añade lo que falta. Es un proyecto personal y de
                momento es gratuito.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                2. Quién está detrás
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                El servicio lo presta Antonio Moles Leiva. Para cualquier duda, para
                pedir la eliminación de tu cuenta o para ejercer tus derechos sobre tus
                datos, escríbenos a{' '}
                <a
                  href="mailto:anthonymoles89@gmail.com"
                  className="text-[#4387f4] underline"
                >
                  anthonymoles89@gmail.com
                </a>
                .
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                3. Tu cuenta
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                Para usar ListaCompra necesitas una cuenta con tu nombre, tu correo y una
                contraseña. Tu cuenta es personal:
              </p>
              <ul className="list-disc pl-6 text-[#111418] text-base font-normal leading-relaxed">
                <li>Guarda bien tu contraseña y no la compartas con nadie.</li>
                <li>Lo que se haga desde tu cuenta se entiende hecho por ti.</li>
                <li>
                  Si crees que alguien ha entrado en tu cuenta, cambia la contraseña y
                  avísanos.
                </li>
                <li>Puedes darte de baja cuando quieras pidiéndolo por correo.</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                4. Qué puedes hacer con el servicio
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Crear listas, añadir y organizar productos, compartir listas con otras
                personas, aceptar invitaciones a listas de otros y crear plantillas para
                reutilizar tus listas habituales. Las listas que compartes las ven solo
                las personas que tú invites.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                5. Uso aceptable
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                Usa el servicio con sentido común. No está permitido:
              </p>
              <ul className="list-disc pl-6 text-[#111418] text-base font-normal leading-relaxed">
                <li>Usarlo para nada ilegal o para engañar a otros.</li>
                <li>
                  Intentar acceder a cuentas o listas que no te pertenecen, o romper la
                  seguridad del servicio.
                </li>
                <li>Subir contenido ilegal, ofensivo o que no sea tuyo.</li>
                <li>
                  Abusar del servicio con envíos masivos o programas automáticos que lo
                  saturen.
                </li>
              </ul>
              <p className="text-[#111418] text-base font-normal leading-relaxed mt-2">
                Si detectamos un uso así, podremos suspender o cerrar la cuenta.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                6. Tus listas y tu contenido
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Tus listas y tus productos son tuyos. Nos das permiso solo para
                guardarlos y mostrarlos a las personas con las que tú los compartes.
                No vendemos tu contenido ni lo usamos para publicidad.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                7. Funciones con inteligencia artificial
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                ListaCompra puede sugerirte categorías para tus productos y analizar tus
                hábitos de compra. Para hacerlo, los nombres de tus productos pueden
                enviarse al proveedor de inteligencia artificial configurado en el
                servidor. No se envían tu contraseña ni tus datos de cuenta, y las
                sugerencias son orientativas: revísalas antes de aceptarlas.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                8. Tus datos personales
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                Guardamos lo necesario para que el servicio funcione: tu nombre, tu
                correo, tu contraseña cifrada, tus listas y tus ajustes. No vendemos tus
                datos a nadie.
              </p>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Tienes derecho a acceder a tus datos, corregirlos y pedir que los
                eliminemos. Para ejercer estos derechos, o para pedir la eliminación de
                tu cuenta, escribe a{' '}
                <a
                  href="mailto:anthonymoles89@gmail.com"
                  className="text-[#4387f4] underline"
                >
                  anthonymoles89@gmail.com
                </a>
                .
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                9. Disponibilidad del servicio
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Hacemos lo posible por que ListaCompra esté siempre disponible, pero al
                ser un proyecto personal no podemos garantizarlo: puede haber paradas
                por mantenimiento o fallos puntuales. Hacemos copias de seguridad, pero
                te recomendamos no confiarle la única copia de nada imprescindible.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                10. Cambios en estos términos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Podemos actualizar estos términos cuando el servicio cambie. Si el cambio
                es importante, te avisaremos por correo. Seguir usando ListaCompra
                después de un cambio significa que aceptas los términos actualizados.
              </p>
            </section>

            <section className="mb-2">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                11. Ley aplicable
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Estos términos se rigen por la legislación española. Cualquier disputa
                se resolverá en los juzgados de Granada.
              </p>
            </section>

            <div className="border-t border-[#dbdfe6] mt-8 pt-6 flex flex-col sm:flex-row gap-4 justify-between">
              <Link href="/register" className="text-[#4387f4] font-bold underline">
                Crear una cuenta
              </Link>
              <Link href="/login" className="text-[#4387f4] font-bold underline">
                ¿Ya tienes cuenta? Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
