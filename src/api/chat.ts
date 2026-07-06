import { apiRequest } from './client';

export type ChatSession = {
  session_id: number;
  title?: string | null;
  created_at?: string;
  updated_at?: string;
  message_count?: number;
};

export async function createChatSession({ token }: { token: string }) {
  return apiRequest<ChatSession>({
    method: 'post',
    path: '/chat/sessions',
    token,
  });
}

export async function listChatSessions({ token, limit = 30 }: { token: string; limit?: number }) {
  return apiRequest<ChatSession[]>({
    method: 'get',
    path: '/chat/sessions',
    token,
    params: { limit },
  });
}

export async function sendChat({
  token,
  message,
  session_id,
}: {
  token: string;
  message: string;
  session_id: number;
}) {
  return apiRequest<any>({
    method: 'post',
    path: '/chat/send',
    token,
    data: { message, session_id },
  });
}

export async function getChatHistory({
  token,
  session_id,
  limit = 50,
}: {
  token: string;
  session_id: number;
  limit?: number;
}) {
  return apiRequest<any[]>({
    method: 'get',
    path: '/chat/history',
    token,
    params: { session_id, limit },
  });
}
