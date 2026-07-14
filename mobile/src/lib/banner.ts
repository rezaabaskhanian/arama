/**
 * Tiny event bus so non-component code (the FCM foreground handler in
 * `notifications.ts`) can trigger the in-app banner rendered by
 * `components/InAppBanner`. Single listener — only one banner host is mounted.
 */
export type BannerPayload = { title: string; body: string };
type Listener = (p: BannerPayload) => void;

let listener: Listener | null = null;

export function setBannerListener(fn: Listener | null): void {
  listener = fn;
}

export function showBanner(title: string, body: string): void {
  listener?.({ title, body });
}
