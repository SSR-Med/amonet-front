import { create } from 'zustand';
import type { User, Rol } from '@/types';
import * as usersApi from '@/lib/api/users';
import * as catalogsApi from '@/lib/api/catalogs';

interface UserStore {
  items: User[];
  totalItems: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  roles: Rol[];

  getAll: (page?: number, pageSize?: number, documento?: string, rol?: string, activo?: boolean) => Promise<void>;
  loadRoles: () => Promise<void>;
  create: (data: { documento: string; nombre: string; password: string; rol: string }) => Promise<User>;
  update: (id: string, data: { documento?: string; nombre?: string; rol?: string; password?: string }) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  items: [],
  totalItems: 0,
  currentPage: 1,
  pageSize: 20,
  loading: false,
  roles: [],

  getAll: async (page = 1, pageSize = 20, documento?: string, rol?: string, activo?: boolean) => {
    set({ loading: true });
    try {
      const res = await usersApi.getAllUsers(page, pageSize, documento, rol, activo);
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

  loadRoles: async () => {
    const roles = await catalogsApi.getRoles();
    set({ roles });
  },

  create: async (data) => {
    const user = await usersApi.createUser(data);
    set((state) => ({ items: [...state.items, user] }));
    return user;
  },

  update: async (id, data) => {
    const updated = await usersApi.updateUser(id, data);
    set((state) => ({
      items: state.items.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
  },

  delete: async (id) => {
    await usersApi.deleteUser(id);
    set((state) => ({
      items: state.items.filter((u) => u.id !== id),
    }));
  },
}));
