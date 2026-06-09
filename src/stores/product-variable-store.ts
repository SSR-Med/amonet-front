import { create } from 'zustand';
import type { ProductVariable } from '@/types';
import * as api from '@/lib/api/product-variables';

interface ProductVariableStore {
  items: ProductVariable[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;

  getAll: (page?: number, pageSize?: number) => Promise<void>;
  getById: (id: string) => ProductVariable | undefined;
  create: (nombre: string) => Promise<ProductVariable>;
  update: (id: string, nombre: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  isNameUnique: (nombre: string, excludeId?: string) => boolean;
  getName: (id: string) => string | undefined;
}

export const useProductVariableStore = create<ProductVariableStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 100,
  loading: false,

  getAll: async (page = 1, pageSize = 100) => {
    set({ loading: true });
    try {
      const res = await api.getAllProductVariables(page, pageSize);
      set({
        items: res.items,
        totalItems: res.total_items,
        currentPage: res.current_page,
        pageSize: res.page_size,
      });
    } finally {
      set({ loading: false });
    }
  },

  getById: (id: string) => get().items.find((pv) => pv.id === id),

  create: async (nombre: string) => {
    const item = await api.createProductVariable({ nombre: nombre.trim() });
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },

  update: async (id: string, nombre: string) => {
    await api.updateProductVariable(id, { nombre: nombre.trim() });
    set((state) => ({
      items: state.items.map((pv) =>
        pv.id === id ? { ...pv, nombre: nombre.trim() } : pv
      ),
    }));
  },

  delete: async (id: string) => {
    await api.deleteProductVariable(id);
    set((state) => ({
      items: state.items.filter((pv) => pv.id !== id),
    }));
  },

  isNameUnique: (nombre: string, excludeId?: string) => {
    const normalized = nombre.trim().toLowerCase();
    return !get().items.some(
      (pv) => pv.nombre.toLowerCase() === normalized && pv.id !== excludeId
    );
  },

  getName: (id: string) => get().items.find((pv) => pv.id === id)?.nombre,
}));
