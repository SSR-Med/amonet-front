import { get, post, put, del } from './client';
import type { Product, PaginatedResponse } from '@/types';

export async function getProductById(id: string): Promise<Product> {
  return get<Product>(`/productos/${id}`);
}

export async function getAllProducts(
  page = 1,
  pageSize = 20,
  nombre?: string,
  codigo?: string,
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (nombre) params.set('nombre', nombre);
  if (codigo) params.set('codigo', codigo);
  return get<PaginatedResponse<Product>>(`/productos/?${params}`);
}

export async function createProduct(data: {
  codigo: string;
  nombre: string;
  id_amonet_marca: string;
  materias_primas: { id_amonet_materia_prima: string; formula: string }[];
}): Promise<Product> {
  return post<Product>('/productos/', data);
}

export async function updateProduct(
  id: string,
  data: {
    codigo: string;
    nombre: string;
    id_amonet_marca: string;
    materias_primas: { id_amonet_materia_prima: string; formula: string }[];
  },
): Promise<Product> {
  return put<Product>(`/productos/${id}`, data);
}

export async function deleteProduct(id: string): Promise<void> {
  return del(`/productos/${id}`);
}
