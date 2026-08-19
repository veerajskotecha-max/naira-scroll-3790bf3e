import { Link } from "react-router-dom";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { menuCategories, menuEdits, menuOccasions, menuApparel } from "@/data/navigation";

const jost = { fontFamily: "var(--nf-font-label)" } as const;

const cdn = (url: string, w: number) => {
  if (!url?.includes("cdn.shopify.com")) return url;
  const [base, q] = url.split("?");
  const params = new URLSearchParams(q);
  params.set("width", String(w));
  return `${base}?${params.toString()}`;
};

const Column = ({
  title,
  links,
  onNavigate,
}: {
  title: string;
  links: Array<{ label: string; to: string }>;
  onNavigate?: () => void;
}) => (
  <div>
    <p className="text-[9px] tracking-[0.28em] text-nf-ink/40" style={jost}>
      {title.toUpperCase()}
    </p>
    <ul className="mt-4 space-y-2.5">
      {links.map((l) => (
        <li key={l.label}>
          <Link
            to={l.to}
            onClick={onNavigate}
            className="font-cormorant text-[13px] uppercase tracking-[0.1em] text-nf-ink/75 transition-colors hover:text-nf-ink"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Desktop mega-menu for the SHOP entry: category image tiles pulled from the
 * live Shopify catalogue, plus edit / occasion / apparel columns.
 */
const MegaMenu = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { jewellery } = useLiveJewellery();

  const tiles = menuCategories.map((c) => ({
    ...c,
    image: jewellery.find((p) => p.category === c.category)?.image,
  }));

  return (
    <div
      className="w-[min(1100px,92vw)] px-8 py-8"
      style={{ backgroundColor: "#F4F1ED", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 14px 40px rgba(0,0,0,0.10)" }}
    >
      <div className="grid grid-cols-[1.35fr_repeat(3,0.65fr)] gap-8">
        <div>
          <p className="text-[9px] tracking-[0.28em] text-nf-ink/40" style={jost}>
            SHOP BY CATEGORY
          </p>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {tiles.map((t) => (
              <Link key={t.label} to={t.to} onClick={onNavigate} className="group/tile block">
                <div className="aspect-square overflow-hidden bg-nf-ivory-deep">
                  {t.image && (
                    <img
                      src={cdn(t.image, 240)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/tile:scale-105"
                    />
                  )}
                </div>
                <p className="mt-2 font-cormorant text-[12px] uppercase tracking-[0.1em] text-nf-ink/75 transition-colors group-hover/tile:text-nf-ink">
                  {t.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <Column title="The Edits" links={menuEdits} onNavigate={onNavigate} />
        <Column title="By Occasion" links={menuOccasions} onNavigate={onNavigate} />
        <Column title="Apparel" links={menuApparel} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default MegaMenu;
