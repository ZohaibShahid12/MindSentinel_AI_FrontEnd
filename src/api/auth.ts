import { apiRequest } from './client';

export async function registerUser(params: { name: string; email: string; password: string }) {
  return apiRequest<any>({
    method: 'post',
    path: '/auth/register',
    data: params,
  });
}

export async function loginUser(params: { email: string; password: string }) {
  return apiRequest<any>({
    method: 'post',
    path: '/auth/login',
    data: params,
  });
}

