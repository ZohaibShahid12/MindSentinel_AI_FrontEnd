import { apiRequest } from './client';

export async function sendChat({
  token,
  message,
}: {
  token: string;
  message: string;
}) {
  return apiRequest<any>({
    method: 'post',
    path: '/chat/send',
    token,
    data: { message },
  });
}

export async function getChatHistory({
  token,
  limit = 50,
}: {
  token: string;
  limit?: number;
}) {
  return apiRequest<any[]>({
    method: 'get',
    path: '/chat/history',
    token,
    params: { limit },
  });
}

