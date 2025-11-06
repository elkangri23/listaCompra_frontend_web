import { axiosInstance } from '@/lib/api/axios-instance';
import { Collaborator, RemoveCollaboratorDto, UpdateCollaboratorRoleDto } from '@/types/Collaborator.types';

const getCollaborators = async (listId: string): Promise<Collaborator[]> => {
  const response = await axiosInstance.get<Collaborator[]>(`/lists/${listId}/collaborators`);
  return response.data;
};

const removeCollaborator = async (data: RemoveCollaboratorDto): Promise<void> => {
  await axiosInstance.delete(`/lists/${data.listId}/collaborators/${data.userId}`);
};

const updateCollaboratorRole = async (data: UpdateCollaboratorRoleDto): Promise<Collaborator> => {
  const response = await axiosInstance.patch<Collaborator>(
    `/lists/${data.listId}/collaborators/${data.userId}`,
    { role: data.role }
  );
  return response.data;
};

export const collaboratorService = {
  getCollaborators,
  removeCollaborator,
  updateCollaboratorRole,
};
