'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
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
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: columna.id });
  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition, isDragging } = useSortable({ id: columna.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const setRef = (node: HTMLElement | null) => {
    setDropRef(node);
    setSortableRef(node);
  };

  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = () => {
    if (confirmDelete) {
      onEliminarColumna();
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      ref={setRef}
      style={style}
      className={`
        flex w-80 shrink-0 flex-col rounded-2xl border transition-all duration-300
        ${isDragging ? 'opacity-50 shadow-2xl scale-105' : ''}
        ${isOver && !isDragging
          ? 'border-violet-lab bg-violet-lab/5 shadow-lg shadow-violet-lab/10'
          : hovered && !isDragging
            ? 'border-violet-lab/30 bg-white/80 shadow-md'
            : 'border-border-tabla bg-lavanda-soft/50'
        }
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center justify-between px-4 py-3.5">
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-2 cursor-grab active:cursor-grabbing hover:text-violet-lab transition-colors"
        >
          <GripVertical className="h-4 w-4 text-gris-tecnico/40 hover:text-gris-tecnico transition-colors" />
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: `hsl(270, 50%, ${40 + columna.posicion * 5}%)`,
            }}
          />
          <h3 className="text-sm font-semibold text-lila-900 tracking-tight">{columna.nombre}</h3>
          <span className={`
            flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full
            text-[11px] font-semibold transition-colors
            ${hovered ? 'bg-violet-lab text-white' : 'bg-lila-100 text-lila-600'}
          `}>
            {tareas.length}
          </span>
        </div>

        <div className={`
          flex items-center gap-1 transition-all duration-200
          ${hovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <button
            onClick={onCrearTarea}
            className="rounded-lg p-1.5 text-gris-tecnico hover:bg-violet-lab hover:text-white transition-all"
            title="Crear tarea"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            className={`
              rounded-lg p-1.5 transition-all
              ${confirmDelete
                ? 'bg-coral-alerta text-white'
                : 'text-gris-tecnico hover:bg-rose-50 hover:text-coral-alerta'
              }
            `}
            title={confirmDelete ? 'Click again to confirm' : 'Eliminar columna'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={setDropRef}
        className={`
          flex flex-col gap-2.5 px-3 pb-3 transition-all duration-200
          ${tareas.length === 0 ? 'min-h-[140px]' : ''}
          ${isOver ? 'bg-violet-lab/5' : ''}
        `}
      >
        <SortableContext items={tareas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tareas.map((tarea) => (
            <KanbanCard key={tarea.id} tarea={tarea} onClick={() => onVerTarea(tarea)} />
          ))}
        </SortableContext>

        {tareas.length === 0 && (
          <div
            className={`
              flex flex-col items-center justify-center flex-1 rounded-xl border-2 border-dashed
              transition-all duration-200 min-h-[120px]
              ${isOver
                ? 'border-violet-lab bg-violet-lab/5 text-violet-lab'
                : 'border-border-tabla/60 text-gris-tecnico'
              }
            `}
          >
            <p className="text-xs font-medium">
              {isOver ? 'Soltá aquí' : 'Sin tareas'}
            </p>
            <button
              onClick={onCrearTarea}
              className={`
                mt-2 flex items-center gap-1 text-[11px] font-medium transition-colors
                ${isOver ? 'text-violet-lab' : 'text-gris-tecnico hover:text-violet-lab'}
              `}
            >
              <Plus className="h-3 w-3" />
              Nueva tarea
            </button>
          </div>
        )}

        {tareas.length > 0 && (
          <button
            onClick={onCrearTarea}
            className={`
              flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium
              transition-all duration-200
              ${hovered
                ? 'bg-white/80 text-gris-tecnico hover:bg-violet-lab hover:text-white border border-dashed border-border-tabla'
                : 'text-transparent'
              }
            `}
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar tarea
          </button>
        )}
      </div>
    </div>
  );
}
