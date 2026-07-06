/**
 * Normalize FastAPI / axios error payloads into a single user-facing string.
 */
export function apiErrorMessage(e: unknown): string {
  if (!e || typeof e !== 'object') return 'Something went wrong';
  const any = e as any;
  const d = any?.response?.data?.detail;
  if (d == null) return any?.message ?? 'Something went wrong';
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d
      .map((item: any) => {
        if (typeof item?.msg !== 'string') return JSON.stringify(item);
        return item.msg.replace(/^Value error,\s*/i, '');
      })
      .join('\n');
  }
  return String(d);
}
