import { create } from 'zustand';
import type { Product } from '@/types';
import * as api from '@/lib/api/products';

interface ProductStore {
  items: Product[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;

  getAll: (page?: number, pageSize?: number) => Promise<void>;
  getById: (id: string) => Product | undefined;
  create: (data: {
    codigo: string;
    nombre: string;
    id_amonet_marca: string;
    materias_primas: { id_amonet_materia_prima: string; formula: string }[];
  }) => Promise<Product>;
  update: (id: string, data: {
    codigo: string;
    nombre: string;
    id_amonet_marca: string;
    materias_primas: { id_amonet_materia_prima: string; formula: string }[];
  }) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,

  getAll: async (page = 1, pageSize = 20) => {
    set({ loading: true });
    try {
      const res = await api.getAllProducts(page, pageSize);
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

  getById: (id: string) => get().items.find((p) => p.id === id),

  create: async (data) => {
    const product = await api.createProduct(data);
    set((state) => ({ items: [...state.items, product] }));
    return product;
  },

  update: async (id, data) => {
    const updated = await api.updateProduct(id, data);
    set((state) => ({
      items: state.items.map((p) => (p.id === id ? updated : p)),
    }));
  },

  delete: async (id: string) => {
    await api.deleteProduct(id);
    set((state) => ({
      items: state.items.filter((p) => p.id !== id),
    }));
  },
}));
