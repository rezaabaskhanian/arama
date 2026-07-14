/**
 * Thin async key/value store backed by AsyncStorage — the mobile equivalent of
 * the web app's `localStorage` (token, userId, userName, traumaType, …).
 * Values persist across full app restarts.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  userId: 'userId',
  userName: 'userName',
  userRole: 'userRole',
  traumaType: 'traumaType',
  prefs: 'aramina_prefs',
  onboarded: 'aramina_onboarded',
  messagesSeenAt: 'aramina_messages_seen_at',
} as const;

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // best-effort; ignore write failures
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function multiRemove(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // ignore
  }
}
