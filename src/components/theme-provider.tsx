'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme | 'system'
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'listacompra-theme',
}: ThemeProviderProps) {
  const systemTheme = getSystemTheme()
  const initialTheme = (defaultTheme === 'system' ? systemTheme : defaultTheme) as Theme

  const [theme, setThemeState] = React.useState<Theme>(initialTheme)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    if (stored) {
      setThemeState(stored)
      applyTheme(stored)
    } else {
      applyTheme(theme)
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event: MediaQueryListEvent) => {
      const nextTheme: Theme = event.matches ? 'dark' : 'light'
      if (!window.localStorage.getItem(storageKey)) {
        setThemeState(nextTheme)
        applyTheme(nextTheme)
      }
    }
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [storageKey, theme])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      if (typeof window === 'undefined') return
      setThemeState(nextTheme)
      window.localStorage.setItem(storageKey, nextTheme)
      applyTheme(nextTheme)
    },
    [storageKey],
  )

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}
