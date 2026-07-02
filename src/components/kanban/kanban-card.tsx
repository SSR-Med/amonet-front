'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, User, MessageSquare } from 'lucide-react';
import type { TareaSprintItem } from '@/types';

interface Props {
  tarea: TareaSprintItem;
  onClick: () => void;
}

export function KanbanCard({ tarea, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarea.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const vencida =
    tarea.fecha_vencimiento && new Date(tarea.fecha_vencimiento) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group rounded-lg border border-border-tabla bg-white p-3 shadow-sm hover:shadow-md cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...listeners}
          className="mt-0.5 cursor-grab text-gris-tecnico opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-lila-900 truncate">{tarea.titulo}</p>

          {tarea.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {tarea.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})` }}
                  title={tag.nombre}
                />
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center gap-3 text-xs text-gris-tecnico">
            {tarea.prioridad && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                style={{
                  backgroundColor: `rgb(${tarea.prioridad.color_red},${tarea.prioridad.color_green},${tarea.prioridad.color_blue})`,
                }}
              >
                {tarea.prioridad.nombre}
              </span>
            )}

            {tarea.asignado && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {tarea.asignado.nombre.split(' ')[0]}
              </span>
            )}

            {tarea.fecha_vencimiento && (
              <span className={`flex items-center gap-1 ${vencida ? 'text-coral-alerta' : ''}`}>
                <Calendar className="h-3 w-3" />
                {new Date(tarea.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
