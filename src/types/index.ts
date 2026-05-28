export type RawMaterialType = 'chemical' | 'packaging';

export interface Brand {
  id: string;
  name: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  type: RawMaterialType;
}

export interface ProductVariable {
  id: string;
  name: string;
}

export interface ProductRawMaterial {
  rawMaterialId: string;
  formula: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  brandId: string;
  rawMaterials: ProductRawMaterial[];
}
