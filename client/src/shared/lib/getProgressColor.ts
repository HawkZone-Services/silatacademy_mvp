export const getProgressColor = (rate: number) => {
  const clamped = Math.min(100, Math.max(0, rate));
  const hue = (clamped / 100) * 120;
  const lightness = 35 + (clamped / 100) * 20;

  return `hsl(${hue}, 85%, ${lightness}%)`;
};
