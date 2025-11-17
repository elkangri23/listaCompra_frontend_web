'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInvitationByHash } from '@/features/invitations/hooks/use-invitations';
import styles from './invitation.module.css';

export default function PublicInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  // Obtener detalles de la invitación
  const { data: invitationData, isLoading: isLoadingInvitation, error: invitationError } = useInvitationByHash(token);

  // Productos de ejemplo hardcodeados (10 productos típicos de supermercado)
  const previewItems = [
    "Leche entera 1L",
    "Pan integral 500g",
    "Huevos docena",
    "Aceite de oliva virgen extra",
    "Arroz largo 1kg",
    "Pasta espagueti 500g",
    "Tomates frescos",
    "Manzanas Golden",
    "Pollo pechuga fileteada",
    "Café molido natural 250g"
  ];

  const inviterName = invitationData?.inviterName || "Usuario";
  const listName = invitationData?.listName || "Lista de compra";

  const handleAcceptInvitation = () => {
    // TODO: Implement accept invitation logic with token
    alert('Funcionalidad de aceptar invitación (por implementar)');
    // router.push('/login'); // Redirigir después de aceptar
  };

  // Estado de carga
  if (isLoadingInvitation) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando invitación...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (invitationError) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar la invitación</h2>
              <p className="text-gray-600 mb-4">
                {invitationError instanceof Error ? invitationError.message : 'Error desconocido'}
              </p>
              <pre className="text-left bg-gray-100 p-4 rounded text-sm overflow-auto max-w-2xl">
                {JSON.stringify(invitationError, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verificar que tenemos datos
  if (!invitationData) {
    return (
      <div className={styles.root}>
        <div className={styles.container}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-yellow-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitación no encontrada</h2>
              <p className="text-gray-600">Esta invitación no existe o ha expirado.</p>
              <p className="text-sm text-gray-500 mt-4">Token: {token}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.contentContainer}>
            <div className={styles.heroSection}>
              <div className={styles.heroCard}>
                <div className={styles.heroContent}>
                  <div className={styles.heroText}>
                    <h1 className={styles.heroTitle}>
                      {inviterName} te ha invitado a colaborar en la lista de compra &apos;{listName}&apos;
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.previewSection}>
              <div className={styles.previewCard}>
                <div className={styles.previewScroll}>
                  <p className={styles.previewTitle}>Ejemplo de los productos de una lista:</p>
                  <ul className={styles.previewList}>
                    {previewItems.map((item: string, index: number) => (
                      <li key={index} className={styles.previewItem}>
                        <span className={styles.previewDot}></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={styles.previewFade}></div>
              </div>
              <p className={styles.previewHint}>
                Mostrando {previewItems.length} productos de ejemplo. ¡Acepta la invitación para ver y gestionar todos!
              </p>
            </div>
          </div>

          <div className={styles.actionWrapper}>
            <button 
              className={styles.acceptButton}
              onClick={handleAcceptInvitation}
              aria-label="Aceptar invitación y unirse a la lista"
            >
              <span>Aceptar y Unirme</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}