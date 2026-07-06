import { apiRequest } from './client';

export async function getTasks({
  token,
  task_date,
}: {
  token: string;
  task_date?: string | null; // YYYY-MM-DD
}) {
  return apiRequest<any[]>({
    method: 'get',
    path: '/tasks/',
    token,
    params: { task_date: task_date ?? undefined },
  });
}

export async function createTask({
  token,
  task_name,
  task_date,
}: {
  token: string;
  task_name: string;
  task_date?: string;
}) {
  return apiRequest<any>({
    method: 'post',
    path: '/tasks/',
    token,
    data: { task_name, task_date },
  });
}

export async function updateTask({
  token,
  task_id,
  is_completed,
}: {
  token: string;
  task_id: number;
  is_completed: boolean;
}) {
  return apiRequest<any>({
    method: 'patch',
    path: `/tasks/${task_id}`,
    token,
    data: { is_completed },
  });
}

