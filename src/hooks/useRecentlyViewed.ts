import { useEffect, useState } from "react";

export interface ViewedItem {
  handle: string;
  name: string;
  price: string;
  image: string;
  to: string;
}

const KEY = "naira-recently-viewed";
const MAX = 12;

const read = (): ViewedItem[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((i) => i && i.handle && i.to) : [];
  } catch {
    return [];
  }
};

/**
 * Recently viewed products, stored locally. `current` is recorded on mount and
 * excluded from the returned list so a PDP never recommends itself.
 */
export const useRecentlyViewed = (current?: ViewedItem) => {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    const existing = read();
    setItems(current ? existing.filter((i) => i.handle !== current.handle) : existing);
    if (!current) return;
    const next = [current, ...existing.filter((i) => i.handle !== current.handle)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, [current?.handle]); // eslint-disable-line react-hooks/exhaustive-deps

  return items;
};
