export type Notification = {
  id: string;
  userId: string;
  type: 'invitation' | 'list_update' | 'product_update';
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedNotifications = {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};
