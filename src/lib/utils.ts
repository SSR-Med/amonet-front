import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiError } from './api/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiErrorMessage(err: unknown, fallback = 'Ha ocurrido un error inesperado'): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError) return 'Error de conexión. Verifica tu internet e intenta de nuevo.';
  if (err instanceof Error) return err.message;
  return fallback;
}
