import { useEffect, useState } from "react";

/*
  True while any element marked `data-quiet-zone` is on screen. Floating
  widgets read it and step aside: the reel bubble sat over the copy under the
  3D box at the foot of every product page.
*/
export const useQuietZone = () => {
  const [inZone, setInZone] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const zones = Array.from(document.querySelectorAll("[data-quiet-zone]"));
    if (!zones.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
      setInZone(visible.size > 0);
    });
    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  return inZone;
};
