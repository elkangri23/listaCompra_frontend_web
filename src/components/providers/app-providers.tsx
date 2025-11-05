'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import * as React from 'react'

import { ThemeProvider, type ThemeProviderProps } from '@/components/theme-provider'

interface AppProvidersProps {
  children: React.ReactNode
  session?: Session | null
  themeProps?: Partial<ThemeProviderProps>
}

export function AppProviders({ children, session, themeProps }: AppProvidersProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchWhenOffline={false}>
      <ThemeProvider {...themeProps}>{children}</ThemeProvider>
    </SessionProvider>
  )
}
