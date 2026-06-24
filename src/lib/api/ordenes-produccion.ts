import { get, post } from './client';
import type { EstadoProduccion, CreateOrdenProduccionPayload, OrdenProduccionDetail, PaginatedResponse } from '@/types';

export async function createOrdenProduccion(data: CreateOrdenProduccionPayload): Promise<void> {
  return post<void>('/ordenes_produccion/', data);
}

export async function getEstadosProduccion(): Promise<EstadoProduccion[]> {
  return get<EstadoProduccion[]>('/ordenes_produccion/estados');
}

export async function getOrdenProduccionById(id: string): Promise<OrdenProduccionDetail> {
  return get<OrdenProduccionDetail>(`/ordenes_produccion/${id}`);
}

export async function getAllOrdenesProduccion(
  page = 1,
  pageSize = 20,
  filters?: {
    fecha_min?: string;
    fecha_max?: string;
    amonet_producto_id?: string;
    amonet_estado_produccion_id?: string;
    amonet_materia_prima_id?: string;
  },
): Promise<PaginatedResponse<OrdenProduccionDetail>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters?.fecha_min) params.set('fecha_min', filters.fecha_min);
  if (filters?.fecha_max) params.set('fecha_max', filters.fecha_max);
  if (filters?.amonet_producto_id) params.set('amonet_producto_id', filters.amonet_producto_id);
  if (filters?.amonet_estado_produccion_id) params.set('amonet_estado_produccion_id', filters.amonet_estado_produccion_id);
  if (filters?.amonet_materia_prima_id) params.set('amonet_materia_prima_id', filters.amonet_materia_prima_id);
  return get<PaginatedResponse<OrdenProduccionDetail>>(`/ordenes_produccion/?${params}`);
}
