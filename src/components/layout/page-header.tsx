import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
}

export function PageHeader({ title, description, createHref, createLabel = 'Crear' }: PageHeaderProps) {
  return (
    <div className="mb-6 flex h-16 items-center justify-between border-b border-border-tabla px-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gris-tecnico">{description}</p>
        )}
      </div>
      {createHref && (
        <Button asChild>
          <a href={createHref}>
            <Plus className="mr-2 h-4 w-4" />
            {createLabel}
          </a>
        </Button>
      )}
    </div>
  );
}
