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

export interface PaginatedResponse<T> {
  items: T[];
  current_page: number;
  total_items: number;
  page_size: number;
}
