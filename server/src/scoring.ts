export type Rating = { raterId: string; score: number; createdAt: string };

export function relationshipScore(ratings: Rating[], memberIds: string[], now = Date.now()) {
  if (memberIds.length !== 2) return { score: null, confidence: 'insufficient_feedback' as const };
  const cutoff = now - 90 * 24 * 60 * 60 * 1000;
  const recent = ratings.filter(r => new Date(r.createdAt).getTime() >= cutoff && memberIds.includes(r.raterId));
  const perPerson = memberIds.map(id => recent.filter(r => r.raterId === id));
  if (perPerson.some(group => group.length < 3)) return { score: null, confidence: 'insufficient_feedback' as const };
  const avgs = perPerson.map(group => group.reduce((sum, r) => sum + r.score, 0) / group.length);
  const disagreement = Math.abs(avgs[0] - avgs[1]);
  const penalty = disagreement > 2 ? 0.25 : disagreement > 1 ? 0.1 : 0;
  return { score: Number(((avgs[0] + avgs[1]) / 2 * (1 - penalty)).toFixed(2)), confidence: 'balanced' as const };
}
