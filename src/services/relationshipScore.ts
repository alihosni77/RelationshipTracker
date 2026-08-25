export interface RatingInput { value: number; createdAt: string; raterId: string; category: string; }
// Scores require four ratings from both people, favor recent responses, and penalize disagreement.
export function calculateRelationshipScore(ratings: RatingInput[]): number | null {
  if (ratings.length < 4) return null;
  const grouped = new Map<string, number[]>(); const now = Date.now();
  for (const rating of ratings) { const age = Math.max(0, (now - new Date(rating.createdAt).getTime()) / 86400000); const values = grouped.get(rating.raterId) ?? []; values.push(Math.max(1, Math.min(5, rating.value)) * Math.exp(-age / 30)); grouped.set(rating.raterId, values); }
  if (grouped.size < 2) return null;
  const averages = [...grouped.values()].map(values => values.reduce((a,b) => a+b, 0) / values.length);
  const average = averages.reduce((a,b) => a+b, 0) / averages.length;
  return Math.round(Math.max(0, Math.min(100, (average - 1) / 4 * 100 - Math.abs(averages[0] - averages[1]) * 6)));
}
