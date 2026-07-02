import { create } from 'zustand';
import type { PrioridadKanban } from '@/types';
import * as api from '@/lib/api/prioridades-kanban';

interface PrioridadKanbanStore {
  items: PrioridadKanban[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;

  getAll: (page?: number, pageSize?: number) => Promise<void>;
  create: (data: { nombre: string; color_red: number; color_green: number; color_blue: number }) => Promise<PrioridadKanban>;
  update: (id: string, data: { nombre: string; color_red: number; color_green: number; color_blue: number }) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const usePrioridadKanbanStore = create<PrioridadKanbanStore>()((set) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,

  getAll: async (page = 1, pageSize = 20) => {
    set({ loading: true });
    try {
      const res = await api.getAllPrioridadesKanban(page, pageSize);
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

  create: async (data) => {
    const item = await api.createPrioridadKanban(data);
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },

  update: async (id, data) => {
    await api.updatePrioridadKanban(id, data);
    set((state) => ({
      items: state.items.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  delete: async (id) => {
    await api.deletePrioridadKanban(id);
    set((state) => ({
      items: state.items.filter((p) => p.id !== id),
    }));
  },
}));
