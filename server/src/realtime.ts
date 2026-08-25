import jwt from 'jsonwebtoken';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server, IncomingMessage } from 'http';
import type { Pool } from 'pg';

export type RealtimeEvent =
  | { type: 'love_tap'; coupleId: string; senderId: string; createdAt: string }
  | { type: 'message'; coupleId: string; messageId: string; createdAt: string };

const clients = new Map<string, Set<WebSocket>>();
const connectionWindows = new Map<string, { startedAt: number; count: number }>();
const MAX_CONNECTIONS_PER_MINUTE = 12;
const MAX_CONNECTIONS_PER_COUPLE = 6;

function clientIp(request: IncomingMessage) {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  return request.socket.remoteAddress ?? 'unknown';
}

export function attachRealtime(server: Server, pool: Pool, jwtSecret: string, nodeEnv = process.env.NODE_ENV ?? 'development') {
  const wss = new WebSocketServer({ server, path: '/realtime', clientTracking: true, maxPayload: 16 * 1024 });
  wss.on('connection', async (socket, request) => {
    if (nodeEnv === 'production' && request.headers['x-forwarded-proto'] !== 'https') {
      return socket.close(1008, 'secure_transport_required');
    }

    const ip = clientIp(request);
    const now = Date.now();
    const window = connectionWindows.get(ip);
    if (!window || now - window.startedAt >= 60_000) {
      connectionWindows.set(ip, { startedAt: now, count: 1 });
    } else {
      window.count += 1;
      if (window.count > MAX_CONNECTIONS_PER_MINUTE) return socket.close(1013, 'connection_rate_limited');
    }

    const url = new URL(request.url ?? '', 'http://localhost');
    const coupleId = url.searchParams.get('coupleId');
    const protocol = request.headers['sec-websocket-protocol'];
    const token = Array.isArray(protocol)
      ? protocol.find(value => value.startsWith('bearer.'))?.slice(7)
      : protocol?.startsWith('bearer.')
        ? protocol.slice(7)
        : undefined;
    if (!coupleId || !token) return socket.close(1008, 'authentication_required');

    try {
      const payload = jwt.verify(token, jwtSecret, {
        issuer: 'relationship-tracker',
        audience: 'relationship-client',
      });
      const userId = String((payload as jwt.JwtPayload).sub);
      if (!userId || !(payload as jwt.JwtPayload).exp) return socket.close(1008, 'invalid_token');

      const member = await pool.query('select 1 from couple_members where couple_id=$1 and user_id=$2', [coupleId, userId]);
      if (!member.rowCount) return socket.close(1008, 'not_a_couple_member');

      const set = clients.get(coupleId) ?? new Set<WebSocket>();
      if (set.size >= MAX_CONNECTIONS_PER_COUPLE) return socket.close(1013, 'couple_connection_limit');
      set.add(socket);
      clients.set(coupleId, set);
      socket.on('close', () => { set.delete(socket); if (!set.size) clients.delete(coupleId); });
    } catch {
      socket.close(1008, 'invalid_token');
    }
  });
  return wss;
}

export function broadcast(coupleId: string, event: RealtimeEvent) {
  const payload = JSON.stringify(event);
  for (const socket of clients.get(coupleId) ?? []) {
    if (socket.readyState === WebSocket.OPEN) socket.send(payload);
  }
}
