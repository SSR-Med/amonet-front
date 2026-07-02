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

export interface OrdenProduccionContenedor {
  id: string;
  cantidad: number;
  coste: number;
  lote: string;
  proveedor: string;
}

export interface OrdenProduccionMateriaPrima {
  id: string;
  nombre: string;
  contenedores: OrdenProduccionContenedor[];
}

export interface OrdenProduccionVariableGlobal {
  id: string;
  nombre: string;
  cantidad: number;
}

export interface OrdenProduccionDetail {
  id: string;
  descripcion: string;
  observacion_creacion: string | null;
  fecha_alta: string;
  fecha_modifica: string | null;
  coste: number;
  cancel_razon_descripcion: string | null;
  producto: {
    id: string;
    codigo: string;
    nombre: string;
    marca_nombre: string;
  };
  estado_produccion: {
    id: string;
    nombre: string;
  };
  usuario_alta: UsuarioInfo;
  usuario_modifica: UsuarioInfo | null;
  variables_globales: OrdenProduccionVariableGlobal[];
  materias_primas: OrdenProduccionMateriaPrima[];
}

export interface TagKanban {
  id: string;
  nombre: string;
  color_red: number;
  color_green: number;
  color_blue: number;
  activo: boolean;
}

export interface PrioridadKanban {
  id: string;
  nombre: string;
  color_red: number;
  color_green: number;
  color_blue: number;
  activo: boolean;
}

export interface ColumnaKanban {
  id: string;
  nombre: string;
  posicion: number;
  activo: boolean;
}

export interface SprintItem {
  id: string;
  contador: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activo: boolean;
  principal: boolean;
  descripcion: string | null;
  usuario_alta: UsuarioInfo;
  usuario_modifica: UsuarioInfo | null;
  fecha_modifica: string | null;
}

export interface ComentarioTarea {
  id: string;
  amonet_tarea_sprint_id: string;
  comentario: string;
  activo: boolean;
  usuario_alta: UsuarioInfo;
  fecha_alta: string;
  fecha_modifica: string | null;
}

export interface TareaSprintItem {
  id: string;
  titulo: string;
  descripcion: string;
  asignado: UsuarioInfo;
  fecha_vencimiento: string | null;
  tags: TagKanban[];
  prioridad: PrioridadKanban | null;
  amonet_sprint_id: string;
  amonet_columna_kanban_id: string;
  usuario_alta: UsuarioInfo;
  fecha_alta: string;
  usuario_modifica: UsuarioInfo | null;
  fecha_modifica: string | null;
}

export interface ColumnaConTareas {
  columna: ColumnaKanban;
  tareas: TareaSprintItem[];
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
