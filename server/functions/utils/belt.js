export const BELT_ORDER = [
  "white",
  "yellow",
  "orange",
  "green",
  "blue",
  "brown",
  "black",
];
export const normalizeBelt = (belt) =>
  typeof belt === "string" ? belt.trim().toLowerCase() : null;

export const isValidBelt = (belt) => {
  const b = normalizeBelt(belt);
  return !!b && BELT_ORDER.includes(b);
};

export const getNextBelt = (belt) => {
  const b = normalizeBelt(belt);
  const idx = BELT_ORDER.indexOf(b);
  if (idx < 0) return null;
  if (idx >= BELT_ORDER.length - 1) return null;
  return BELT_ORDER[idx + 1];
};
