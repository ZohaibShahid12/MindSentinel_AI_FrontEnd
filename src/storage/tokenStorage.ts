import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'MIND_SENTINEL_ACCESS_TOKEN';

type TokenListener = (token: string | null) => void;
const listeners = new Set<TokenListener>();

function emit(token: string | null) {
  listeners.forEach((l) => {
    try {
      l(token);
    } catch {
      // ignore listener failures
    }
  });
}

export function onTokenChange(listener: TokenListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  emit(token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  emit(null);
}

