'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, FlaskConical, Variable, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description: string;
  href?: string;
  hrefLabel?: string;
  icon?: 'product' | 'brand' | 'material' | 'variable';
}

const icons = {
  product: Package,
  brand: CircleDot,
  material: FlaskConical,
  variable: Variable,
};

export function EmptyState({ title, description, href, hrefLabel = 'Crear', icon = 'product' }: EmptyStateProps) {
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-lila-50">
        <Icon className="h-8 w-8 text-violet-lab" />
      </div>
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-4 text-sm text-gris-tecnico">{description}</p>
      {href && (
        <Link
          href={href}
          className={cn(
            'inline-flex items-center gap-2 rounded-8 bg-violet-lab px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-lila-800'
          )}
        >
          <Package className="h-4 w-4" />
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}
