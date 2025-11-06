'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, File, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard', label: 'Panel Principal', icon: Home },
  { href: '/lists', label: 'Mis Listas', icon: File },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-screen w-64 flex-col justify-between bg-white p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-[#111418] text-base font-medium leading-normal">ListaColab</h1>
        <nav className="flex flex-col gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
                pathname === href ? 'bg-[#f0f2f5] text-[#111418]' : 'text-[#111418]'
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-1">
        <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-[#111418]">
          <LogOut className="h-6 w-6" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
