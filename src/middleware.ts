import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth/next-auth'

const publicRoutes = new Set(['/', '/login', '/register', '/forgot-password', '/terminos', '/privacidad', '/verify-email', '/help', '/logo.svg', '/favicon.svg'])
const authRoutes = new Set(['/login', '/register', '/forgot-password'])
const apiAuthPrefix = '/api/auth'

export default auth((request) => {
  const { nextUrl } = request

  if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.has(nextUrl.pathname)
  const session = request.auth
  const isAuthenticated = !!session && !session.error

  if (isPublicRoute) {
    if (isAuthenticated && authRoutes.has(nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }

    return NextResponse.next()
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.href)
    return NextResponse.redirect(loginUrl)
  }

  // Solo ADMIN en /admin/* (fase 1 del panel de administración). El rol
  // llega en la sesión (session.user.roles, del token o de /auth/me).
  // Sin rol ADMIN se redirige al panel principal.
  if (
    nextUrl.pathname === '/admin' ||
    nextUrl.pathname.startsWith('/admin/')
  ) {
    const roles =
      (session?.user as { roles?: string[] } | undefined)?.roles ?? []
    if (!roles.includes('ADMIN')) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
