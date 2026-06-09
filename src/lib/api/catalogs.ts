import { get } from './client';
import type { CatalogoInfo } from '@/types';

export async function getTiposMateriaPrima(): Promise<CatalogoInfo[]> {
  return get<CatalogoInfo[]>('/materias_primas/tipos');
}

export async function getTiposUnidad(): Promise<CatalogoInfo[]> {
  return get<CatalogoInfo[]>('/materias_primas/tipos_unidad');
}
