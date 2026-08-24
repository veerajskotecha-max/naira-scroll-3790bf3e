/**
 * Minimal Shopify Storefront access for MCP tools. Kept separate from
 * `src/lib/shopify.ts` so the bundled Edge Function stays dependency-free and
 * import-safe (no env reads or I/O at module load).
 */
const STORE_DOMAIN = "nc5eti-gp.myshopify.com";
const API_VERSION = "2025-07";
const STOREFRONT_TOKEN = "0f6fd83502924ac437a5d19180bb08c3";

export type FeedProduct = {
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  available: boolean;
  price: string;
  currency: string;
  url: string;
  image: string | null;
  variants?: Array<{ title: string; available: boolean; price: string }>;
};

const PRODUCT_FIELDS = `
  title
  handle
  description
  productType
  tags
  availableForSale
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 4) { edges { node { url altText } } }
  variants(first: 20) { edges { node { title availableForSale price { amount } } } }
`;

type RawProduct = {
  title: string;
  handle: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
  images: { edges: Array<{ node: { url: string; altText: string | null } }> };
  variants: { edges: Array<{ node: { title: string; availableForSale: boolean; price: { amount: string } } }> };
};

async function storefront<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify storefront request failed (${res.status})`);
  const json = (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error("Shopify returned no data");
  return json.data;
}

function shape(node: RawProduct, withVariants: boolean): FeedProduct {
  const images = node.images.edges
    .filter((e) => (e.node.altText ?? "").trim().toLowerCase() !== "catalog-square")
    .map((e) => e.node.url);
  return {
    handle: node.handle,
    title: node.title,
    description: node.description?.slice(0, withVariants ? 1200 : 240) ?? "",
    productType: node.productType,
    tags: node.tags,
    available: node.availableForSale,
    price: node.priceRange.minVariantPrice.amount,
    currency: node.priceRange.minVariantPrice.currencyCode,
    url: `https://nairaflore.com/products/${node.handle}`,
    image: images[0] ?? node.images.edges[0]?.node.url ?? null,
    ...(withVariants
      ? {
          variants: node.variants.edges.map((e) => ({
            title: e.node.title,
            available: e.node.availableForSale,
            price: e.node.price.amount,
          })),
        }
      : {}),
  };
}

export async function searchProducts(search: string | undefined, limit: number): Promise<FeedProduct[]> {
  const data = await storefront<{ products: { edges: Array<{ node: RawProduct }> } }>(
    `query Search($first: Int!, $query: String) {
      products(first: $first, query: $query) { edges { node { ${PRODUCT_FIELDS} } } }
    }`,
    { first: limit, query: search && search.trim() ? search.trim() : undefined },
  );
  return data.products.edges.map((e) => shape(e.node, false));
}

export async function productByHandle(handle: string): Promise<FeedProduct | null> {
  const data = await storefront<{ product: RawProduct | null }>(
    `query Product($handle: String!) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
    { handle },
  );
  return data.product ? shape(data.product, true) : null;
}
