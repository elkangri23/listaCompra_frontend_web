import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth/next-auth'

const publicRoutes = new Set(['/', '/login', '/register', '/forgot-password'])
const authRoutes = new Set(['/login', '/register', '/forgot-password'])
const apiAuthPrefix = '/api/auth'

export default auth((request) => {
  const { nextUrl } = request

  if (nextUrl.pathname.startsWith(apiAuthPrefix)) {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.has(nextUrl.pathname)
  const isAuthenticated = Boolean(request.auth)

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

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
