import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductRawMaterial } from '@/types';

interface ProductStore {
  products: Product[];
  getAll: () => Product[];
  getById: (id: string) => Product | undefined;
  create: (data: { name: string; code: string; brandId: string; rawMaterials: ProductRawMaterial[] }) => Product;
  update: (id: string, data: { name: string; code: string; brandId: string; rawMaterials: ProductRawMaterial[] }) => void;
  delete: (id: string) => boolean;
  isBrandUsed: (brandId: string) => boolean;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],

      getAll: () => get().products,

      getById: (id: string) => get().products.find((p) => p.id === id),

      create: (data) => {
        const newProduct: Product = {
          id: crypto.randomUUID(),
          name: data.name.trim(),
          code: data.code.trim(),
          brandId: data.brandId,
          rawMaterials: data.rawMaterials,
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        return newProduct;
      },

      update: (id: string, data) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, name: data.name.trim(), code: data.code.trim(), brandId: data.brandId, rawMaterials: data.rawMaterials }
              : p
          ),
        }));
      },

      delete: (id: string) => {
        if (!get().getById(id)) return false;
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
        return true;
      },

      isBrandUsed: (brandId: string) => get().products.some((p) => p.brandId === brandId),
    }),
    { name: 'cosmeticos-products' }
  )
);
