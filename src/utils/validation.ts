export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export const INVALID_EMAIL_MESSAGE =
  'Please enter a valid email address (e.g. name@example.com).';
