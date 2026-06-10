import "server-only";

const buckets = new Map<string, number[]>();

/**
 * Limiteur en mémoire par clé (suffisant par instance serverless ;
 * les quotas mensuels persistés en base restent la protection principale).
 */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
