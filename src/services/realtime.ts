const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export type RealtimeEvent =
  | { type: 'love_tap'; coupleId: string; senderId: string; createdAt: string }
  | { type: 'message'; coupleId: string; messageId: string; createdAt: string };

export function connectRealtime(coupleId: string, token: string, onEvent: (event: RealtimeEvent) => void) {
  const wsUrl = API_URL.replace(/^http/, 'ws');
  const socket = new WebSocket(`${wsUrl}/realtime?coupleId=${encodeURIComponent(coupleId)}&token=${encodeURIComponent(token)}`);
  socket.onmessage = message => {
    try { onEvent(JSON.parse(message.data as string) as RealtimeEvent); } catch { /* ignore malformed event */ }
  };
  return () => socket.close();
}
