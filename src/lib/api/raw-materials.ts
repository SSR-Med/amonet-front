import { get, post, put, del } from './client';
import type { RawMaterial, PaginatedResponse } from '@/types';

export async function getAllRawMaterials(
  page = 1,
  pageSize = 20,
  nombre?: string,
): Promise<PaginatedResponse<RawMaterial>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (nombre) params.set('nombre', nombre);
  return get<PaginatedResponse<RawMaterial>>(`/materias_primas/?${params}`);
}

export async function createRawMaterial(data: {
  nombre: string;
  id_cat_amonet_tipo_materia_prima: string;
  id_cat_amonet_tipo_unidad: string;
}): Promise<RawMaterial> {
  return post<RawMaterial>('/materias_primas/', data);
}

export async function updateRawMaterial(
  id: string,
  data: {
    nombre: string;
    id_cat_amonet_tipo_materia_prima: string;
    id_cat_amonet_tipo_unidad: string;
  },
): Promise<RawMaterial> {
  return put<RawMaterial>(`/materias_primas/${id}`, data);
}

export async function deleteRawMaterial(id: string): Promise<void> {
  return del(`/materias_primas/${id}`);
}
