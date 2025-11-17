'use client';

import React from 'react';
import { useInvitationByHash } from '../hooks/use-invitation-by-hash';
import { GeneralLoading } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import { useAcceptInvitation } from '../hooks/use-accept-invitation';

interface PublicListAccessProps {
  token: string;
}

export const PublicListAccess: React.FC<PublicListAccessProps> = ({ token }) => {
  const { data: invitation, isLoading, error } = useInvitationByHash(token);
  const { data: session } = useSession();
  const router = useRouter();
  const acceptInvitationMutation = useAcceptInvitation();

  const handleAccept = () => {
    if (session) {
      if (invitation?.data.invitacion.id) {
        acceptInvitationMutation.mutate(invitation.data.invitacion.id);
      }
    } else {
      localStorage.setItem('pendingInvitation', token);
      router.push('/login?callbackUrl=/invitations/' + token);
    }
  };

  if (isLoading) {
    return <GeneralLoading />;
  }

  if (error) {
    const status = (error as any).response?.status;
    let title = 'Error';
    let message = 'Ha ocurrido un error inesperado.';

    if (status === 404) {
      title = 'Enlace de invitación no válido';
      message = 'El enlace que has utilizado no parece ser correcto. Por favor, verifica el enlace e inténtalo de nuevo.';
    } else if (status === 410) {
      title = 'Enlace de invitación expirado';
      message = 'Este enlace de invitación ha expirado y ya no es válido. Pide a quien te invitó que te envíe uno nuevo.';
    } else if (status === 403) {
      title = 'Acceso revocado';
      message = 'El propietario de la lista ha cancelado esta invitación. Contacta con él si crees que es un error.';
    }

    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">{title}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')}>Volver al inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            ¡Te han invitado!
          </CardTitle>
          <CardDescription className="text-lg">
            <span className="font-semibold">{invitation.data.lista.propietarioNombre}</span> te ha invitado a colaborar en la lista:
          </CardDescription>
          <p className="text-2xl font-bold text-blue-600 pt-2">&quot;{invitation.data.lista.nombre}&quot;</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold">Detalles de la invitación:</h3>
            <p>Permiso: <span className="font-medium">{invitation.data.permiso.tipoPermiso === 'LECTURA' ? 'Solo Lectura' : 'Lectura y Escritura'}</span></p>
            <p>Expira en: <span className="font-medium">{new Date(invitation.data.invitacion.expiraEn).toLocaleString()}</span></p>
          </div>
          <Button onClick={handleAccept} className="w-full">
            {session ? 'Aceptar y Unirse a la Lista' : 'Iniciar Sesión para Aceptar'}
          </Button>
          {!session && (
            <p className="text-sm text-gray-500">
              ¿No tienes una cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate aquí</a>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
