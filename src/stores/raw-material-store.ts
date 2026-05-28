import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RawMaterial, RawMaterialType } from '@/types';

interface RawMaterialStore {
  rawMaterials: RawMaterial[];
  getAll: () => RawMaterial[];
  getById: (id: string) => RawMaterial | undefined;
  create: (name: string, type: RawMaterialType) => RawMaterial;
  update: (id: string, name: string, type: RawMaterialType) => void;
  delete: (id: string) => boolean;
  isNameUnique: (name: string, excludeId?: string) => boolean;
  isUsedInProducts: (id: string) => boolean;
}

export const useRawMaterialStore = create<RawMaterialStore>()(
  persist(
    (set, get) => ({
      rawMaterials: [],

      getAll: () => get().rawMaterials,

      getById: (id: string) => get().rawMaterials.find((rm) => rm.id === id),

      create: (name: string, type: RawMaterialType) => {
        const newRawMaterial: RawMaterial = {
          id: crypto.randomUUID(),
          name: name.trim(),
          type,
        };
        set((state) => ({ rawMaterials: [...state.rawMaterials, newRawMaterial] }));
        return newRawMaterial;
      },

      update: (id: string, name: string, type: RawMaterialType) => {
        set((state) => ({
          rawMaterials: state.rawMaterials.map((rm) =>
            rm.id === id ? { ...rm, name: name.trim(), type } : rm
          ),
        }));
      },

      delete: (id: string) => {
        if (get().isUsedInProducts(id)) return false;
        set((state) => ({
          rawMaterials: state.rawMaterials.filter((rm) => rm.id !== id),
        }));
        return true;
      },

      isNameUnique: (name: string, excludeId?: string) => {
        const normalized = name.trim().toLowerCase();
        return !get().rawMaterials.some(
          (rm) => rm.name.toLowerCase() === normalized && rm.id !== excludeId
        );
      },

      isUsedInProducts: (id: string) => {
        return false;
      },
    }),
    { name: 'cosmeticos-raw-materials' }
  )
);
