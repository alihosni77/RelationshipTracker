import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export type RealtimeEvent =
  | { type: 'love_tap'; coupleId: string; senderId: string; createdAt: string }
  | { type: 'message'; coupleId: string; messageId: string; createdAt: string };

const clients = new Map<string, Set<WebSocket>>();

export function attachRealtime(server: Server) {
  const wss = new WebSocketServer({ server, path: '/realtime' });
  wss.on('connection', (socket, request) => {
    const url = new URL(request.url ?? '', 'http://localhost');
    const coupleId = url.searchParams.get('coupleId');
    if (!coupleId) return socket.close(1008, 'coupleId required');
    const set = clients.get(coupleId) ?? new Set<WebSocket>();
    set.add(socket);
    clients.set(coupleId, set);
    socket.on('close', () => {
      set.delete(socket);
      if (!set.size) clients.delete(coupleId);
    });
  });
  return wss;
}

export function broadcast(coupleId: string, event: RealtimeEvent) {
  const payload = JSON.stringify(event);
  for (const socket of clients.get(coupleId) ?? []) {
    if (socket.readyState === WebSocket.OPEN) socket.send(payload);
  }
}
