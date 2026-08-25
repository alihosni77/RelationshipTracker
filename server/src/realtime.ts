import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { Pool } from 'pg';

export type RealtimeEvent =
  | { type: 'love_tap'; coupleId: string; senderId: string; createdAt: string }
  | { type: 'message'; coupleId: string; messageId: string; createdAt: string };

const clients = new Map<string, Set<WebSocket>>();

export function attachRealtime(server: Server, pool: Pool, jwtSecret: string) {
  const wss = new WebSocketServer({ server, path: '/realtime' });
  wss.on('connection', async (socket, request) => {
    const url = new URL(request.url ?? '', 'http://localhost');
    const coupleId = url.searchParams.get('coupleId');
    const token = url.searchParams.get('token');
    if (!coupleId || !token) return socket.close(1008, 'authentication required');
    try {
      const payload = jwt.verify(token, jwtSecret, { issuer: 'relationship-tracker', audience: 'mobile' });
      const userId = String((payload as jwt.JwtPayload).sub);
      const member = await pool.query('select 1 from couple_members where couple_id=$1 and user_id=$2', [coupleId, userId]);
      if (!member.rowCount) return socket.close(1008, 'not a couple member');
      const set = clients.get(coupleId) ?? new Set<WebSocket>();
      set.add(socket);
      clients.set(coupleId, set);
      socket.on('close', () => { set.delete(socket); if (!set.size) clients.delete(coupleId); });
    } catch { socket.close(1008, 'invalid token'); }
  });
  return wss;
}

export function broadcast(coupleId: string, event: RealtimeEvent) {
  const payload = JSON.stringify(event);
  for (const socket of clients.get(coupleId) ?? []) if (socket.readyState === WebSocket.OPEN) socket.send(payload);
}
