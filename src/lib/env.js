/**
 * Public env reader for Next.js (NEXT_PUBLIC_*) with Vite (VITE_*) fallback.
 */
export function getPublicEnv(name) {
  const nextKey = `NEXT_PUBLIC_${name}`;
  const viteKey = `VITE_${name}`;

  if (typeof process !== 'undefined' && process.env) {
    const fromNext = process.env[nextKey];
    if (fromNext != null && String(fromNext).trim() !== '') return String(fromNext);
    const fromVite = process.env[viteKey];
    if (fromVite != null && String(fromVite).trim() !== '') return String(fromVite);
  }

  return undefined;
}
