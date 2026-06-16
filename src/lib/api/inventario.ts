import { get, patch } from './client';
import type { InventarioFormItem, InventarioItem, PaginatedResponse, UsuarioInfo } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function getAllInventario(
  page = 1,
  pageSize = 20,
  filters?: { status?: boolean; lote?: string; amonet_materia_prima_id?: string; fecha_inicio?: string; fecha_fin?: string; proveedor?: string; usuario_alta?: string },
): Promise<PaginatedResponse<InventarioItem>> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
  if (filters?.status !== undefined) params.set('status', String(filters.status));
  if (filters?.lote) params.set('lote', filters.lote);
  if (filters?.amonet_materia_prima_id) params.set('amonet_materia_prima_id', filters.amonet_materia_prima_id);
  if (filters?.fecha_inicio) params.set('fecha_inicio', filters.fecha_inicio);
  if (filters?.fecha_fin) params.set('fecha_fin', filters.fecha_fin);
  if (filters?.proveedor) params.set('proveedor', filters.proveedor);
  if (filters?.usuario_alta) params.set('usuario_alta', filters.usuario_alta);
  return get<PaginatedResponse<InventarioItem>>(`/inventario/?${params}`);
}

export async function getInventarioById(id: string): Promise<InventarioItem> {
  return get<InventarioItem>(`/inventario/${id}`);
}

export async function downloadEvidencia(numeroIngreso: string): Promise<string> {
  const token = localStorage.getItem('amonet_token');
  const res = await fetch(`${BASE_URL}/inventario/evidencia?numero_ingreso=${encodeURIComponent(numeroIngreso)}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.url;
}

export async function updateInventario(id: string, data: Record<string, unknown>): Promise<void> {
  return patch(`/inventario/${id}`, data);
}

export async function updateInventarioWithFile(id: string, data: Record<string, unknown>, archivo: File): Promise<void> {
  const token = localStorage.getItem('amonet_token');
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));
  formData.append('archivo', archivo);

  const res = await fetch(`${BASE_URL}/inventario/${id}`, {
    method: 'PATCH',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
}

export async function createInventario(items: InventarioFormItem[], archivo: File): Promise<void> {
  const token = localStorage.getItem('amonet_token');
  const formData = new FormData();
  formData.append('items', JSON.stringify(items));
  formData.append('archivo', archivo);

  const res = await fetch(`${BASE_URL}/inventario/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
}
