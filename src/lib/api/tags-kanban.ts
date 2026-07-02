import { get, post, put, del } from './client';
import type { TagKanban, PaginatedResponse } from '@/types';

export async function getTagKanbanById(id: string): Promise<TagKanban> {
  return get<TagKanban>(`/tags-kanban/${id}`);
}

export async function getAllTagsKanban(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<TagKanban>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return get<PaginatedResponse<TagKanban>>(`/tags-kanban?${params}`);
}

export async function createTagKanban(data: { nombre: string; color_red: number; color_green: number; color_blue: number }): Promise<TagKanban> {
  return post<TagKanban>('/tags-kanban', data);
}

export async function updateTagKanban(id: string, data: { nombre: string; color_red: number; color_green: number; color_blue: number }): Promise<TagKanban> {
  return put<TagKanban>(`/tags-kanban/${id}`, data);
}

export async function deleteTagKanban(id: string): Promise<void> {
  return del(`/tags-kanban/${id}`);
}
