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

  return {
    ...piece,
    name: node.title || piece.name,
    price,
    priceLabel: `₹${price.toLocaleString("en-IN")}`,
    variantId: variant?.id ?? piece.variantId,
    availableForSale: node.availableForSale && (variant?.availableForSale ?? true),
    image: images[0] ?? piece.image,
    gallery: images.length ? images : piece.gallery,
    description: node.description || piece.description,
  };
};

export const useLiveJewellery = (): { jewellery: JewelPiece[]; isLive: boolean } => {
  const { data } = useQuery({
    queryKey: ["shopify-products", "jewellery-catalogue"],
    queryFn: () => fetchShopifyProducts(100),
    staleTime: 1000 * 60 * 5,
  });

  if (!data?.length) return { jewellery: staticJewellery, isLive: false };

  const byHandle = new Map(data.map((node) => [node.handle, node]));
  // Only keep pieces that are still live listings in Shopify.
  const merged = staticJewellery
    .filter((piece) => byHandle.has(piece.handle))
    .map((piece) => mergeLive(piece, byHandle.get(piece.handle)));

  return { jewellery: merged.length ? merged : staticJewellery, isLive: true };
};

export const useLiveJewel = (handle?: string): JewelPiece | undefined => {
  const { jewellery } = useLiveJewellery();
  return jewellery.find((piece) => piece.handle === handle);
};
