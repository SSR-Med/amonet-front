'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ColumnaKanban, ColumnaConTareas, SprintItem, TareaSprintItem } from '@/types';
import * as api from '@/lib/api/kanban-board';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';

export function useKanbanBoard(sprintId?: string) {
  const [sprint, setSprint] = useState<SprintItem | null>(null);
  const [columnas, setColumnas] = useState<ColumnaKanban[]>([]);
  const [tareasPorColumna, setTareasPorColumna] = useState<Record<string, TareaSprintItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let activeSprintId = sprintId;

      if (!activeSprintId) {
        try {
          const principal = await api.getSprintPrincipal();
          activeSprintId = principal.id;
          setSprint(principal);
        } catch {
          setSprint(null);
          setColumnas([]);
          setTareasPorColumna({});
          setLoading(false);
          return;
        }
      } else {
        const s = await api.getSprintById(activeSprintId);
        setSprint(s);
      }

      const [cols, datos] = await Promise.all([
        api.getColumnasKanban(),
        api.getTareasBySprint(activeSprintId),
      ]);

      setColumnas(cols);

      const mapa: Record<string, TareaSprintItem[]> = {};
      datos.forEach((item: ColumnaConTareas) => {
        mapa[item.columna.id] = item.tareas;
      });
      cols.forEach((c) => { if (!mapa[c.id]) mapa[c.id] = []; });
      setTareasPorColumna(mapa);
    } catch (err) {
      setError(getApiErrorMessage(err));
      toast({ title: 'Error', description: getApiErrorMessage(err), variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sprintId, toast]);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const moveTarea = useCallback(async (tareaId: string, nuevaColumnaId: string) => {
    const oldState = { ...tareasPorColumna };
    let tareaMoviendo: TareaSprintItem | undefined;

    for (const colId of Object.keys(tareasPorColumna)) {
      const found = tareasPorColumna[colId].find((t) => t.id === tareaId);
      if (found) {
        tareaMoviendo = { ...found, amonet_columna_kanban_id: nuevaColumnaId };
        setTareasPorColumna((prev) => ({
          ...prev,
          [colId]: prev[colId].filter((t) => t.id !== tareaId),
          [nuevaColumnaId]: [...(prev[nuevaColumnaId] || []), tareaMoviendo!],
        }));
        break;
      }
    }

    try {
      await api.updateTarea(tareaId, { amonet_columna_kanban_id: nuevaColumnaId });
    } catch (err) {
      setTareasPorColumna(oldState);
      toast({ title: 'Error', description: 'No se pudo mover la tarea', variant: 'error' });
    }
  }, [tareasPorColumna, toast]);

  const reordenarColumnas = useCallback(async (nuevasColumnas: ColumnaKanban[]) => {
    const old = columnas;
    setColumnas(nuevasColumnas);
    try {
      await api.reorderColumnasKanban(
        nuevasColumnas.map((col, i) => ({ id: col.id, posicion: i + 1 })),
      );
    } catch {
      setColumnas(old);
      toast({ title: 'Error', description: 'No se pudo reordenar', variant: 'error' });
    }
  }, [columnas, toast]);

  const deleteTarea = useCallback(async (id: string) => {
    for (const colId of Object.keys(tareasPorColumna)) {
      if (tareasPorColumna[colId].some((t) => t.id === id)) {
        const old = tareasPorColumna[colId];
        setTareasPorColumna((prev) => ({
          ...prev,
          [colId]: prev[colId].filter((t) => t.id !== id),
        }));
        try {
          await api.deleteTarea(id);
          toast({ title: 'Tarea eliminada', variant: 'success' });
        } catch {
          setTareasPorColumna((prev) => ({ ...prev, [colId]: old }));
          toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'error' });
        }
        return;
      }
    }
  }, [tareasPorColumna, toast]);

  const crearTarea = useCallback(async (data: Parameters<typeof api.createTarea>[0]) => {
    const tarea = await api.createTarea(data);
    setTareasPorColumna((prev) => ({
      ...prev,
      [data.amonet_columna_kanban_id]: [...(prev[data.amonet_columna_kanban_id] || []), tarea],
    }));
    return tarea;
  }, []);

  return {
    sprint,
    columnas,
    tareasPorColumna,
    loading,
    error,
    refetch: fetchBoard,
    moveTarea,
    reordenarColumnas,
    deleteTarea,
    crearTarea,
    setSprint,
  };
}
