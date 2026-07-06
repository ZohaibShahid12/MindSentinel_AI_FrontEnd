import axios from 'axios';

import { resetToLogin } from '../navigation/navigationRef';
import { clearToken } from '../storage/tokenStorage';

let cachedBaseUrl: string | null = null;


const PC_LAN_IP = '192.168.18.105'; 

const CANDIDATE_BASE_URLS = [
  ...(PC_LAN_IP ? [`http://${PC_LAN_IP}:8000`] : []),
  'http://10.0.2.2:8000',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
  'http://172.19.80.1:8000',
  'http://10.187.211.130:8000',
];

export async function resolveApiBaseUrl(): Promise<string> {
  if (cachedBaseUrl) return cachedBaseUrl;

  let lastErr: unknown = null;
  for (const baseUrl of CANDIDATE_BASE_URLS) {
    try {
      const res = await axios.get(`${baseUrl}/`, { timeout: 2500 });
      if (res.status >= 200 && res.status < 300) {
        cachedBaseUrl = baseUrl;
        return baseUrl;
      }
    } catch (e) {
      lastErr = e;
    }
  }

  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr);
  throw new Error(
    `Backend not reachable from the phone. Tried: ${CANDIDATE_BASE_URLS.join(
      ', '
    )}. Last error: ${msg}. Update CANDIDATE_BASE_URLS in src/api/client.ts to your PC LAN IP.`
  );
}

export async function apiRequest<T>({
  method,
  path,
  data,
  token,
  params,
}: {
  method: 'get' | 'post' | 'patch' | 'delete';
  path: string;
  data?: any;
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined>;
}): Promise<T> {
  const baseUrl = await resolveApiBaseUrl();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await axios.request<T>({
      method,
      url: `${baseUrl}${path}`,
      data,
      params,
      headers,
      timeout: 20000,
    });

    return res.data;
  } catch (e: unknown) {
    const err = e as { response?: { status?: number } };
    if (err?.response?.status === 401 && token) {
      await clearToken();
      resetToLogin();
    }
    throw e;
  }
}

