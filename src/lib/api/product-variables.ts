import { get, post, put, del } from './client';
import type { ProductVariable, PaginatedResponse } from '@/types';

export async function getProductVariableById(id: string): Promise<ProductVariable> {
  return get<ProductVariable>(`/materias_primas/variables_globales/${id}`);
}

export async function getAllProductVariables(
  page = 1,
  pageSize = 100,
): Promise<PaginatedResponse<ProductVariable>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  return get<PaginatedResponse<ProductVariable>>(`/materias_primas/variables_globales?${params}`);
}

export async function createProductVariable(data: { nombre: string }): Promise<ProductVariable> {
  return post<ProductVariable>('/materias_primas/variables_globales', data);
}

export async function updateProductVariable(id: string, data: { nombre: string }): Promise<ProductVariable> {
  return put<ProductVariable>(`/materias_primas/variables_globales/${id}`, data);
}

export async function deleteProductVariable(id: string): Promise<void> {
  return del(`/materias_primas/variables_globales/${id}`);
}
