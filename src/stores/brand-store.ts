import { create } from 'zustand';
import type { Brand } from '@/types';
import * as brandsApi from '@/lib/api/brands';

interface BrandStore {
  items: Brand[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;

  getAll: (page?: number, pageSize?: number, nombre?: string) => Promise<void>;
  getById: (id: string) => Brand | undefined;
  create: (nombre: string) => Promise<Brand>;
  update: (id: string, nombre: string) => Promise<void>;
  delete: (id: string) => Promise<void>;
  isNameUnique: (nombre: string, excludeId?: string) => boolean;
}

export const useBrandStore = create<BrandStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,

  getAll: async (page = 1, pageSize = 20, nombre?: string) => {
    set({ loading: true });
    try {
      const res = await brandsApi.getAllBrands(page, pageSize, nombre);
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

  getById: (id: string) => get().items.find((b) => b.id === id),

  create: async (nombre: string) => {
    const brand = await brandsApi.createBrand({ nombre: nombre.trim() });
    set((state) => ({ items: [...state.items, brand] }));
    return brand;
  },

  update: async (id: string, nombre: string) => {
    await brandsApi.updateBrand(id, { nombre: nombre.trim() });
    set((state) => ({
      items: state.items.map((b) =>
        b.id === id ? { ...b, nombre: nombre.trim() } : b
      ),
    }));
  },

  delete: async (id: string) => {
    await brandsApi.deleteBrand(id);
    set((state) => ({
      items: state.items.filter((b) => b.id !== id),
    }));
  },

  isNameUnique: (nombre: string, excludeId?: string) => {
    const normalized = nombre.trim().toLowerCase();
    return !get().items.some(
      (b) => b.nombre.toLowerCase() === normalized && b.id !== excludeId
    );
  },
}));
