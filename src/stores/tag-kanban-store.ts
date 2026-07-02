import { create } from 'zustand';
import type { TagKanban } from '@/types';
import * as api from '@/lib/api/tags-kanban';

interface TagKanbanStore {
  items: TagKanban[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;

  getAll: (page?: number, pageSize?: number) => Promise<void>;
  create: (data: { nombre: string; color_red: number; color_green: number; color_blue: number }) => Promise<TagKanban>;
  update: (id: string, data: { nombre: string; color_red: number; color_green: number; color_blue: number }) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const useTagKanbanStore = create<TagKanbanStore>()((set) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,

  getAll: async (page = 1, pageSize = 20) => {
    set({ loading: true });
    try {
      const res = await api.getAllTagsKanban(page, pageSize);
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
    const item = await api.createTagKanban(data);
    set((state) => ({ items: [...state.items, item] }));
    return item;
  },

  update: async (id, data) => {
    await api.updateTagKanban(id, data);
    set((state) => ({
      items: state.items.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }));
  },

  delete: async (id) => {
    await api.deleteTagKanban(id);
    set((state) => ({
      items: state.items.filter((t) => t.id !== id),
    }));
  },
}));
