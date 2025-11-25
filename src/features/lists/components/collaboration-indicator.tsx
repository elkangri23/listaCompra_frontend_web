import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

interface ActiveUser {
  userId: string;
  userName: string;
  lastActivity: string;
}

interface CollaborationIndicatorProps {
  listId: string;
  onConflictDetected?: () => void;
}

/**
 * Indicador de colaboración en tiempo real
 * Muestra qué usuarios están editando la lista actualmente mediante polling
 */
export function CollaborationIndicator({
  listId,
  onConflictDetected,
}: CollaborationIndicatorProps) {
  const { data: session } = useSession();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Registrar actividad propia en el servidor (simulated)
    const registerActivity = () => {
      // En producción: POST /lists/:listId/activity con userId y timestamp
      setLastUpdate(new Date());
    };

    // Obtener usuarios activos del servidor (simulated)
    const fetchActiveUsers = async () => {
      try {
        // En producción: GET /lists/:listId/active-users
        // Por ahora, simulamos con mock data
        
        // Simular detección de usuarios activos
        // En producción real esto vendría del servidor
        const mockActiveUsers: ActiveUser[] = [];
        
        // Si detectamos cambios recientes, notificar
        if (onConflictDetected && mockActiveUsers.length > 0) {
          // Verificar si hubo cambios desde la última actualización
          const hasRecentChanges = mockActiveUsers.some(
            (user) =>
              new Date(user.lastActivity) > lastUpdate &&
              user.userId !== session?.user?.id
          );
          
          if (hasRecentChanges) {
            onConflictDetected();
          }
        }
        
        setActiveUsers(
          mockActiveUsers.filter((user) => user.userId !== session?.user?.id)
        );
      } catch (error) {
        console.error('Error fetching active users:', error);
      }
    };

    // Registrar actividad cada 5 segundos
    const activityInterval = setInterval(registerActivity, 5000);
    
    // Polling de usuarios activos cada 10 segundos
    const pollingInterval = setInterval(fetchActiveUsers, 10000);
    
    // Fetch inicial
    fetchActiveUsers();
    registerActivity();

    return () => {
      clearInterval(activityInterval);
      clearInterval(pollingInterval);
    };
  }, [listId, session, lastUpdate, onConflictDetected]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium">Editando ahora:</span>
      </div>
      <div className="flex gap-1">
        {activeUsers.map((user) => (
          <Badge key={user.userId} variant="secondary" className="text-xs">
            👤 {user.userName}
          </Badge>
        ))}
      </div>
    </div>
  );
}
