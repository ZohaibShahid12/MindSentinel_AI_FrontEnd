import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_SESSION_KEY = 'MIND_SENTINEL_ACTIVE_CHAT_SESSION';

export async function getActiveChatSessionId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export async function setActiveChatSessionId(sessionId: number) {
  await AsyncStorage.setItem(ACTIVE_SESSION_KEY, String(sessionId));
}

export async function clearActiveChatSessionId() {
  await AsyncStorage.removeItem(ACTIVE_SESSION_KEY);
}
