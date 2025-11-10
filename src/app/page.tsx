import Link from 'next/link'
import React from 'react'
import styles from './homepage.module.css'

export default function Home() {
  const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDE8U1UT-rBuvIIeOgvjQu8qvAlAVMcJj6kUAGonWmsVpuStAMwSvseVemsWHmSlBfPflQQRr-gdeBtoCJCtmNNvX7dzl3GfJIisPHnO-bda55LmgxVwpn4mKOSm_gLRgCNX_zb8ZNoZ4Exbyhk_kuL2V-wT5Sk289iF5d_XPNcm2VUHBgNRqLgGBo_I6-AgDpevtUWtxbguPg9leYQU47C2rjYpiNpVAQGjsWdDn4V57yilsM5fCRPA0PyT0EA5psMIDjsR8scmASb'

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
              <path
                d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className={styles.title}>GroceryMate</h2>
        </div>

        <nav className={styles.nav} aria-label="main navigation">
          <div className={styles.links}>
            <Link href="#" className={styles.navLink}>Características</Link>
            <Link href="#" className={styles.navLink}>Precios</Link>
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
            <h1 className={styles.heroTitle}>Comprar, más inteligente, juntos.</h1>
            <p className={styles.heroSubtitle}>Simplifica tus compras con nuestra aplicación colaborativa. Planifica, comparte y compra de forma eficiente.</p>
            <Link href="/register" className={styles.cta}>Empieza Gratis</Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Características Clave</h2>
            <p className={styles.featuresSubtitle}>Descubre cómo nuestra aplicación transforma la forma en que compras.</p>
          </div>

          <div className={styles.grid}>
            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>
                {/* magic wand */}
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M48,64a8,8,0,0,1,8-8H72V40a8,8,0,0,1,16,0V56h16a8,8,0,0,1,0,16H88V88a8,8,0,0,1-16,0V72H56A8,8,0,0,1,48,64ZM184,192h-8v-8a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0v-8h8a8,8,0,0,0,0-16Zm56-48H224V128a8,8,0,0,0-16,0v16H192a8,8,0,0,0,0,16h16v16a8,8,0,0,0,16,0V160h16a8,8,0,0,0,0-16ZM219.31,80,80,219.31a16,16,0,0,1-22.62,0L36.68,198.63a16,16,0,0,1,0-22.63L176,36.69a16,16,0,0,1,22.63,0l20.68,20.68A16,16,0,0,1,219.31,80Zm-54.63,32L144,91.31l-96,96L68.68,208ZM208,68.69,187.31,48l-32,32L176,100.69Z"/></svg>
              </div>
              <h3 className={styles.cardTitle}>Sugerencias con IA</h3>
              <p className={styles.cardText}>Recibe sugerencias inteligentes basadas en tus compras anteriores y las de tus colaboradores.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>
                {/* users */}
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"/></svg>
              </div>
              <h3 className={styles.cardTitle}>Colaboración en Tiempo Real</h3>
              <p className={styles.cardText}>Edita y actualiza listas de compras en tiempo real con amigos y familiares.</p>
            </article>

            <article className={styles.card}>
              <div className={styles.icon} aria-hidden>
                {/* list checks */}
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M224,128a8,8,0,0,1-8,8H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128ZM128,72h88a8,8,0,0,0,0-16H128a8,8,0,0,0,0,16Zm88,112H128a8,8,0,0,0,0,16h88a8,8,0,0,0,0-16ZM82.34,42.34,56,68.69,45.66,58.34A8,8,0,0,0,34.34,69.66l16,16a8,8,0,0,0,11.32,0l32-32A8,8,0,0,0,82.34,42.34Zm0,64L56,132.69,45.66,122.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Zm0,64L56,196.69,45.66,186.34a8,8,0,0,0-11.32,11.32l16,16a8,8,0,0,0,11.32,0l32-32a8,8,0,0,0-11.32-11.32Z"/></svg>
              </div>
              <h3 className={styles.cardTitle}>Categorización Inteligente</h3>
              <p className={styles.cardText}>Organiza automáticamente los artículos por categoría para una compra más eficiente.</p>
            </article>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="#" className={styles.footerLink}>Política de Privacidad</Link>
            <Link href="#" className={styles.footerLink}>Términos de Servicio</Link>
          </div>
          <p className={styles.footerCopy}>© 2024 GroceryMate. Todos los derechos reservados.</p>
        </footer>
      </main>
    </div>
  )
}
