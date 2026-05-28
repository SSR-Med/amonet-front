import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Brand } from '@/types';

interface BrandStore {
  brands: Brand[];
  getAll: () => Brand[];
  getById: (id: string) => Brand | undefined;
  create: (name: string) => Brand;
  update: (id: string, name: string) => void;
  delete: (id: string) => boolean;
  isNameUnique: (name: string, excludeId?: string) => boolean;
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      brands: [],

      getAll: () => get().brands,

      getById: (id: string) => get().brands.find((b) => b.id === id),

      create: (name: string) => {
        const newBrand: Brand = {
          id: crypto.randomUUID(),
          name: name.trim(),
        };
        set((state) => ({ brands: [...state.brands, newBrand] }));
        return newBrand;
      },

      update: (id: string, name: string) => {
        set((state) => ({
          brands: state.brands.map((b) =>
            b.id === id ? { ...b, name: name.trim() } : b
          ),
        }));
      },

      delete: (id: string) => {
        const brand = get().getById(id);
        if (!brand) return false;
        set((state) => ({
          brands: state.brands.filter((b) => b.id !== id),
        }));
        return true;
      },

      isNameUnique: (name: string, excludeId?: string) => {
        const normalized = name.trim().toLowerCase();
        return !get().brands.some(
          (b) => b.name.toLowerCase() === normalized && b.id !== excludeId
        );
      },
    }),
    { name: 'cosmeticos-brands' }
  )
);
