import './globals.css'
import type { Metadata } from 'next'
import { AppProviders } from '@/components/providers/app-providers'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'ListaCompra — Sistema de diseño',
  description:
    'Base de componentes accesibles, tokens de diseño y soporte de temas para la aplicación ListaCompra.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="light">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      </head>
      <body className={inter.variable} style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
        <AppProviders>
          <ThemeProvider defaultTheme="light">
            {children}
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  )
}

