
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutos - aumentado para reducir refetches
        refetchOnWindowFocus: false,
        refetchOnMount: false, // No refetch al montar si hay datos en cache
        refetchOnReconnect: false, // No refetch al reconectar
        retry: 0, // CRÍTICO: Sin retries para evitar rate limiting
        retryDelay: 0,
      },
      mutations: {
        retry: 0, // Sin retries en mutaciones tampoco
      },
    },
  }))

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
