import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-8 px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-lila-50 text-lila-800',
        chemical: 'bg-lila-50 text-violet-lab',
        packaging: 'bg-rosa-polvo/20 text-pink-800',
        success: 'bg-verde-exito/10 text-verde-exito',
        error: 'bg-coral-alerta/10 text-coral-alerta',
        warning: 'bg-advertencia/10 text-advertencia',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
