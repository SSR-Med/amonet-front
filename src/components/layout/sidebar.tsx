'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Tag, FlaskConical, Variable, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const modules = [
  { name: 'Productos', href: '/products', icon: Package },
  { name: 'Marcas', href: '/brands', icon: Tag },
  { name: 'Materias Primas', href: '/raw-materials', icon: FlaskConical },
  { name: 'Variables Globales', href: '/product-variables', icon: Variable },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/products') {
      return pathname === '/products' || pathname?.startsWith('/products');
    }
    return pathname === href || pathname?.startsWith(href);
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
          {modules.map((module) => {
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
        </nav>

        <div className="border-t border-border-tabla p-4">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-3 rounded-8 px-3 py-2 text-sm font-medium transition-colors text-lila-800 hover:bg-lila-50'
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
        </div>
      </div>
    </aside>
  );
}
