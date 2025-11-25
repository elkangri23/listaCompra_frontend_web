'use client';

import { useState, useMemo } from 'react';
import { Bell, Check, CheckCheck, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'read' | 'unread'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    notifications,
    isLoading,
    markAsRead,
    deleteNotification,
    unreadCount,
  } = useNotifications(1, 1000); // Pedir todas las notificaciones

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];

    return notifications.filter((notif) => {
      // Filtro de búsqueda
      const matchesSearch = searchTerm === '' || 
        notif.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.type.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de tipo
      const matchesType = filterType === 'all' || notif.type === filterType;

      // Filtro de estado
      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'read' && notif.read) ||
        (filterStatus === 'unread' && !notif.read);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notifications, searchTerm, filterType, filterStatus]);

  // Tipos únicos de notificaciones
  const notificationTypes = useMemo(() => {
    if (!notifications) return [];
    return Array.from(new Set(notifications.map((n) => n.type)));
  }, [notifications]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMarkSelectedAsRead = async () => {
    for (const id of selectedIds) {
      markAsRead(id);
    }
    setSelectedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`¿Eliminar ${selectedIds.size} notificaciones seleccionadas?`)) {
      for (const id of selectedIds) {
        deleteNotification(id);
      }
      setSelectedIds(new Set());
    }
  };

  const handleMarkAsReadClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    // Retornar emoji según tipo
    const icons: Record<string, string> = {
      PRODUCTO_AÑADIDO: '➕',
      PRODUCTO_ELIMINADO: '🗑️',
      LISTA_COMPARTIDA: '🔗',
      PERMISO_OTORGADO: '🔓',
      INVITACION_ACEPTADA: '✅',
      COLABORADOR_AÑADIDO: '👥',
      default: '🔔',
    };
    return icons[tipo] || icons.default;
  };

  const getTypeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      PRODUCTO_AÑADIDO: 'bg-green-100 text-green-800',
      PRODUCTO_ELIMINADO: 'bg-red-100 text-red-800',
      LISTA_COMPARTIDA: 'bg-blue-100 text-blue-800',
      PERMISO_OTORGADO: 'bg-purple-100 text-purple-800',
      INVITACION_ACEPTADA: 'bg-teal-100 text-teal-800',
      COLABORADOR_AÑADIDO: 'bg-indigo-100 text-indigo-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[tipo] || colors.default;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notificaciones</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={async () => {
                const unreadNotifs = notifications.filter(n => !n.read);
                for (const notif of unreadNotifs) {
                  markAsRead(notif.id);
                }
              }}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {notificationTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Sin leer</SelectItem>
              <SelectItem value="read">Leídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredNotifications.length > 0 && (
          <div className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              checked={selectedIds.size === filteredNotifications.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-gray-600">
              {selectedIds.size > 0
                ? `${selectedIds.size} seleccionadas`
                : 'Seleccionar todas'}
            </span>
            {selectedIds.size > 0 && (
              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkSelectedAsRead}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como leídas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Cargando notificaciones...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {notifications && notifications.length === 0
              ? 'No tienes notificaciones'
              : 'No se encontraron notificaciones'}
          </h3>
          <p className="text-gray-600">
            {notifications && notifications.length === 0
              ? 'Cuando tengas actividad en tus listas, aparecerán aquí'
              : 'Intenta con otros filtros de búsqueda'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${
                !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedIds.has(notification.id)}
                    onCheckedChange={() => handleSelectNotification(notification.id)}
                  />
                  <button
                    type="button"
                    className="flex-1 cursor-pointer text-left"
                    onClick={() => handleMarkAsReadClick(notification.id, notification.read)}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type.replace(/_/g, ' ')}
                        </Badge>
                        {!notification.read && (
                          <Badge variant="default" className="text-xs">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-900">{notification.message}</p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
