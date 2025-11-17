'use client';

import React from 'react';
import { useInvitationByHash } from '../hooks/use-invitation-by-hash';
import { GeneralLoading } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Shield, 
  UserPlus, 
  XCircle,
  LogIn,
  UserCircle2
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PublicListAccessProps {
  token: string;
}

export const PublicListAccess: React.FC<PublicListAccessProps> = ({ token }) => {
  const { data: invitation, isLoading, error } = useInvitationByHash(token);
  const { data: session } = useSession();
  const router = useRouter();

  const handleAccept = () => {
    if (session) {
      // El usuario ya tiene acceso a la lista simplemente accediendo con el hash válido
      // Redirigir directamente a la lista
      if (invitation?.data.lista.id) {
        router.push(`/lists/${invitation.data.lista.id}`);
        toast.success(`¡Te has unido a la lista "${invitation.data.lista.nombre}"!`);
      }
    } else {
      // Guardar el token de invitación y redirigir al login
      localStorage.setItem('pendingInvitation', token);
      router.push('/login?callbackUrl=/invitations/' + token);
    }
  };

  // Estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center" aria-hidden="true">
              <Mail className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verificando invitación...
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Por favor espera mientras validamos tu enlace de invitación
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <div className="flex justify-center" role="status" aria-live="polite" aria-label="Cargando invitación">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estados de error
  if (error) {
    const status = (error as any).response?.status;
    let title = 'Error al cargar la invitación';
    let message = 'Ha ocurrido un error inesperado al procesar tu invitación. Por favor, intenta nuevamente más tarde.';
    let Icon = AlertCircle;
    let iconColor = 'text-red-600';
    let bgColor = 'bg-red-50';
    let borderColor = 'border-red-200';

    if (status === 404) {
      Icon = XCircle;
      title = 'Invitación no encontrada';
      message = 'El enlace que has utilizado no es válido o ha sido eliminado. Verifica el enlace con quien te invitó.';
    } else if (status === 410) {
      Icon = Clock;
      iconColor = 'text-orange-600';
      bgColor = 'bg-orange-50';
      borderColor = 'border-orange-200';
      title = 'Invitación expirada';
      message = 'Este enlace de invitación ya no está disponible. Solicita a quien te invitó que genere un nuevo enlace.';
    } else if (status === 403) {
      Icon = Shield;
      iconColor = 'text-yellow-600';
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-200';
      title = 'Acceso denegado';
      message = 'Esta invitación ha sido revocada por el propietario de la lista. Contacta con quien te invitó para más información.';
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className={`mx-auto w-16 h-16 ${bgColor} rounded-full flex items-center justify-center`} aria-hidden="true">
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <Alert className={`${bgColor} ${borderColor}`}>
              <AlertCircle className={`h-4 w-4 ${iconColor}`} aria-hidden="true" />
              <AlertTitle className="font-semibold">Información</AlertTitle>
              <AlertDescription className="text-sm">
                {message}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/')} 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                aria-label="Volver a la página de inicio"
              >
                Volver al inicio
              </Button>
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline"
                className="w-full h-11 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                aria-label="Ir a iniciar sesión"
              >
                <LogIn className="w-4 h-4 mr-2" aria-hidden="true" />
                Iniciar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sin datos
  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
        <Card className="w-full max-w-lg shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center" aria-hidden="true">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              No se encontró la invitación
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              No pudimos cargar los detalles de tu invitación
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <Button 
              onClick={() => router.push('/')} 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formatear fecha de expiración
  const expirationDate = new Date(invitation.data.invitacion.expiraEn);
  const isExpiringSoon = expirationDate.getTime() - Date.now() < 24 * 60 * 60 * 1000; // < 24 horas
  const permissionLabel = invitation.data.permiso.tipoPermiso === 'LECTURA' 
    ? 'Solo lectura' 
    : 'Lectura y escritura';
  const permissionDescription = invitation.data.permiso.tipoPermiso === 'LECTURA'
    ? 'Podrás ver los productos de la lista, pero no modificarlos'
    : 'Podrás ver y modificar los productos de la lista';

  // Estado exitoso - Invitación válida
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        {/* Header con icono destacado */}
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg" aria-hidden="true">
            <UserPlus className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-gray-900">
              ¡Has sido invitado!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700">
              <span className="font-semibold text-blue-600">{invitation.data.lista.propietarioNombre}</span> te ha invitado a colaborar
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Nombre de la lista destacado */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
              Lista de compra
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {invitation.data.lista.nombre}
            </h2>
          </div>

          {/* Detalles de la invitación */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
              Detalles de la invitación
            </h3>
            
            <div className="space-y-3">
              {/* Permiso */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    Nivel de acceso
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {permissionLabel}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {permissionDescription}
                  </p>
                </div>
              </div>

              {/* Expiración */}
              <div className={`flex items-start gap-3 p-3 rounded-lg ${isExpiringSoon ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${isExpiringSoon ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <Clock className={`w-4 h-4 ${isExpiringSoon ? 'text-orange-600' : 'text-gray-600'}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">
                    Fecha de expiración
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {expirationDate.toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {isExpiringSoon && (
                    <p className="text-sm text-orange-700 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" aria-hidden="true" />
                      Esta invitación expira pronto
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleAccept}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all"
              aria-label={session ? 'Acceder a la lista compartida' : 'Iniciar sesión para acceder a la lista'}
            >
              {session ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" aria-hidden="true" />
                  Acceder a la lista
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" aria-hidden="true" />
                  Iniciar sesión para acceder
                </>
              )}
            </Button>

            {!session && (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  ¿No tienes una cuenta?
                </p>
                <Button
                  onClick={() => router.push('/register?callbackUrl=/invitations/' + token)}
                  variant="outline"
                  className="w-full h-11 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-colors"
                  aria-label="Crear una cuenta nueva"
                >
                  <UserCircle2 className="w-5 h-5 mr-2" aria-hidden="true" />
                  Crear cuenta gratis
                </Button>
              </div>
            )}
          </div>

          {/* Información adicional */}
          {!session && (
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <AlertTitle className="text-blue-900 font-semibold">Necesitas una cuenta</AlertTitle>
              <AlertDescription className="text-sm text-blue-800">
                Para unirte a esta lista compartida, primero debes iniciar sesión o crear una cuenta gratuita.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
