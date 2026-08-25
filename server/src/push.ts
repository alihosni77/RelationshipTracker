import type { Pool } from 'pg';

export async function sendPartnerPush(pool: Pool, coupleId: string, senderId: string, body: string) {
  const result = await pool.query<{ expo_push_token: string }>(
    'select expo_push_token from push_devices where couple_id=$1 and user_id<>$2',
    [coupleId, senderId],
  );
  for (const row of result.rows) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: row.expo_push_token, sound: 'default', title: 'هم‌قدم', body }),
      });
    } catch {
      // Notification failure must not fail the primary relationship action.
    }
  }
}
