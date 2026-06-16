import { get, post, patch, del } from './client';
import type { User, PaginatedResponse } from '@/types';

export async function getUserById(id: string): Promise<User> {
  return get<User>(`/usuarios/${id}`);
}

export async function getAllUsers(
  page = 1,
  pageSize = 20,
  documento?: string,
  rol?: string,
  activo?: boolean,
): Promise<PaginatedResponse<User>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (documento) params.set('documento', documento);
  if (rol) params.set('rol', rol);
  if (activo !== undefined) params.set('activo', String(activo));
  return get<PaginatedResponse<User>>(`/usuarios/?${params}`);
}

export async function createUser(data: { documento: string; nombre: string; password: string; rol: string }): Promise<User> {
  return post<User>('/usuarios/', data);
}

export async function updateUser(id: string, data: { documento?: string; nombre?: string; rol?: string; password?: string; activo?: boolean }): Promise<User> {
  return patch<User>(`/usuarios/${id}`, data);
}

export async function deleteUser(id: string): Promise<void> {
  return del(`/usuarios/${id}`);
}
