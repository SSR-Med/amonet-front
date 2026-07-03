import { get, post, put, del } from './client';
import type { PrioridadKanban, PaginatedResponse } from '@/types';

export async function getPrioridadKanbanById(id: string): Promise<PrioridadKanban> {
  return get<PrioridadKanban>(`/prioridades-kanban/${id}`);
}

export async function getAllPrioridadesKanban(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<PrioridadKanban>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return get<PaginatedResponse<PrioridadKanban>>(`/prioridades-kanban/?${params}`);
}

export async function createPrioridadKanban(data: { nombre: string; color_red: number; color_green: number; color_blue: number }): Promise<PrioridadKanban> {
  return post<PrioridadKanban>('/prioridades-kanban/', data);
}

export async function updatePrioridadKanban(id: string, data: { nombre: string; color_red: number; color_green: number; color_blue: number }): Promise<PrioridadKanban> {
  return put<PrioridadKanban>(`/prioridades-kanban/${id}`, data);
}

export async function deletePrioridadKanban(id: string): Promise<void> {
  return del(`/prioridades-kanban/${id}`);
}
