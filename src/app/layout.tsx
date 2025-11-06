import './globals.css'
import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { AppProviders } from '@/components/providers/app-providers'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-display' })

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} min-h-screen bg-background font-sans antialiased`}>
        <AppProviders>
          <ThemeProvider>
            <main className="min-h-screen bg-background text-foreground">{children}</main>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  )
}

