import { ADMIN, CALIDAD, JEFE_PRODUCCION, TODERO } from './constants';

export const isAdmin = (role?: string) => role === ADMIN;

export const canManageProduction = (role?: string) =>
  !!role && [ADMIN, TODERO, JEFE_PRODUCCION].includes(role);

export const canReviewInventory = (role?: string) =>
  !!role && [ADMIN, TODERO, CALIDAD].includes(role);

export const canManageUsers = (role?: string) => isAdmin(role);

export const canViewLogs = (role?: string) => isAdmin(role);
