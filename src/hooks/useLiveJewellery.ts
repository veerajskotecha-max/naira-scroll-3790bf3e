import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts, type ShopifyProductNode } from "@/lib/shopify";
import { variantFields } from "@/lib/variants";
import { jewellery as staticJewellery, type JewelPiece } from "@/data/jewellery";
import { isJewelleryProduct } from "@/lib/isJewelleryProduct";

/** A listing's size guide photo: alt text or file name says "size guide". */
const SIZE_GUIDE = /size[-_ ]?guide/i;
const isSizeGuide = (edge: { node: { url: string; altText: string | null } }) =>
  SIZE_GUIDE.test(`${edge.node.url} ${edge.node.altText ?? ""}`);

/** Shopify occasionally places the Naira gift-box photo before the product
 * photo. Packaging is useful in the gallery, but must never become the cover.
 * The size guide always comes last: the product shots, then the box, then size. */
const productImagesFirst = (node: ShopifyProductNode): string[] =>
  node.images.edges
    .map((edge, index) => ({
      url: edge.node.url,
      index,
      rank: isSizeGuide(edge)
        ? 2
        : /(?:naira[-_ ]?packaging|gift\s*box|shipping\s*carton)/i.test(`${edge.node.url} ${edge.node.altText ?? ""}`)
          ? 1
          : 0,
    }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ url }) => url);

/** The size guide photo, shown again inside the Details fold. */
const sizeGuideOf = (node: ShopifyProductNode): string | undefined => node.images.edges.find(isSizeGuide)?.node.url;

/** Per-piece picks for the photo that opens the product page's gallery — the
 * shot that sells the piece goes first. Cards have their own list
 * (data/cardCovers): there it is always the product alone. */
const COVER_PICKS: Record<string, RegExp> = {
  // Bold Nocturne Chain — the on-model shot shows the chain's true weight.
  "bold-nocturne-chain": /YF5144_2_worn/i,
  // Solitaire Whisper Studs — the zoomed stud close-up reads far clearer
  // than the on-model crop the listing currently opens with.
  "solitaire-whisper-studs": /solitaire-whisper-studs-2\./i,
};

const coverFirst = (handle: string, urls: string[]): string[] => {
  const pick = COVER_PICKS[handle];
  if (!pick) return urls;
  const i = urls.findIndex((url) => pick.test(url));
  if (i <= 0) return urls;
  return [urls[i], ...urls.slice(0, i), ...urls.slice(i + 1)];
};

/**
 * Overlays LIVE Shopify data (images, price, variant id, availability) on top of
 * the bundled catalogue. The static file is only a first-paint fallback — once
 * the Storefront API responds, everything shown comes straight from Shopify, so
 * new photos, price edits and sold-out states appear without a redeploy.
 */
const mergeLive = (piece: JewelPiece, node?: ShopifyProductNode): JewelPiece => {
  if (!node) return piece;
  const images = productImagesFirst(node);
  const gallery = coverFirst(piece.handle, images.length ? images : piece.gallery);
  // The first buyable variant leads: its price is one the shopper can pay.
  const { lead, availableForSale, choice } = variantFields(node);
  const price = lead ? lead.price : piece.price;
  // MRP only counts when Shopify actually has a higher compare-at price set.
  const compareAtPrice = lead?.compareAtPrice;

  return {
    ...piece,
    name: node.title || piece.name,
    price,
    priceLabel: `₹${price.toLocaleString("en-IN")}`,
    compareAtPrice,
    compareAtLabel: compareAtPrice ? `₹${compareAtPrice.toLocaleString("en-IN")}` : undefined,
    variantId: lead?.id ?? piece.variantId,
    availableForSale,
    image: gallery[0] ?? piece.image,
    cover: node.leadImage,
    gallery,
    sizeGuide: sizeGuideOf(node),
    description: normalizeMetalCopy(node.description) || piece.description,
    tags: node.tags?.length ? node.tags : piece.tags,
    ...choice,
  };
};

/**
 * Metal copy hygiene for Shopify listing text:
 *  - "silver" / "sterling silver" is never claimed — those pieces are rhodium coated.
 *  - A single-metal piece must not mention the other metal anywhere in its copy
 *    (a gold piece can't suggest "pair with silver-tone studs", and vice versa).
 *    Genuine two-tone pieces (both metals named in the Plating line) are left alone.
 */
