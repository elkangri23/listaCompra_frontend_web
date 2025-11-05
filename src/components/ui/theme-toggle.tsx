'use client'

import * as React from 'react'

import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636" />
    </svg>
  )
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
    </svg>
  )
}

export function ThemeToggle({ preferredDarkLabel = 'Cambiar a tema claro', preferredLightLabel = 'Cambiar a tema oscuro' }: {
  preferredDarkLabel?: string
  preferredLightLabel?: string
}) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const toggleTheme = React.useCallback(() => {
    setTheme(isDark ? 'light' : 'dark')
  }, [isDark, setTheme])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={isDark ? preferredDarkLabel : preferredLightLabel}
      onClick={toggleTheme}
    >
      <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  )
}
