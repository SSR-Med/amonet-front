'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Tag, FlaskConical, Variable, LayoutDashboard, Users, UserCircle, LogOut, FileText, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

const modules = [
  { name: 'Productos', href: '/products', icon: Package, adminOnly: false },
  { name: 'Marcas', href: '/brands', icon: Tag, adminOnly: false },
  { name: 'Materias Primas', href: '/raw-materials', icon: FlaskConical, adminOnly: false },
  { name: 'Variables Globales', href: '/product-variables', icon: Variable, adminOnly: false },
  { name: 'Usuarios', href: '/users', icon: Users, adminOnly: true },
  { name: 'Inventario', href: '/inventario', icon: Archive, adminOnly: false },
  { name: 'Logs', href: '/logs', icon: FileText, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/products') {
      return pathname === '/products' || pathname?.startsWith('/products');
    }
    return pathname === href || pathname?.startsWith(href + '/') || pathname === href;
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-lavanda-soft border-r border-border-tabla">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border-tabla px-6">
          <Link href="/" className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-violet-lab" />
            <span className="text-lg font-medium text-lila-900">Amonet</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="px-3 py-2 text-xs font-medium text-gris-tecnico uppercase tracking-wider">
            Módulos
          </p>
          {modules
            .filter((m) => !m.adminOnly || isAdmin)
            .map((module) => {
              const Icon = module.icon;
              const active = isActive(module.href);
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className={cn(
                    'flex items-center gap-3 rounded-8 px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-violet-lab text-white'
                      : 'text-lila-800 hover:bg-lila-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {module.name}
                </Link>
              );
            })}

          <p className="mt-6 px-3 py-2 text-xs font-medium text-gris-tecnico uppercase tracking-wider">
            Cuenta
          </p>
          <Link
            href="/profile"
            className={cn(
              'flex items-center gap-3 rounded-8 px-3 py-2 text-sm font-medium transition-colors',
              isActive('/profile')
                ? 'bg-violet-lab text-white'
                : 'text-lila-800 hover:bg-lila-50'
            )}
          >
            <UserCircle className="h-5 w-5" />
            Mis Datos
          </Link>
        </nav>

        <div className="border-t border-border-tabla p-4 space-y-1">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-8 px-3 py-2 text-sm font-medium transition-colors text-lila-800 hover:bg-lila-50'
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-8 px-3 py-2 text-sm font-medium text-coral-alerta hover:bg-rose-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
