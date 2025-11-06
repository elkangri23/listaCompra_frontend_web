import { axiosInstance } from '@/lib/api/axios-instance';
import { InviteUserDto } from '@/types/dtos/invitations/InviteUserDto';

const inviteUser = async (listId: string, email: string): Promise<void> => {
  await axiosInstance.post(`/invitations/${listId}/share`, { email });
};

export const invitationService = {
  inviteUser,
};
