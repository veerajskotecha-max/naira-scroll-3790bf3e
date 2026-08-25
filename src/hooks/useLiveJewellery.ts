import { useQuery } from "@tanstack/react-query";
import { fetchShopifyProducts, type ShopifyProductNode } from "@/lib/shopify";
import { jewellery as staticJewellery, type JewelPiece } from "@/data/jewellery";

/**
 * Overlays LIVE Shopify data (images, price, variant id, availability) on top of
 * the bundled catalogue. The static file is only a first-paint fallback — once
 * the Storefront API responds, everything shown comes straight from Shopify, so
 * new photos, price edits and sold-out states appear without a redeploy.
 */
const mergeLive = (piece: JewelPiece, node?: ShopifyProductNode): JewelPiece => {
  if (!node) return piece;
  const images = node.images.edges.map((e) => e.node.url);
  const variant = node.variants.edges[0]?.node;
  const price = variant ? Math.round(Number(variant.price.amount)) : piece.price;
  // MRP only counts when Shopify actually has a higher compare-at price set.
  const compareRaw = variant?.compareAtPrice ? Math.round(Number(variant.compareAtPrice.amount)) : 0;
  const compareAtPrice = compareRaw > price ? compareRaw : undefined;

  return {
    ...piece,
    name: node.title || piece.name,
    price,
    priceLabel: `₹${price.toLocaleString("en-IN")}`,
    compareAtPrice,
    compareAtLabel: compareAtPrice ? `₹${compareAtPrice.toLocaleString("en-IN")}` : undefined,
    variantId: variant?.id ?? piece.variantId,
    availableForSale: node.availableForSale && (variant?.availableForSale ?? true),
    image: images[0] ?? piece.image,
    gallery: images.length ? images : piece.gallery,
    description: normalizeMetalCopy(node.description) || piece.description,
    tags: node.tags?.length ? node.tags : piece.tags,
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

/** Builds a full piece for a live Shopify listing that isn't in the bundled file. */
const fromShopify = (node: ShopifyProductNode, index: number): JewelPiece => {
  const variant = node.variants.edges[0]?.node;
  const price = variant ? Math.round(Number(variant.price.amount)) : Math.round(Number(node.priceRange.minVariantPrice.amount));
  const compareRaw = variant?.compareAtPrice ? Math.round(Number(variant.compareAtPrice.amount)) : 0;
  const compareAtPrice = compareRaw > price ? compareRaw : undefined;
  const images = node.images.edges.map((e) => e.node.url);
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
    variantId: variant?.id ?? "",
    availableForSale: node.availableForSale && (variant?.availableForSale ?? true),
    image: images[0] ?? "",
    gallery: images,
    blurb: parsed.blurb,
    description,
    stylingTip: parsed.stylingTip,
    details: splitSpecs(parsed.details),
    care: parsed.care,
    materials: isRhodium(description)
      ? "Rhodium coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish"
      : "18K gold tone plated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
    tags: node.tags,
  };
};

/** The Shopify vendor that holds the demi-fine jewellery line. */
const JEWELLERY_VENDOR = "naira petite";

export const useLiveJewellery = (): { jewellery: JewelPiece[]; isLive: boolean; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ["shopify-products", "jewellery-catalogue"],
    queryFn: () => fetchShopifyProducts(250),
    // Stock state must read live: refresh often and whenever the tab regains
    // focus so a piece that sells out in Shopify shows Sold Out here quickly.
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
    refetchOnWindowFocus: true,
  });

  if (!data?.length) return { jewellery: staticJewellery, isLive: false, isLoading };

  const byHandle = new Map(data.map((node) => [node.handle, node]));
  // Only keep pieces that are still live listings in Shopify.
  const merged = staticJewellery
    .filter((piece) => byHandle.has(piece.handle))
    .map((piece) => mergeLive(piece, byHandle.get(piece.handle)));

  // Every other live Naira Petite listing (added in Shopify after the bundled
  // file was generated) is built straight from the API so nothing is missing.
  const known = new Set(merged.map((piece) => piece.handle));
  const extras = data
    .filter((node) => node.vendor?.trim().toLowerCase() === JEWELLERY_VENDOR && !known.has(node.handle))
    .map((node, i) => fromShopify(node, merged.length + i));

  const all = [...merged, ...extras];

  return { jewellery: all.length ? all : staticJewellery, isLive: true, isLoading: false };
};


export const useLiveJewel = (handle?: string): JewelPiece | undefined => {
  const { jewellery } = useLiveJewellery();
  return jewellery.find((piece) => piece.handle === handle);
};
