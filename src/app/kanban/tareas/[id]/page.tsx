'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { CommentSection } from '@/components/kanban/comment-section';
import * as api from '@/lib/api/kanban-board';
import type { TareaSprintItem } from '@/types';

export default function TareaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [tarea, setTarea] = useState<TareaSprintItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getTareaById(params.id as string);
        setTarea(data);
      } catch (err) {
        toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
        router.push('/kanban/tareas');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-lab border-t-transparent" />
      </div>
    );
  }

  if (!tarea) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-gris-tecnico hover:text-violet-lab transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <h1 className="text-2xl font-semibold text-lila-900">{tarea.titulo}</h1>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-gris-tecnico mb-1">Descripción</h3>
          <p className="text-sm text-lila-800 whitespace-pre-wrap">{tarea.descripcion || 'Sin descripción'}</p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-gris-tecnico">
            <UserIcon className="h-4 w-4" />
            {tarea.asignado?.nombre || 'Sin asignar'}
          </div>
          {tarea.prioridad && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: `rgb(${tarea.prioridad.color_red},${tarea.prioridad.color_green},${tarea.prioridad.color_blue})` }}
            >
              {tarea.prioridad.nombre}
            </span>
          )}
          {tarea.fecha_vencimiento && (
            <span className="flex items-center gap-1 text-gris-tecnico">
              <Calendar className="h-4 w-4" />
              {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>

        {tarea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tarea.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})` }}
              >
                {tag.nombre}
              </span>
            ))}
          </div>
        )}

        <hr className="border-border-tabla" />

        <CommentSection tareaId={tarea.id} />
      </div>
    </div>
  );
}
