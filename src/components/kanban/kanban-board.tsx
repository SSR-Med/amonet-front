'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, PlayCircle, Star, Trash2, Search, X, Calendar, LayoutGrid } from 'lucide-react';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { CreateTaskDialog } from './create-task-dialog';
import { ColumnDialog } from './column-dialog';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import type { ColumnaKanban, TareaSprintItem } from '@/types';

interface Props {
  sprintId?: string;
}

function SprintHeader({ sprint, onRefetch }: { sprint: NonNullable<ReturnType<typeof useKanbanBoard>['sprint']>, onRefetch: () => void }) {
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [settingPrincipal, setSettingPrincipal] = useState(false);

  const handleSetPrincipal = async () => {
    try {
      const { updateSprint } = await import('@/lib/api/kanban-board');
      await updateSprint(sprint.id, { principal: true });
      toast({ title: 'Sprint principal actualizado', variant: 'success' });
      onRefetch();
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setSettingPrincipal(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { deleteSprint } = await import('@/lib/api/kanban-board');
      await deleteSprint(sprint.id);
      toast({ title: 'Sprint eliminado', variant: 'success' });
      window.location.href = '/kanban/sprints';
    } catch (err) {
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border-tabla bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-lab/10">
            <LayoutGrid className="h-5 w-5 text-violet-lab" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-lila-900 leading-tight">
              {sprint.descripcion || `Sprint ${sprint.contador}`}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gris-tecnico">
              <Calendar className="h-3 w-3" />
              {new Date(sprint.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              {sprint.fecha_fin && (
                <> — {new Date(sprint.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</>
              )}
            </div>
          </div>
        </div>

        {sprint.principal && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
            <Star className="h-3 w-3 fill-amber-500" />
            Principal
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!sprint.principal && (
          <button
            onClick={() => setSettingPrincipal(true)}
            disabled={settingPrincipal}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50"
          >
            <Star className="h-3.5 w-3.5" />
            Hacer principal
          </button>
        )}

        <button
          onClick={() => setConfirmDelete(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-tabla px-3 py-1.5 text-xs font-medium text-coral-alerta hover:bg-rose-50 transition-all"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>

        <a
          href="/kanban/sprints"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-tabla px-3 py-1.5 text-xs font-medium text-gris-tecnico hover:bg-lila-50 transition-all"
        >
          Cambiar sprint
        </a>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-lila-900">¿Eliminar sprint?</h3>
            <p className="mt-2 text-sm text-gris-tecnico">
              El sprint <strong>"{sprint.descripcion || `Sprint ${sprint.contador}`}"</strong> será desactivado. Las tareas no se perderán.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border-tabla px-4 py-2 text-sm font-medium text-lila-800 hover:bg-lila-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-coral-alerta px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Eliminar sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {settingPrincipal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSettingPrincipal(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-lila-900">¿Hacer sprint principal?</h3>
            <p className="mt-2 text-sm text-gris-tecnico">
              El sprint actual dejará de ser principal y este será el nuevo sprint principal.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSettingPrincipal(false)}
                className="rounded-lg border border-border-tabla px-4 py-2 text-sm font-medium text-lila-800 hover:bg-lila-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSetPrincipal}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
              >
                Hacer principal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function KanbanBoard({ sprintId }: Props) {
  const {
    sprint, columnas, tareasPorColumna, loading, error, refetch,
    moveTarea, reordenarColumnas, crearTarea,
  } = useKanbanBoard(sprintId);

  const [activeTarea, setActiveTarea] = useState<TareaSprintItem | null>(null);
  const [activeColumna, setActiveColumna] = useState<ColumnaKanban | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState<{ columnaId: string } | null>(null);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [newSprintLoading, setNewSprintLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const router = useRouter();

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

    const oldIndex = columnas.findIndex((c) => c.id === activeId);
    const overIndex = columnas.findIndex((c) => c.id === overId);
    if (oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex) {
      reordenarColumnas(arrayMove(columnas, oldIndex, overIndex));
    }
  };

  const handleNuevoSprint = async () => {
    setNewSprintLoading(true);
    try {
      const { createSprint } = await import('@/lib/api/kanban-board');
      await createSprint();
      refetch();
    } catch (e) {
      toast({ title: 'Error', description: getApiErrorMessage(e), variant: 'error' });
    } finally {
      setNewSprintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-lab/20 border-t-violet-lab" />
        </div>
        <p className="text-sm text-gris-tecnico animate-pulse">Cargando board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="p-4 rounded-full bg-coral-alerta/10">
          <LayoutGrid className="h-8 w-8 text-coral-alerta" />
        </div>
        <p className="text-sm text-coral-alerta">{error}</p>
        <button onClick={refetch} className="text-sm text-violet-lab hover:underline font-medium">
          Reintentar
        </button>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="p-4 rounded-2xl bg-violet-lab/10">
          <Calendar className="h-10 w-10 text-violet-lab" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-lila-900">No hay un sprint activo</h2>
          <p className="mt-1 text-sm text-gris-tecnico">Creá un nuevo sprint para comenzar a trabajar</p>
        </div>
        <button
          onClick={handleNuevoSprint}
          disabled={newSprintLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-lab px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 shadow-lg shadow-violet-lab/25 transition-all disabled:opacity-50"
        >
          <PlayCircle className="h-4 w-4" />
          {newSprintLoading ? 'Creando...' : 'Iniciar nuevo sprint'}
        </button>
        <a href="/kanban/sprints" className="text-xs text-violet-lab hover:underline">
          Ver sprints anteriores
        </a>
      </div>
    );
  }

  const filteredColumnas = searchQuery
    ? columnas.map(col => ({
        ...col,
        tareas: (tareasPorColumna[col.id] || []).filter(t =>
          t.titulo.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(col => col.tareas.length > 0)
    : columnas;

  const totalTareas = columnas.reduce((acc, col) => acc + (tareasPorColumna[col.id]?.length || 0), 0);

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-lavanda-soft/50 to-white">
      <SprintHeader sprint={sprint} onRefetch={refetch} />

      <div className="flex items-center justify-between px-6 py-3 border-b border-border-tabla/50 bg-white/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gris-tecnico" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarea..."
              className="w-64 pl-9 pr-4 py-2 rounded-xl border border-border-tabla bg-white text-sm focus:outline-none focus:border-violet-lab focus:ring-2 focus:ring-violet-lab/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gris-tecnico hover:text-lila-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-gris-tecnico">
            {totalTareas} tarea{totalTareas !== 1 ? 's' : ''}
            {searchQuery && ` · ${filteredColumnas.reduce((acc, c) => acc + c.tareas.length, 0)} visible${filteredColumnas.reduce((acc, c) => acc + c.tareas.length, 0) !== totalTareas ? 's' : ''}`}
          </span>
        </div>

        <button
          onClick={() => setColumnDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-lab px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 shadow-lg shadow-violet-lab/25 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nueva columna
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 pb-4">
            <SortableContext items={columnas.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {filteredColumnas.map((col) => (
                <KanbanColumn
                  key={col.id}
                  columna={col}
                  tareas={searchQuery ? col.tareas : (tareasPorColumna[col.id] || [])}
                  onCrearTarea={() => setCreateTaskOpen({ columnaId: col.id })}
                  onVerTarea={(t) => router.push(`/kanban/tareas/${t.id}`)}
                  onEliminarColumna={async () => {
                    try {
                      const { deleteColumnaKanban } = await import('@/lib/api/kanban-board');
                      await deleteColumnaKanban(col.id);
                      toast({ title: 'Columna eliminada', variant: 'success' });
                      refetch();
                    } catch (err) {
                      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
                    }
                  }}
                />
              ))}
            </SortableContext>

            {filteredColumnas.length === 0 && searchQuery && (
              <div className="flex flex-col items-center justify-center w-80 py-12 text-center">
                <Search className="h-8 w-8 text-gris-tecnico/50 mb-3" />
                <p className="text-sm font-medium text-gris-tecnico">No se encontraron tareas</p>
                <p className="text-xs text-gris-tecnico mt-1">para "{searchQuery}"</p>
              </div>
            )}
          </div>

          <DragOverlay>
            {activeTarea && (
              <div className="w-80 opacity-90">
                <KanbanCard tarea={activeTarea} onClick={() => {}} isOverlay />
              </div>
            )}
            {activeColumna && (
              <div className="w-80 rounded-2xl border-2 border-violet-lab bg-white/90 shadow-2xl p-4 opacity-95">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-lab" />
                  <h3 className="text-sm font-semibold text-lila-900">{activeColumna.nombre}</h3>
                </div>
              </div>
            )}
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

      {columnDialogOpen && (
        <ColumnDialog
          onClose={() => setColumnDialogOpen(false)}
          onCreated={refetch}
        />
      )}
    </div>
  );
}
