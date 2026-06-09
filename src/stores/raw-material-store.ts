import { create } from 'zustand';
import type { RawMaterial, CatalogoInfo } from '@/types';
import * as api from '@/lib/api/raw-materials';
import * as catalogsApi from '@/lib/api/catalogs';

interface RawMaterialStore {
  items: RawMaterial[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  tipos: CatalogoInfo[];
  tiposUnidad: CatalogoInfo[];

  getAll: (page?: number, pageSize?: number, nombre?: string) => Promise<void>;
  loadCatalogs: () => Promise<void>;
  getById: (id: string) => RawMaterial | undefined;
  create: (data: { nombre: string; id_cat_amonet_tipo_materia_prima: string; id_cat_amonet_tipo_unidad: string }) => Promise<RawMaterial>;
  update: (id: string, data: { nombre: string; id_cat_amonet_tipo_materia_prima: string; id_cat_amonet_tipo_unidad: string }) => Promise<void>;
  delete: (id: string) => Promise<void>;
  isNameUnique: (nombre: string, excludeId?: string) => boolean;
}

export const useRawMaterialStore = create<RawMaterialStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,
  tipos: [],
  tiposUnidad: [],

  getAll: async (page = 1, pageSize = 20, nombre?: string) => {
    set({ loading: true });
    try {
      const res = await api.getAllRawMaterials(page, pageSize, nombre);
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

  loadCatalogs: async () => {
    const [tipos, tiposUnidad] = await Promise.all([
      catalogsApi.getTiposMateriaPrima(),
      catalogsApi.getTiposUnidad(),
    ]);
    set({ tipos, tiposUnidad });
  },

  getById: (id: string) => get().items.find((rm) => rm.id === id),

  create: async (data) => {
    const item = await api.createRawMaterial(data);
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },

  update: async (id, data) => {
    const updated = await api.updateRawMaterial(id, data);
    set((state) => ({
      items: state.items.map((rm) => (rm.id === id ? updated : rm)),
    }));
  },

  delete: async (id: string) => {
    await api.deleteRawMaterial(id);
    set((state) => ({
      items: state.items.filter((rm) => rm.id !== id),
    }));
  },

  isNameUnique: (nombre: string, excludeId?: string) => {
    const normalized = nombre.trim().toLowerCase();
    return !get().items.some(
      (rm) => rm.nombre.toLowerCase() === normalized && rm.id !== excludeId
    );
  },
}));
