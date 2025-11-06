import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '../hooks/use-notifications';

export const NotificationCenter = () => {
  const { notifications, isLoading, error, markAsRead, deleteNotification } = useNotifications();

  if (isLoading) {
    return <Card className="w-full max-w-md"><CardContent>Cargando notificaciones...</CardContent></Card>;
  }

  if (error) {
    return <Card className="w-full max-w-md"><CardContent>Error al cargar notificaciones.</CardContent></Card>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Notificaciones</CardTitle>
        <Bell className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-0">
        {notifications.length === 0 ? (
          <p className="p-4 text-center text-muted-foreground">No tienes notificaciones nuevas.</p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start gap-4 p-4">
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">{notification.message}</p>
                      {!notification.read && (
                        <Badge variant="default" className="text-xs">Nueva</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: es })}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {!notification.read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Marcar como leído
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
