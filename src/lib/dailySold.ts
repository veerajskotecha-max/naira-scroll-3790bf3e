/** The "sold in the last 24 hours" figure shown on a piece's page: fixed per piece, 1–20. */
export const dailySoldCount = (productKey: string) => {
  let hash = 0;
  for (const character of productKey) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return (hash % 20) + 1;
};
