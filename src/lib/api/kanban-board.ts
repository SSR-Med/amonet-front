import { get, post, put, del, patch } from './client';
import type { ColumnaKanban, ColumnaConTareas, ComentarioTarea, SprintItem, TareaSprintItem, PaginatedResponse } from '@/types';

/* ── Columnas ── */
export async function getColumnasKanban(): Promise<ColumnaKanban[]> {
  const res = await get<PaginatedResponse<ColumnaKanban>>('/columnas-kanban/?page_size=99');
  return res.items;
}

export async function createColumnaKanban(data: { nombre: string; posicion?: number }): Promise<ColumnaKanban> {
  return post<ColumnaKanban>('/columnas-kanban/', data);
}

export async function updateColumnaKanban(id: string, data: { nombre?: string; posicion?: number }): Promise<ColumnaKanban> {
  return put<ColumnaKanban>(`/columnas-kanban/${id}`, data);
}

export async function reorderColumnasKanban(items: { id: string; posicion: number }[]): Promise<ColumnaKanban[]> {
  return put<ColumnaKanban[]>('/columnas-kanban/orden', { items });
}

export async function deleteColumnaKanban(id: string): Promise<void> {
  return del(`/columnas-kanban/${id}`);
}

/* ── Tareas ── */
export async function getTareasBySprint(sprintId: string): Promise<ColumnaConTareas[]> {
  return get<ColumnaConTareas[]>(`/tareas-sprint/sprint/${sprintId}`);
}

export async function getTareaById(id: string): Promise<TareaSprintItem> {
  return get<TareaSprintItem>(`/tareas-sprint/${id}`);
}

export async function createTarea(data: {
  titulo: string;
  descripcion: string;
  asignado: string;
  fecha_vencimiento?: string | null;
  tags?: string[];
  amonet_prioridad_kanban_id?: string | null;
  amonet_sprint_id: string;
  amonet_columna_kanban_id: string;
}): Promise<TareaSprintItem> {
  return post<TareaSprintItem>('/tareas-sprint/', data);
}

export async function updateTarea(
  id: string,
  data: {
    titulo?: string;
    descripcion?: string;
    asignado?: string;
    fecha_vencimiento?: string | null;
    tags?: string[];
    amonet_prioridad_kanban_id?: string | null;
    amonet_sprint_id?: string;
    amonet_columna_kanban_id?: string;
  },
): Promise<TareaSprintItem> {
  return put<TareaSprintItem>(`/tareas-sprint/${id}`, data);
}

export async function deleteTarea(id: string): Promise<void> {
  return del(`/tareas-sprint/${id}`);
}

/* ── Sprints ── */
export async function getSprintPrincipal(): Promise<SprintItem> {
  const res = await get<PaginatedResponse<SprintItem>>('/sprints/?principal=true&page_size=1');
  if (res.items.length === 0) throw new Error('No hay sprint principal');
  return res.items[0];
}

export async function getSprints(page = 1, pageSize = 20): Promise<PaginatedResponse<SprintItem>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return get<PaginatedResponse<SprintItem>>(`/sprints/?${params}`);
}

export async function getSprintById(id: string): Promise<SprintItem> {
  return get<SprintItem>(`/sprints/${id}`);
}

export async function createSprint(descripcion?: string): Promise<SprintItem> {
  return post<SprintItem>('/sprints/', { descripcion });
}

export async function updateSprint(id: string, data: { principal?: boolean; descripcion?: string }): Promise<SprintItem> {
  return patch<SprintItem>(`/sprints/${id}`, data);
}

export async function deleteSprint(id: string): Promise<void> {
  return del(`/sprints/${id}`);
}

/* ── Comentarios ── */
export async function getComentariosByTarea(tareaId: string): Promise<ComentarioTarea[]> {
  return get<ComentarioTarea[]>(`/comentarios-tarea/?amonet_tarea_sprint_id=${tareaId}`);
}

export async function createComentario(data: { amonet_tarea_sprint_id: string; comentario: string }): Promise<ComentarioTarea> {
  return post<ComentarioTarea>('/comentarios-tarea/', data);
}

/* ── Tareas globales (independiente) ── */
export async function getAllTareas(params?: {
  page?: number;
  page_size?: number;
  titulo?: string;
  amonet_sprint_id?: string;
  amonet_prioridad_kanban_id?: string;
  tags?: string[];
  fecha_min?: string;
  fecha_max?: string;
  usuario_alta?: string;
}): Promise<PaginatedResponse<TareaSprintItem>> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        v.forEach(tag => search.append('tags', tag));
      } else {
        search.set(k, String(v));
      }
    });
  }
  return get<PaginatedResponse<TareaSprintItem>>(`/tareas-sprint?${search}`);
}

/* ── Crear sprint y finalizar anterior ── */
export async function iniciarNuevoSprint(descripcion?: string): Promise<SprintItem> {
  const sprint = await createSprint(descripcion);
  return sprint;
}
