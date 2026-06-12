import { get, post } from './client';

interface LoginResponse {
  token: string;
  id: string;
  documento: string;
  nombre: string;
  rol: string;
}

interface CurrentUserResponse {
  id: string;
  documento: string;
  nombre: string;
  rol: string;
}

export async function login(documento: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>('/usuarios/login', { documento, password });
}

export async function getMe(): Promise<CurrentUserResponse> {
  return get<CurrentUserResponse>('/usuarios/me');
}
