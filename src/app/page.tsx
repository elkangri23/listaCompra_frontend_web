import Link from 'next/link'
import React from 'react'
import { CookieBanner } from '@/components/cookie-banner'
import styles from './homepage.module.css'

export default function Home() {
  const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE8U1UT-rBuvIIeOgvjQu8qvAlAVMcJj6kUAGonWmsVpuStAMwSvseVemsWHmSlBfPflQQRr-gdeBtoCJCtmNNvX7dzl3GfJIisPHnO-bda55LmgxVwpn4mKOSm_gLRgCNX_zb8ZNoZ4Exbyhk_kuL2V-wT5Sk289iF5d_XPNcm2VUHBgNRqLgGBo_I6-AgDpevtUWtxbguPg9leYQU47C2rjYpiNpVAQGjsWdDn4V57yilsM5fCRPA0PyT0EA5psMIDjsR8scmASb'

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden>
            🛒
          </span>
          <h2 className={styles.title}>ListaCompra</h2>
        </div>

        <nav className={styles.nav} aria-label="main navigation">
          <div className={styles.links}>
            <Link href="#como-funciona" className={styles.navLink}>Cómo funciona</Link>
            <Link href="#para-quien" className={styles.navLink}>Para quién</Link>
            <Link href="#preguntas" className={styles.navLink}>Preguntas</Link>
          </div>
          <div className={styles.actions}>
            <Link href="/register" className={styles.primaryButton}>Registrarse</Link>
            <Link href="/login" className={styles.ghostButton}>Iniciar Sesión</Link>
          </div>
        </nav>
      </header>

      <main className={styles.container}>
        <section className={styles.hero} style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.12), rgba(0,0,0,0.45)), url(${heroImage})` }}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>La lista de la compra, por fin en común.</h1>
            <p className={styles.heroSubtitle}>Crea tu lista, compártela con quien vive contigo y tachad juntos en el súper. Sin líos, sin papeles y sin que se te olvide la leche.</p>
            <div className={styles.heroCtas}>
              <Link href="/register" className={styles.cta}>Crear tu cuenta gratis</Link>
              <Link href="#como-funciona" className={styles.ctaSecondary}>Ver cómo funciona</Link>
            </div>
          </div>
        </section>

        <section id="como-funciona" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Cómo funciona</h2>
            <p className={styles.sectionSubtitle}>De cero a la compra hecha en cuatro pasos, sin instalar nada.</p>
          </div>

          <div className={styles.steps}>
            <article className={styles.step}>
              <span className={styles.stepNum} aria-hidden>1</span>
              <h3 className={styles.stepTitle}>Crea tu cuenta</h3>
              <p className={styles.stepText}>Te registras con tu correo y lo verificas con un código. Gratis, sin tarjetas ni sorpresas.</p>
            </article>

            <article className={styles.step}>
              <span className={styles.stepNum} aria-hidden>2</span>
              <h3 className={styles.stepTitle}>Crea tu lista</h3>
              <p className={styles.stepText}>Añade productos a mano o reutiliza una de tus plantillas: la compra de la semana, la del mes…</p>
            </article>

            <article className={styles.step}>
              <span className={styles.stepNum} aria-hidden>3</span>
              <h3 className={styles.stepTitle}>Compártela</h3>
              <p className={styles.stepText}>Invita por correo a tu familia o a tus compañeros de piso. Ven la misma lista, al momento.</p>
            </article>

            <article className={styles.step}>
              <span className={styles.stepNum} aria-hidden>4</span>
              <h3 className={styles.stepTitle}>Comprad y tachad</h3>
              <p className={styles.stepText}>Cada uno tacha desde su móvil en el súper y los demás lo ven en tiempo real. Nada de comprar dos veces lo mismo.</p>
            </article>
          </div>
        </section>

        <section id="para-quien" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Para quién</h2>
            <p className={styles.sectionSubtitle}>Si la compra la hacéis entre varias personas, esto es para vosotros.</p>
          </div>

          <div className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>👨‍👩‍👧‍👦</div>
              <h3 className={styles.cardTitle}>Familias</h3>
              <p className={styles.cardText}>La compra de la semana entre todos: cada uno añade lo que falta y nadie tiene que adivinarlo.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>🏠</div>
              <h3 className={styles.cardTitle}>Parejas y compañeros de piso</h3>
              <p className={styles.cardText}>Que no se te olvide nada y que no compréis dos veces lo mismo por no haberos avisado.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>🗂️</div>
              <h3 className={styles.cardTitle}>Gente organizada</h3>
              <p className={styles.cardText}>Plantillas, categorías y tus hábitos de compra para que la lista casi se haga sola.</p>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Todo lo que trae</h2>
            <p className={styles.sectionSubtitle}>Lo que de verdad hace la app, sin humo.</p>
          </div>

          <div className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>✨</div>
              <h3 className={styles.cardTitle}>Sugerencias con IA</h3>
              <p className={styles.cardText}>Te sugiere productos y categorías a partir de tus compras anteriores y las de tus colaboradores.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>👥</div>
              <h3 className={styles.cardTitle}>Colaboración en tiempo real</h3>
              <p className={styles.cardText}>Editáis la misma lista a la vez, cada uno desde su móvil, y los cambios se ven al momento.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>🏷️</div>
              <h3 className={styles.cardTitle}>Categorización inteligente</h3>
              <p className={styles.cardText}>Tus productos se ordenan solos por categoría para que la compra en el súper sea más rápida.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>📋</div>
              <h3 className={styles.cardTitle}>Plantillas</h3>
              <p className={styles.cardText}>Guarda tus listas de siempre como plantillas y créalas de nuevo con un toque.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>🕘</div>
              <h3 className={styles.cardTitle}>Historial de cambios</h3>
              <p className={styles.cardText}>Cada lista guarda quién añadió, cambió o tachó cada producto. Si algo desaparece, sabes quién fue.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>🔐</div>
              <h3 className={styles.cardTitle}>Tus datos, tuyos</h3>
              <p className={styles.cardText}>Exporta todo lo tuyo en un archivo y borra tu cuenta cuando quieras, desde tu perfil.</p>
            </article>
          </div>
        </section>

        <section id="preguntas" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Preguntas frecuentes</h2>
            <p className={styles.sectionSubtitle}>Lo que nos preguntan antes de registrarse.</p>
          </div>

          <div className={styles.faq}>
            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>¿Es gratis?</summary>
              <p className={styles.faqAnswer}>Sí. Crear tu cuenta y usar ListaCompra es gratis. No hay suscripciones ni pagos.</p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>¿Necesito instalar algo?</summary>
              <p className={styles.faqAnswer}>No. Funciona en el navegador del móvil y del ordenador, sin descargar ninguna aplicación.</p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>¿Cómo comparto una lista?</summary>
              <p className={styles.faqAnswer}>Desde la lista, invita por correo a quien quieras. Cuando acepta la invitación, ve la misma lista que tú, al momento.</p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>¿Qué hace la IA con mis compras?</summary>
              <p className={styles.faqAnswer}>Solo te sugiere categorías y aprende de tus hábitos para ayudarte a hacer la lista. Tus datos no se venden ni se comparten con nadie.</p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>¿Puedo ver quién cambió qué en una lista?</summary>
              <p className={styles.faqAnswer}>Sí. Cada lista tiene su historial de cambios: quién añadió, cambió o tachó cada producto y cuándo.</p>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>¿Puedo exportar mis datos o borrar mi cuenta?</summary>
              <p className={styles.faqAnswer}>Sí, desde tu perfil, en la pestaña «Privacidad»: puedes descargar todos tus datos en un archivo y pedir el borrado de tu cuenta, con 30 días de gracia por si te arrepientes.</p>
            </details>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.helpStrip}>
            <h3 className={styles.helpStripTitle}>¿Necesitas ayuda?</h3>
            <p className={styles.helpStripText}>Si algo no te funciona o tienes una duda, escríbenos. Te contesta una persona, no un robot.</p>
            <Link href="/help" className={styles.primaryButton}>Ir a la ayuda</Link>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/privacidad" className={styles.footerLink}>Política de Privacidad</Link>
            <Link href="/terminos" className={styles.footerLink}>Términos de Servicio</Link>
            <Link href="/help" className={styles.footerLink}>Ayuda</Link>
          </div>
          <p className={styles.footerCopy}>© {new Date().getFullYear()} ListaCompra. Hecho con cariño en Granada.</p>
        </footer>
      </main>

      <CookieBanner />
    </div>
  )
}
