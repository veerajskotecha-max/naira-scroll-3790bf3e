/** Stable per-piece figure for the PDP's restrained 48-hour demand cue. */
export const recentSoldCount = (productKey: string) => {
  let hash = 0;
  for (const character of productKey) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 5) + 3;
};
