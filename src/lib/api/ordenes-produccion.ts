import { get, post } from './client';
import type { EstadoProduccion, CreateOrdenProduccionPayload } from '@/types';

export async function createOrdenProduccion(data: CreateOrdenProduccionPayload): Promise<void> {
  return post<void>('/ordenes_produccion/', data);
}

export async function getEstadosProduccion(): Promise<EstadoProduccion[]> {
  return get<EstadoProduccion[]>('/ordenes_produccion/estados');
}
