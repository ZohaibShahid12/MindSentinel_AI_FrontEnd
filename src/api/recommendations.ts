import { apiRequest } from './client';

export async function getRecommendations({ token }: { token: string }) {
  return apiRequest<any[]>({
    method: 'get',
    path: '/recommendations/',
    token,
  });
}

export async function generateRecommendations({
  token,
  emotion,
  risk_level,
}: {
  token: string;
  emotion: string;
  risk_level: string;
}) {
  return apiRequest<any>({
    method: 'post',
    path: '/recommendations/generate',
    token,
    data: { emotion, risk_level },
  });
}