const platingLine = (raw: string) => (raw.match(/Plating:\s*([^]{0,120})/i)?.[1] ?? "").split(/Material:/i)[0];

const normalizeMetalCopy = (raw: string): string => {
  if (!raw) return raw;

  /* A piece that carries a real silver hallmark is describing actual silver,
     not a supplier calling rhodium plating "silver tone". Verdant Drop Earrings
     discloses 925 sterling silver ear posts on a copper alloy body — the rules
     below were rewriting that true statement into "925 rhodium coated metal
     posts", which is false. Leave hallmarked copy exactly as written. */
  if (/\b925\b/.test(raw)) return raw;

  // 1. Silver wording → rhodium coated, everywhere.
  let text = raw
    .replace(/rhodium plated silver[- ]tone/gi, "rhodium coated")
    .replace(/sterling silver/gi, "rhodium coated metal")
    .replace(/silver[- ]tone/gi, "rhodium coated")
    .replace(/\bsilver\b/gi, "rhodium coated")
    .replace(/rhodium coated plated/gi, "rhodium coated");

  // 2. Decide the piece's actual metal from its Plating line.
  const plating = platingLine(raw);
  const platingGold = /gold/i.test(plating);
  const platingCool = /rhodium|silver|steel/i.test(plating);
  const twoTone = (platingGold && platingCool) || /two[- ]tone/i.test(raw);
  if (twoTone) return text;

  if (platingCool && !platingGold) {
    // Rhodium piece — drop every gold reference.
    text = text
      .replace(/18k gold[- ]tone plated/gi, "rhodium coated")
      .replace(/gold[- ]tone/gi, "rhodium coated")
      .replace(/\bgold\b/gi, "rhodium coated");
  } else if (platingGold && !platingCool) {
    // Gold piece — drop every rhodium/steel reference.
    text = text
      .replace(/rhodium coated metal/gi, "18k gold tone plated metal")
      .replace(/rhodium coated/gi, "gold tone")
      .replace(/\b(?:steel|cool)[- ]tone\b/gi, "gold tone")
      .replace(/\brhodium\b/gi, "gold tone");
  }

  return text
    .replace(/(gold tone[, ]+)+gold tone/gi, "gold tone")
    .replace(/(rhodium coated[, ]+)+rhodium coated/gi, "rhodium coated");
};

const isRhodium = (text: string) => /rhodium/i.test(text || "") && !/gold/i.test(text || "");


/** Shopify productType → the four listing categories used on /jewellery. */
const CATEGORY_BY_TYPE: Record<string, JewelPiece["category"]> = {
  ring: "Rings",
  rings: "Rings",
  bracelet: "Bracelets",
  bracelets: "Bracelets",
  anklet: "Bracelets",
  earring: "Earrings",
  earrings: "Earrings",
  necklace: "Necklaces",
  necklaces: "Necklaces",
  pendant: "Necklaces",
  "jewellery set": "Necklaces",
  "jewelry set": "Necklaces",
  set: "Necklaces",
};

const guessCategory = (node: ShopifyProductNode): JewelPiece["category"] => {
  const byType = CATEGORY_BY_TYPE[(node.productType || "").trim().toLowerCase()];
  if (byType) return byType;
  const t = node.title.toLowerCase();
  if (/ring|band/.test(t)) return "Rings";
  if (/bracelet|cuff|anklet/.test(t)) return "Bracelets";
  if (/earring|stud|hoop|huggie|drop/.test(t)) return "Earrings";
  return "Necklaces";
};

/*
  Shopify's plain-text `description` has already had the HTML stripped, so the
  <li> items of the Details list arrive run together: "Length: 40cm Stone: ...".
  Rendered as one paragraph that is unreadable, which is what shipped.

  Split them back apart on the "Label: " boundaries. If a description ever
  turns up that does not follow that shape, this returns the single original
  string and the page reads exactly as it does today — degraded, not broken.
*/
const SPEC_BOUNDARY = /(?=\b[A-Z][A-Za-z]*(?: [a-z]+){0,2}:\s)/;

const splitSpecs = (raw?: string): string[] | undefined => {
  if (!raw) return undefined;
  const parts = raw.split(SPEC_BOUNDARY).map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [raw];
};

