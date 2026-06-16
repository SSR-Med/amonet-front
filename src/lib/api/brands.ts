import { get, post, put, del } from './client';
import type { Brand, PaginatedResponse } from '@/types';

export async function getBrandById(id: string): Promise<Brand> {
  return get<Brand>(`/marcas/${id}`);
}

export async function getAllBrands(
  page = 1,
  pageSize = 20,
  nombre?: string,
): Promise<PaginatedResponse<Brand>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (nombre) params.set('nombre', nombre);
  return get<PaginatedResponse<Brand>>(`/marcas/?${params}`);
}

export async function createBrand(data: { nombre: string }): Promise<Brand> {
  return post<Brand>('/marcas/', data);
}

export async function updateBrand(id: string, data: { nombre: string }): Promise<Brand> {
  return put<Brand>(`/marcas/${id}`, data);
}

export async function deleteBrand(id: string): Promise<void> {
  return del(`/marcas/${id}`);
}
