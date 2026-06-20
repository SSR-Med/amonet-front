export interface Brand {
  id: string;
  nombre: string;
}

export interface CatalogoInfo {
  id: string;
  nombre: string;
  abreviacion?: string;
}

export interface RawMaterial {
  id: string;
  nombre: string;
  tipo_materia_prima: CatalogoInfo;
  tipo_unidad: CatalogoInfo;
  cantidad_disponible: number;
}

export interface ProductVariable {
  id: string;
  nombre: string;
}

export interface ProductRawMaterial {
  id: string;
  nombre: string;
  formula: string;
}

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  marca: CatalogoInfo;
  materias_primas: ProductRawMaterial[];
}

export interface User {
  id: string;
  documento: string;
  nombre: string;
  rol: string;
  activo: boolean;
}

export interface Rol {
  id: string;
  nombre: string;
}

export interface LogItem {
  nombre: string;
  peso: number | null;
  fecha: string;
  origen: string;
}

export interface UsuarioInfo {
  id: string;
  documento: string;
  nombre: string;
}

export interface ContenedorItem {
  id: string;
  contador: number;
  cantidad: number;
  cantidad_disponible: number;
  precio: number;
  precio_unidad: number;
}

export interface InventarioItem {
  id: string;
  fecha_ingreso: string;
  numero_ingreso: string;
  amonet_materia_prima_id: string;
  materia_prima_nombre: string;
  unidad_abreviacion: string;
  proveedor: string;
  lote: string;
  fecha_vencimiento: string;
  usuario_alta: UsuarioInfo;
  status: boolean | null;
  observacion_rechazo: string | null;
  fecha_modifica: string | null;
  usuario_modifica: UsuarioInfo | null;
  ruta_evidencia: string;
  cantidad_total: number;
  numero_contenedores: number;
  contenedores: ContenedorItem[];
}

export interface InventarioFormContenedor {
  cantidad: number;
  cantidad_disponible?: number;
  precio: number;
}

export interface InventarioFormItem {
  amonet_materia_prima_id: string;
  proveedor: string;
  lote: string;
  fecha_vencimiento: string;
  contenedores: InventarioFormContenedor[];
}

export interface PaginatedResponse<T> {
  items: T[];
  current_page: number;
  total_items: number;
  page_size: number;
}

export interface EstadoProduccion {
  id: string;
  nombre: string;
}

export interface CreateOrdenProduccionPayload {
  descripcion: string;
  amonet_producto_id: string;
  variables_globales: { amonet_variable_materia_prima_id: string; cantidad: number }[];
  materias_primas: {
    amonet_materia_prima_id: string;
    cantidad: number;
    contenedores: { amonet_inventario_materia_prima_contenedor_id: string; cantidad: number }[];
  }[];
  observaciones?: string;
}
