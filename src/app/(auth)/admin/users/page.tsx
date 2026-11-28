'use client';

import { AdminUsersSection } from '@/features/admin/components/admin-users-section';

/**
 * Gestión de usuarios (/admin/users).
 * Renderiza el mismo componente que la pestaña Usuarios del shell /admin:
 * una sola implementación de la tabla, sin duplicarla en dos sitios.
 */
export default function AdminUsersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <AdminUsersSection />
    </div>
  );
}
