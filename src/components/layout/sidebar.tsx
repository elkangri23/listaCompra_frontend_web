'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, File, Settings, LogOut, Mail, Bell } from 'lucide-react';
import { useNotifications } from '@/features/notifications/hooks/use-notifications';

const links = [
  { href: '/dashboard', label: 'Panel Principal', icon: Home },
  { href: '/lists', label: 'Mis Listas', icon: File },
  { href: '/invitations', label: 'Invitaciones', icon: Mail },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  return (
    <aside>
      <div>
        <h1>ListaColab</h1>
        <nav>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{ fontWeight: pathname === href ? 'bold' : 'normal' }}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
          <button>
            <Bell />
            <span>Notificaciones</span>
            {unreadCount > 0 && (
              <span>
                {unreadCount}
              </span>
            )}
          </button>
        </nav>
      </div>
      <div>
        <button>
          <LogOut />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
