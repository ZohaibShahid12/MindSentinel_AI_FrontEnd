import { apiRequest } from './client';

export async function analyzeMood({
  token,
  text_input,
  selected_emoji,
}: {
  token: string;
  text_input: string;
  selected_emoji?: string | null;
}) {
  return apiRequest<any>({
    method: 'post',
    path: '/mood/analyze',
    token,
    data: { text_input, selected_emoji },
  });
}

export async function getMoodHistory({
  token,
  limit = 20,
}: {
  token: string;
  limit?: number;
}) {
  return apiRequest<any[]>({
    method: 'get',
    path: '/mood/history',
    token,
    params: { limit },
  });
}

