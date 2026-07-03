'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Calendar, MessageSquare, MoreHorizontal } from 'lucide-react';
import type { TareaSprintItem } from '@/types';

interface Props {
  tarea: TareaSprintItem;
  onClick: () => void;
  isOverlay?: boolean;
}

function getInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = [
    '#7C4DCC', '#EC407A', '#42A5F5', '#66BB6A', '#FFA726',
    '#AB47BC', '#26A69A', '#EF5350', '#5C6BC0', '#78909C',
  ];
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function KanbanCard({ tarea, onClick, isOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tarea.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const vencida =
    tarea.fecha_vencimiento && new Date(tarea.fecha_vencimiento).toDateString() < new Date().toDateString();
  const hoy = new Date();
  const diasRestantes = tarea.fecha_vencimiento
    ? Math.ceil((new Date(tarea.fecha_vencimiento).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const procheVencida = diasRestantes !== null && diasRestantes <= 2 && diasRestantes >= 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group relative rounded-xl border bg-white cursor-pointer
        transition-all duration-200 ease-out
        hover:shadow-lg hover:border-violet-lab/30
        ${isDragging ? 'opacity-50 shadow-2xl scale-105' : 'shadow-sm border-border-tabla'}
        ${isOverlay ? 'shadow-xl rotate-2 scale-105' : ''}
      `}
      onClick={onClick}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: tarea.prioridad
            ? `rgb(${tarea.prioridad.color_red},${tarea.prioridad.color_green},${tarea.prioridad.color_blue})`
            : '#7C4DCC',
        }}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start gap-2">
          <button
            {...listeners}
            className="mt-0.5 cursor-grab text-gris-tecnico/40 hover:text-gris-tecnico transition-colors opacity-0 group-hover:opacity-100 p-0.5 -ml-1 rounded hover:bg-gris-tecnico/10"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-lila-900 leading-snug line-clamp-2">
              {tarea.titulo}
            </p>

            {tarea.descripcion && (
              <p className="mt-1.5 text-xs text-gris-tecnico line-clamp-2 leading-relaxed">
                {tarea.descripcion}
              </p>
            )}

            {tarea.tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tarea.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-white leading-none"
                    style={{
                      backgroundColor: `rgb(${tag.color_red},${tag.color_green},${tag.color_blue})`,
                    }}
                  >
                    {tag.nombre}
                  </span>
                ))}
                {tarea.tags.length > 4 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gris-tecnico/10 text-gris-tecnico">
                    +{tarea.tags.length - 4}
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {tarea.asignado && (
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: getAvatarColor(tarea.asignado.id) }}
                    title={tarea.asignado.nombre}
                  >
                    {getInitials(tarea.asignado.nombre)}
                  </div>
                )}

                {tarea.fecha_vencimiento && (
                  <span
                    className={`
                      flex items-center gap-1 text-[11px] font-medium
                      ${vencida ? 'text-coral-alerta' : procheVencida ? 'text-amber-500' : 'text-gris-tecnico'}
                    `}
                  >
                    <Calendar className="h-3 w-3" />
                    {vencida
                      ? 'Venció'
                      : diasRestantes === 0
                        ? 'Hoy'
                        : diasRestantes === 1
                          ? 'Mañana'
                          : `${diasRestantes}d`}
                  </span>
                )}

                <span className="flex items-center gap-1 text-[11px] text-gris-tecnico">
                  <MessageSquare className="h-3 w-3" />
                </span>
              </div>

              {tarea.prioridad && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-white leading-none"
                  style={{
                    backgroundColor: `rgb(${tarea.prioridad.color_red},${tarea.prioridad.color_green},${tarea.prioridad.color_blue})`,
                  }}
                >
                  {tarea.prioridad.nombre}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
