import './globals.css'
import type { Metadata } from 'next'
import { AppProviders } from '@/components/providers/app-providers'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'

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
    <html lang="es" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <AppProviders>
          <ThemeProvider>
            <main className="min-h-screen bg-background text-foreground">{children}</main>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  )
}

