'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Collaborator, CollaboratorRole } from '@/types/Collaborator.types';
import { useRemoveCollaborator } from '../hooks/use-collaborators';
import { Crown, Pencil, Eye, Trash2, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface CollaboratorsListProps {
  listId: string;
  collaborators: Collaborator[];
  isOwner: boolean;
}

export function CollaboratorsList({
  listId,
  collaborators,
  isOwner,
}: CollaboratorsListProps) {
  const { data: session } = useSession();
  const removeCollaboratorMutation = useRemoveCollaborator();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (userId: string, userName: string) => {
    setRemovingId(userId);
    try {
      await removeCollaboratorMutation.mutateAsync({ listId, userId });
      toast.success(`${userName} ha sido eliminado de la lista`);
    } catch (error) {
      toast.error('Error al eliminar colaborador');
    } finally {
      setRemovingId(null);
    }
  };

  const getRoleBadge = (role: CollaboratorRole) => {
    switch (role) {
      case CollaboratorRole.OWNER:
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Crown className="h-3 w-3 mr-1" />
            Propietario
          </Badge>
        );
      case CollaboratorRole.EDITOR:
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Pencil className="h-3 w-3 mr-1" />
            Editor
          </Badge>
        );
      case CollaboratorRole.VIEWER:
        return (
          <Badge variant="outline" className="bg-gray-50">
            <Eye className="h-3 w-3 mr-1" />
            Visualizador
          </Badge>
        );
    }
  };

  if (collaborators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md bg-muted/20">
        <div className="rounded-full bg-muted p-3 mb-3">
          <Users className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium mb-1">Sin colaboradores</h3>
        <p className="text-xs text-muted-foreground">
          Invita a otros usuarios para colaborar en esta lista.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha de ingreso</TableHead>
            {isOwner && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {collaborators.map((collaborator) => {
            const isCurrentUser = session?.user?.id === collaborator.userId;
            const canRemove =
              isOwner &&
              collaborator.role !== CollaboratorRole.OWNER &&
              !isCurrentUser;

            return (
              <TableRow key={collaborator.id}>
                <TableCell className="font-medium">
                  {collaborator.userName}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">(Tú)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {collaborator.userEmail}
                </TableCell>
                <TableCell>{getRoleBadge(collaborator.role)}</TableCell>
                <TableCell>
                  {new Date(collaborator.joinedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                {isOwner && (
                  <TableCell className="text-right">
                    {canRemove ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={removingId === collaborator.userId}
                            className="hover:bg-red-50 hover:text-red-700"
                          >
                            {removingId === collaborator.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Eliminar
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar colaborador?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro de que quieres eliminar a{' '}
                              <strong>{collaborator.userName}</strong> de esta lista? Esta
                              acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleRemove(collaborator.userId, collaborator.userName)
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
