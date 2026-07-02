'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, PlayCircle, Star, Trash2 } from 'lucide-react';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { SprintSelector } from './sprint-selector';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskDetailDialog } from './task-detail-dialog';
import { ColumnDialog } from './column-dialog';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import type { ColumnaKanban, TareaSprintItem } from '@/types';

interface Props {
  sprintId?: string;
}

export function KanbanBoard({ sprintId }: Props) {
  const {
    sprint, columnas, tareasPorColumna, loading, error, refetch,
    moveTarea, reordenarColumnas, deleteTarea, crearTarea,
  } = useKanbanBoard(sprintId);

  const [activeTarea, setActiveTarea] = useState<TareaSprintItem | null>(null);
  const [activeColumna, setActiveColumna] = useState<ColumnaKanban | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState<TareaSprintItem | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState<{ columnaId: string } | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newSprintLoading, setNewSprintLoading] = useState(false);
  const [confirmDeleteSprint, setConfirmDeleteSprint] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    for (const colId of Object.keys(tareasPorColumna)) {
      const found = tareasPorColumna[colId].find((t) => t.id === id);
      if (found) { setActiveTarea(found); return; }
    }
    const col = columnas.find((c) => c.id === id);
    if (col) setActiveColumna(col);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTarea(null);
    setActiveColumna(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // mover tarea entre columnas
    const isTarea = Object.values(tareasPorColumna).some((arr) =>
      arr.some((t) => t.id === activeId),
    );

    if (isTarea) {
      let sourceColId: string | undefined;
      for (const colId of Object.keys(tareasPorColumna)) {
        if (tareasPorColumna[colId].some((t) => t.id === activeId)) {
          sourceColId = colId;
          break;
        }
      }
      if (!sourceColId) return;

      const destColId = columnas.some((c) => c.id === overId) ? overId : sourceColId;

      if (sourceColId !== destColId) {
        moveTarea(activeId, destColId);
      }
      return;
    }

    // reordenar columnas
    const oldIndex = columnas.findIndex((c) => c.id === activeId);
    const newIndex = columnas.findIndex((c) => c.id === overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reordenarColumnas(arrayMove(columnas, oldIndex, newIndex));
    }
  };

  const handleSetPrincipal = async () => {
    if (!sprint) return;
    try {
      const { updateSprint } = await import('@/lib/api/kanban-board');
      await updateSprint(sprint.id, { principal: true });
      toast({ title: 'Sprint actualizado', description: 'Ahora es el sprint principal', variant: 'success' });
      refetch();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    }
  };

  const handleDeleteSprint = async () => {
    if (!sprint) return;
    try {
      const { deleteSprint } = await import('@/lib/api/kanban-board');
      await deleteSprint(sprint.id);
      toast({ title: 'Sprint eliminado', variant: 'success' });
      setConfirmDeleteSprint(false);
      window.location.href = '/kanban/sprints';
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
      setConfirmDeleteSprint(false);
    }
  };

  const handleNuevoSprint = async () => {
    setNewSprintLoading(true);
    try {
      const { createSprint } = await import('@/lib/api/kanban-board');
      await createSprint();
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setNewSprintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-lab border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-coral-alerta">{error}</p>
        <button onClick={refetch} className="text-sm text-violet-lab hover:underline">Reintentar</button>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-lg text-gris-tecnico">No hay un sprint activo</p>
        <button
          onClick={handleNuevoSprint}
          disabled={newSprintLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-lab px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          <PlayCircle className="h-4 w-4" />
          {newSprintLoading ? 'Creando...' : 'Iniciar nuevo sprint'}
        </button>
      </div>
    );
  }

  const allTaskIds = columnas.flatMap((c) => tareasPorColumna[c.id]?.map((t) => t.id) || []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-tabla px-6 py-3">
        <SprintSelector sprint={sprint} onChange={refetch} />

        <div className="flex items-center gap-2">
          <button
            onClick={handleNuevoSprint}
            disabled={newSprintLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-lab px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            <PlayCircle className="h-4 w-4" />
            {newSprintLoading ? '...' : 'Nuevo sprint'}
          </button>
          {!sprint.principal && (
            <button
              onClick={handleSetPrincipal}
              className="inline-flex items-center gap-1 rounded-lg border border-border-tabla px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
              title="Hacer principal"
            >
              <Star className="h-4 w-4" />
              Principal
            </button>
          )}
          <button
            onClick={() => setConfirmDeleteSprint(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-border-tabla px-3 py-1.5 text-sm font-medium text-coral-alerta hover:bg-rose-50 transition-colors"
            title="Eliminar sprint"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setColumnDialogOpen(true)}
            className="rounded-lg border border-border-tabla px-3 py-1.5 text-sm font-medium text-lila-800 hover:bg-lila-50 transition-colors"
          >
            + Columna
          </button>
        </div>
      </div>

      {confirmDeleteSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setConfirmDeleteSprint(false)}>
          <div className="rounded-xl bg-white p-6 shadow-lg max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-lila-900">¿Desactivar sprint?</h3>
            <p className="mt-1 text-sm text-gris-tecnico">El sprint se desactivará y no aparecerá en el board.</p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteSprint(false)}
                className="rounded-lg border border-border-tabla px-4 py-2 text-sm font-medium text-lila-800 hover:bg-lila-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteSprint}
                className="rounded-lg bg-coral-alerta px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4">
            {columnas.map((col) => (
              <KanbanColumn
                key={col.id}
                columna={col}
                tareas={tareasPorColumna[col.id] || []}
                onCrearTarea={() => setCreateTaskOpen({ columnaId: col.id })}
                onVerTarea={(t) => setTaskDetailOpen(t)}
                onEliminarColumna={async () => {
                  const { deleteColumnaKanban } = await import('@/lib/api/kanban-board');
                  await deleteColumnaKanban(col.id);
                  refetch();
                }}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTarea && <div className="w-72"><KanbanCard tarea={activeTarea} onClick={() => {}} /></div>}
          </DragOverlay>
        </DndContext>
      </div>

      {createTaskOpen && (
        <CreateTaskDialog
          columnaId={createTaskOpen.columnaId}
          sprintId={sprint.id}
          onClose={() => setCreateTaskOpen(null)}
          onCreated={refetch}
        />
      )}

      {taskDetailOpen && (
        <TaskDetailDialog
          tarea={taskDetailOpen}
          onClose={() => setTaskDetailOpen(null)}
          onUpdated={refetch}
        />
      )}

      {columnDialogOpen && (
        <ColumnDialog
          onClose={() => setColumnDialogOpen(false)}
          onCreated={refetch}
        />
      )}
    </div>
  );
}
