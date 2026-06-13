import { get } from './client';
import type { LogItem, PaginatedResponse } from '@/types';

export async function getLogs(
  page = 1,
  pageSize = 20,
  fechaInicio: string,
  fechaFin: string,
): Promise<PaginatedResponse<LogItem>> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
  });
  return get<PaginatedResponse<LogItem>>(`/logs/?${params}`);
}
