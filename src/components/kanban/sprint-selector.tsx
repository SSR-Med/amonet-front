'use client';

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import type { SprintItem } from '@/types';

interface Props {
  sprint: SprintItem;
  onChange: () => void;
}

export function SprintSelector({ sprint, onChange }: Props) {
  const router = useRouter();
  const inicio = new Date(sprint.fecha_inicio).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  return (
    <div className="flex items-center gap-3">
      <Calendar className="h-5 w-5 text-violet-lab" />
      <div>
        <p className="text-sm font-semibold text-lila-900">
          Sprint #{sprint.contador}
        </p>
        <p className="text-xs text-gris-tecnico">
          {inicio}{sprint.descripcion ? ` · ${sprint.descripcion}` : ''}
        </p>
      </div>
      <button
        onClick={() => router.push('/kanban/sprints')}
        className="ml-2 text-xs text-violet-lab hover:underline"
      >
        Cambiar sprint
      </button>
    </div>
  );
}
