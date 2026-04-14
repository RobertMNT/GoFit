// Rate limiter en memoria basado en IP + userId
// Nota: se reinicia con cada deploy. Para producción usar Redis/Upstash.

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpieza periódica para evitar memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

interface RateLimitOptions {
  /** Número máximo de peticiones permitidas en la ventana */
  limit: number;
  /** Duración de la ventana en milisegundos */
  windowMs: number;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(identifier: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Primera petición en esta ventana o ventana expirada
    store.set(identifier, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, resetAt: now + opts.windowMs };
  }

  if (entry.count >= opts.limit) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { ok: true, remaining: opts.limit - entry.count, resetAt: entry.resetAt };
}
