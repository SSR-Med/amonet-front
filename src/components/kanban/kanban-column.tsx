'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import { KanbanCard } from './kanban-card';
import type { ColumnaKanban, TareaSprintItem } from '@/types';

interface Props {
  columna: ColumnaKanban;
  tareas: TareaSprintItem[];
  onCrearTarea: () => void;
  onVerTarea: (tarea: TareaSprintItem) => void;
  onEliminarColumna: () => void;
}

export function KanbanColumn({ columna, tareas, onCrearTarea, onVerTarea, onEliminarColumna }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: columna.id });

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl border bg-lavanda-soft transition-colors ${
        isOver ? 'border-violet-lab border-2' : 'border-border-tabla'
      }`}
    >
      <div className="flex items-center justify-between border-b border-border-tabla px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-lila-900">{columna.nombre}</h3>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-lila-100 text-[10px] font-medium text-lila-600">
            {tareas.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCrearTarea}
            className="rounded p-1 text-gris-tecnico hover:bg-lila-100 hover:text-violet-lab transition-colors"
            title="Crear tarea"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={onEliminarColumna}
            className="rounded p-1 text-gris-tecnico hover:bg-rose-50 hover:text-coral-alerta transition-colors"
            title="Eliminar columna"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-col gap-2 p-3 min-h-[120px] overflow-y-auto"
      >
        <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tareas.map((tarea) => (
            <KanbanCard key={tarea.id} tarea={tarea} onClick={() => onVerTarea(tarea)} />
          ))}
        </SortableContext>

        {tareas.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-border-tabla p-4">
            <p className="text-xs text-gris-tecnico">Arrastrá tareas aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}
