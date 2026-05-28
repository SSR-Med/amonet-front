import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductVariable } from '@/types';

interface ProductVariableStore {
  productVariables: ProductVariable[];
  getAll: () => ProductVariable[];
  getById: (id: string) => ProductVariable | undefined;
  create: (name: string) => ProductVariable;
  update: (id: string, name: string) => void;
  delete: (id: string) => boolean;
  isNameUnique: (name: string, excludeId?: string) => boolean;
  getName: (id: string) => string | undefined;
}

export const useProductVariableStore = create<ProductVariableStore>()(
  persist(
    (set, get) => ({
      productVariables: [],

      getAll: () => get().productVariables,

      getById: (id: string) => get().productVariables.find((pv) => pv.id === id),

      create: (name: string) => {
        const newVariable: ProductVariable = {
          id: crypto.randomUUID(),
          name: name.trim(),
        };
        set((state) => ({ productVariables: [...state.productVariables, newVariable] }));
        return newVariable;
      },

      update: (id: string, name: string) => {
        set((state) => ({
          productVariables: state.productVariables.map((pv) =>
            pv.id === id ? { ...pv, name: name.trim() } : pv
          ),
        }));
      },

      delete: (id: string) => {
        const variable = get().getById(id);
        if (!variable) return false;
        set((state) => ({
          productVariables: state.productVariables.filter((pv) => pv.id !== id),
        }));
        return true;
      },

      isNameUnique: (name: string, excludeId?: string) => {
        const normalized = name.trim().toLowerCase();
        return !get().productVariables.some(
          (pv) => pv.name.toLowerCase() === normalized && pv.id !== excludeId
        );
      },

      getName: (id: string) => get().productVariables.find((pv) => pv.id === id)?.name,
    }),
    { name: 'cosmeticos-product-variables' }
  )
);
