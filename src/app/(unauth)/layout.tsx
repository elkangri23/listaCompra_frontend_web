import * as React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-muted/20 px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
