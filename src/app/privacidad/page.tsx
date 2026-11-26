import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad | ListaCompra',
  description:
    'Cómo tratamos tus datos en ListaCompra: qué recogemos, para qué, cuánto tiempo los guardamos y cómo ejercer tus derechos, incluido exportar tus datos y eliminar tu cuenta.',
}

export default function PrivacidadPage() {
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
              Política de Privacidad
            </h1>
            <p className="text-[#60708a] text-sm font-normal leading-normal mb-6">
              Última actualización: 26 de noviembre de 2026
            </p>

            <p className="text-[#111418] text-base font-normal leading-relaxed mb-6">
              Esta política explica qué datos recogemos, para qué los usamos y qué
              puedes hacer con ellos. Está escrita en lenguaje claro, sin letra
              pequeña escondida: si algo no se entiende, escríbenos y lo aclaramos.
            </p>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                1. Quién es el responsable
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                El responsable del tratamiento de tus datos es Antonio Moles Leiva.
                Para cualquier duda sobre esta política, o para ejercer tus derechos
                sobre tus datos, escríbenos a{' '}
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
                2. Qué datos recogemos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                Recogemos solo lo necesario para que el servicio funcione:
              </p>
              <ul className="list-disc pl-6 text-[#111418] text-base font-normal leading-relaxed">
                <li>
                  Tu cuenta: nombre, apellidos, correo electrónico y tu contraseña
                  cifrada. Nunca guardamos tu contraseña en claro.
                </li>
                <li>
                  Tus listas y su contenido: productos, cantidades, precios,
                  categorías, tiendas y plantillas.
                </li>
                <li>
                  Las invitaciones y los permisos de las listas que compartes o a
                  las que te invitan.
                </li>
                <li>
                  Tus ajustes: preferencias de la cuenta y, si la activas, la
                  autenticación en dos pasos o las passkeys.
                </li>
                <li>
                  Un registro de los cambios de tus listas, para mostrarte el
                  historial de cada lista.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                3. Para qué usamos tus datos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                Usamos tus datos solo para:
              </p>
              <ul className="list-disc pl-6 text-[#111418] text-base font-normal leading-relaxed">
                <li>
                  Prestar el servicio: que puedas entrar, crear listas y
                  compartirlas.
                </li>
                <li>
                  Mostrar tus listas a las personas que tú invites, y solo a
                  ellas.
                </li>
                <li>
                  Mantener el servicio seguro y prevenir abusos, como registros
                  automáticos o intentos de acceso no autorizados.
                </li>
                <li>
                  Avisarte de cosas del servicio, como cambios en estas
                  condiciones, y responder a tus mensajes.
                </li>
              </ul>
              <p className="text-[#111418] text-base font-normal leading-relaxed mt-2">
                No usamos tus datos para publicidad ni para venderlos a nadie.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                4. Funciones con inteligencia artificial
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                ListaCompra puede sugerirte categorías para tus productos y analizar
                tus hábitos de compra. Para hacerlo, los nombres de tus productos
                pueden enviarse al proveedor de inteligencia artificial configurado
                en el servidor. No se envían tu contraseña, tu correo ni tus datos
                de cuenta, y las sugerencias son orientativas: revísalas antes de
                aceptarlas.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                5. Con quién compartimos tus datos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                No vendemos tus datos. Solo los ven:
              </p>
              <ul className="list-disc pl-6 text-[#111418] text-base font-normal leading-relaxed">
                <li>
                  Las personas que tú invites a una lista: ven esa lista y su
                  contenido, y nada más.
                </li>
                <li>
                  El proveedor de inteligencia artificial configurado en el
                  servidor, que recibe solo los nombres de tus productos para
                  sugerirte categorías.
                </li>
                <li>
                  El proveedor de correo, cuando el envío de correos esté activo,
                  que recibe tu correo solo para enviarte los mensajes que tú
                  pidas, como invitaciones o confirmaciones.
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                6. Cuánto tiempo guardamos tus datos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Guardamos tus datos mientras tu cuenta esté activa. Cuando pides
                la eliminación de tu cuenta, la desactivamos de inmediato y no
                podrás volver a entrar; a los 30 días se eliminan definitivamente
                tu cuenta, tus listas y tus plantillas. En las listas de otras
                personas solo se te quita a ti como colaborador. Las copias de
                seguridad pueden conservar tus datos hasta 30 días más, y también
                se borran con ellas.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                7. Tus derechos
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed mb-2">
                Sobre tus datos tienes derecho a:
              </p>
              <ul className="list-disc pl-6 text-[#111418] text-base font-normal leading-relaxed">
                <li>
                  Acceder a ellos y corregirlos, desde tu perfil en la pestaña
                  «Perfil».
                </li>
                <li>
                  Exportarlos en un archivo JSON, desde tu perfil en la pestaña
                  «Privacidad».
                </li>
                <li>
                  Eliminar tu cuenta, también desde la pestaña «Privacidad» de tu
                  perfil o escribiéndonos por correo.
                </li>
                <li>
                  Pedirnos que limitemos su uso u oponerte a él, escribiéndonos por
                  correo.
                </li>
              </ul>
              <p className="text-[#111418] text-base font-normal leading-relaxed mt-2">
                Responderemos a tu solicitud lo antes posible. Si crees que no
                hemos tratado tus datos como debíamos, puedes reclamar ante la
                Agencia Española de Protección de Datos (AEPD).
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                8. Seguridad
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Tu contraseña se guarda cifrada, las conexiones al servicio van
                cifradas y el acceso a tus datos está limitado a lo necesario para
                que el servicio funcione. Aun así, ningún sistema es perfecto: si
                crees que alguien ha entrado en tu cuenta, cambia la contraseña y
                avísanos cuanto antes.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                9. Cookies
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Usamos solo las cookies necesarias para que el servicio funcione,
                como la de tu sesión y la protección contra el registro
                automático. No usamos cookies de publicidad ni de seguimiento de
                terceros.
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                10. Cambios en esta política
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Podemos actualizar esta política cuando el servicio cambie. Si el
                cambio es importante, te avisaremos por correo. Seguir usando
                ListaCompra después de un cambio significa que aceptas la política
                actualizada.
              </p>
            </section>

            <section className="mb-2">
              <h2 className="text-[#111418] text-lg font-bold leading-normal mb-2">
                11. Contacto
              </h2>
              <p className="text-[#111418] text-base font-normal leading-relaxed">
                Para cualquier pregunta sobre tus datos o para ejercer tus
                derechos, escríbenos a{' '}
                <a
                  href="mailto:anthonymoles89@gmail.com"
                  className="text-[#4387f4] underline"
                >
                  anthonymoles89@gmail.com
                </a>
                .
              </p>
            </section>

            <div className="border-t border-[#dbdfe6] mt-8 pt-6 flex flex-col sm:flex-row gap-4 justify-between">
              <Link href="/terminos" className="text-[#4387f4] font-bold underline">
                Términos de Servicio
              </Link>
              <Link href="/register" className="text-[#4387f4] font-bold underline">
                Crear una cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
