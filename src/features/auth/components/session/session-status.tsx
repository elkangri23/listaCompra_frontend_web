'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Text component stub
const Text = ({ children, ...props }: any) => <span {...props}>{children}</span>

export function SessionStatus() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <Text>Cargando...</Text>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Text>
          Sesión como <span className="font-bold">{session.user?.name}</span>
        </Text>
        <Badge variant="success">Activa</Badge>
        <Button onClick={() => signOut({ callbackUrl: '/' })}>Cerrar sesión</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <Text>No has iniciado sesión.</Text>
      <Badge variant="destructive">Inactiva</Badge>
    </div>
  )
}