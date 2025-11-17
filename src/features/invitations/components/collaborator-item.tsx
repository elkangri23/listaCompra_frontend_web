'use client';

import React from 'react';
import { ActiveInvitationDto } from '@/types/dtos/invitations';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, Trash2, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useUpdatePermissions } from '../hooks/use-update-permissions';
import { useRevokeAccess } from '../hooks/use-revoke-access';

interface CollaboratorItemProps {
  listId: string;
  collaborator: ActiveInvitationDto;
  isOwner: boolean;
  currentUserId: string;
}

const roleMapping = {
  OWNER: 'Propietario',
  EDITOR: 'Editor',
  VIEWER: 'Lector',
};

const badgeVariantMapping = {
  OWNER: 'default',
  EDITOR: 'secondary',
  VIEWER: 'outline',
};

export const CollaboratorItem: React.FC<CollaboratorItemProps> = ({ listId, collaborator, isOwner, currentUserId }) => {
  const isCurrentUser = collaborator.id === currentUserId;

  const getRoleFromPermissions = (permissions: string[]): 'OWNER' | 'EDITOR' | 'VIEWER' => {
    if (permissions.includes('OWNER')) return 'OWNER';
    if (permissions.includes('EDITOR')) return 'EDITOR';
    return 'VIEWER';
  };

  const role = getRoleFromPermissions(collaborator.permissions);
  const canManage = isOwner && !isCurrentUser && role !== 'OWNER';

  const updatePermissionsMutation = useUpdatePermissions();
  const revokeAccessMutation = useRevokeAccess();

  const handleUpdatePermissions = (newPermissions: string[]) => {
    updatePermissionsMutation.mutate({
      listId,
      userId: collaborator.id,
      permissions: newPermissions,
    });
  };

  const handleRevokeAccess = () => {
    if (window.confirm(`¿Estás seguro de que quieres revocar el acceso a ${collaborator.email}?`)) {
      revokeAccessMutation.mutate({
        listId,
        userId: collaborator.id,
      });
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar name={collaborator.email} />
        <div className="flex flex-col">
          <span className="font-medium text-sm">{collaborator.email}</span>
          <span className="text-xs text-gray-500">
            {collaborator.status === 'ACCEPTED' ? 'Aceptada' : 'Pendiente'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={badgeVariantMapping[role] || 'outline'}>
          {roleMapping[role] || role}
        </Badge>
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Más opciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  handleUpdatePermissions(
                    role === 'EDITOR' ? ['VIEWER'] : ['EDITOR']
                  )
                }
              >
                <Shield className="mr-2 h-4 w-4" />
                <span>
                  {role === 'EDITOR' ? 'Cambiar a Lector' : 'Cambiar a Editor'}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRevokeAccess}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Revocar acceso</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
