/**
 * Push notifications (FCM) for the mobile app — modular RNFirebase API (v22+).
 *
 * Flow: after the user is authenticated we ask for permission, read the device
 * token, and register it with the backend (`POST /devices`). The backend then
 * pushes supervision/system messages to this device. Foreground messages are
 * handled here; background/quit messages are shown by the OS automatically (see
 * the background handler wired in `index.js`).
 */
import { PermissionsAndroid, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  AuthorizationStatus,
  getMessaging,
  getToken,
  onMessage,
  onTokenRefresh,
  requestPermission,
} from '@react-native-firebase/messaging';
import { registerDevice } from './api';
import { showBanner } from './banner';

const fcm = getMessaging(getApp());

let started = false;
let unsubscribers: Array<() => void> = [];

/** Android 13+ needs the runtime POST_NOTIFICATIONS permission; older versions grant it implicitly. */
async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android' || Platform.Version < 33) return true;
  try {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/** Read the FCM token and register it with the backend (best-effort). */
async function syncToken(): Promise<void> {
  try {
    const token = await getToken(fcm);
    if (token) {
      await registerDevice(token, Platform.OS);
    }
  } catch (e) {
    // best-effort — never block the app on push setup
    console.warn('[notifications] token sync failed', e);
  }
}

/**
 * Initialise push once the user is signed in. Safe to call multiple times —
 * it only wires listeners on the first successful run.
 */
export async function initNotifications(): Promise<void> {
  if (started) {
    // token may have changed between sessions; re-sync but don't re-wire
    await syncToken();
    return;
  }

  const granted = await ensureAndroidPermission();
  const authStatus = await requestPermission(fcm);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (!granted && !enabled) return; // user declined; nothing to register

  await syncToken();

  // Re-register whenever FCM rotates the token.
  unsubscribers.push(onTokenRefresh(fcm, t => registerDevice(t, Platform.OS).catch(() => {})));

  // Foreground messages don't raise a system notification, so show our own banner.
  unsubscribers.push(
    onMessage(fcm, async msg => {
      const title = msg.notification?.title || 'آرامینا';
      const body = msg.notification?.body || '';
      if (body) showBanner(title, body);
    }),
  );

  started = true;
}

/** Tear down listeners (e.g. on logout). */
export function stopNotifications(): void {
  unsubscribers.forEach(u => u());
  unsubscribers = [];
  started = false;
}