/** Splits a Shopify listing description into the blurb / tip / details / care blocks. */
const parseDescription = (raw: string) => {
  const text = (raw || "").replace(/You will receive your piece in a Naira Petite box\.?/i, "").trim();
  const tipMatch = text.match(/STYLING TIP:\s*([\s\S]*?)(?=Details\s|Care[A-Z]|$)/i);
  const detailsMatch = text.match(/Details\s+([\s\S]*?)(?=Care[A-Z]|$)/);
  const careMatch = text.match(/Care([A-Z][\s\S]*)$/);
  const blurb = text.split(/STYLING TIP:|Details\s/)[0].trim();
  return {
    blurb: blurb || text,
    stylingTip: tipMatch?.[1]?.trim(),
    details: detailsMatch?.[1]?.trim(),
    care: careMatch?.[1]?.trim(),
  };
};

/** Builds a full piece for a live Shopify listing that isn't in the bundled file.
 * Exported so scripts/generate-jewellery-snapshot.ts can run the SAME mapping
 * ahead of time — the PDP's first paint must be what live would have drawn. */
export const fromShopify = (node: ShopifyProductNode, index: number): JewelPiece => {
  const { lead, availableForSale, choice } = variantFields(node);
  const price = lead ? lead.price : Math.round(Number(node.priceRange.minVariantPrice.amount));
  const compareAtPrice = lead?.compareAtPrice;
  const images = coverFirst(node.handle, productImagesFirst(node));
  const description = normalizeMetalCopy(node.description);
  const parsed = parseDescription(description);

  return {
    handle: node.handle,
    name: node.title,
    category: guessCategory(node),
    sku: "",
    number: String(index + 1).padStart(2, "0"),
    price,
    priceLabel: `₹${price.toLocaleString("en-IN")}`,
    compareAtPrice,
    compareAtLabel: compareAtPrice ? `₹${compareAtPrice.toLocaleString("en-IN")}` : undefined,
    variantId: lead?.id ?? "",
    availableForSale,
    image: images[0] ?? "",
    cover: node.leadImage,
    gallery: images,
    sizeGuide: sizeGuideOf(node),
    blurb: parsed.blurb,
    description,
    stylingTip: parsed.stylingTip,
    details: splitSpecs(parsed.details),
    care: parsed.care,
    materials: isRhodium(description)
      ? "Rhodium coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish"
      : "18K gold tone plated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
    tags: node.tags,
    ...choice,
  };
};



export const useLiveJewellery = (enabled = true): { jewellery: JewelPiece[]; isLive: boolean; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ["shopify-products", "jewellery-catalogue"],
    queryFn: () => fetchShopifyProducts(250),
    enabled,
    // Stock state must read live: refresh often and whenever the tab regains
    // focus so a piece that sells out in Shopify shows Sold Out here quickly.
    staleTime: 1000 * 30,
    refetchInterval: enabled ? 1000 * 60 : false,
    refetchOnWindowFocus: true,
  });

  if (!data?.length) return { jewellery: staticJewellery, isLive: false, isLoading };
  return { jewellery: liveCatalogue(data), isLive: true, isLoading: false };
};

/** The catalogue the site shows, from Shopify's products: the hook's work, for scripts and tests too. */
export const liveCatalogue = (data: ShopifyProductNode[]): JewelPiece[] => {
  const byHandle = new Map(data.map((node) => [node.handle, node]));
  // Only keep pieces that are still live listings in Shopify.
  const merged = staticJewellery
    .filter((piece) => byHandle.has(piece.handle))
    .map((piece) => mergeLive(piece, byHandle.get(piece.handle)));

  // Every other live Naira Petite listing (added in Shopify after the bundled
  // file was generated) is built straight from the API so nothing is missing.
  const known = new Set(merged.map((piece) => piece.handle));
  const extras = data
    .filter((node) => isJewelleryProduct(node) && !known.has(node.handle))
    .map((node, i) => fromShopify(node, merged.length + i));

  const all = [...merged, ...extras];
  return all.length ? all : staticJewellery;
};


export const useLiveJewel = (handle?: string): JewelPiece | undefined => {
  const { jewellery } = useLiveJewellery();
  return jewellery.find((piece) => piece.handle === handle);
};
