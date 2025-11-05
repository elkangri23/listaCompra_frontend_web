import './globals.css'
import type { Metadata } from 'next'
import { DM_Sans, Inter } from 'next/font/google'

import { AppProviders } from '@/components/providers/app-providers'

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-display' })

export const metadata: Metadata = {
  title: 'ListaCompra — Plataforma colaborativa',
  description:
    'Gestiona tus listas colaborativas con autenticación segura, componentes accesibles y soporte de temas personalizables.',
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
          <main className="min-h-screen bg-background text-foreground">{children}</main>
        </AppProviders>
      </body>
    </html>
  )
}
