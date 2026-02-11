// src/shared/sync/idempotency.ts
export const buildIdempotencyKey = (
  prefix: string,
  parts: Array<string | number>,
) => {
  const base = [prefix, ...parts].join(":");
  return base;
};

export const createUUID = () => {
  // modern browsers
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // fallback
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
};
