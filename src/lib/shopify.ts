export const SHOPIFY_API_VERSION = "2025-07";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "nc5eti-gp.myshopify.com";
export const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
export const SHOPIFY_STOREFRONT_TOKEN = "0f6fd83502924ac437a5d19180bb08c3";

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: ShopifyMoney;
  selectedOptions: ShopifySelectedOption[];
}

export interface ShopifyProductNode {
  id: string;
  title: string;
  description: string;
  handle: string;
  productType: string;
  vendor: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  options: Array<{
    name: string;
    values: string[];
  }>;
}

export interface ShopifyProductEdge {
  node: ShopifyProductNode;
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
  };
}

export const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          vendor
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      productType
      vendor
      tags
      availableForSale
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 8) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

export const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) {
      id
      totalQuantity
      checkoutUrl
      lines(first: 100) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id checkoutUrl totalQuantity }
      userErrors { field message }
    }
  }
`;

export async function storefrontApiRequest<T = any>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 402) {
    throw new Error("Shopify API access requires an active billing plan.");
  }

  if (!response.ok) {
    throw new Error(`Shopify request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.errors?.length) {
    throw new Error(data.errors.map((error: { message: string }) => error.message).join(", "));
  }

  return data;
}

export async function fetchShopifyProducts(first = 20, query?: string): Promise<ShopifyProductNode[]> {
  const data = await storefrontApiRequest<{ data: { products: { edges: ShopifyProductEdge[] } } }>(PRODUCTS_QUERY, {
    first,
    query,
  });
  return data.data.products.edges.map((edge) => edge.node);
}

export async function fetchShopifyProductByHandle(handle: string): Promise<ShopifyProductNode | null> {
  if (!handle) return null;
  const data = await storefrontApiRequest<{ data: { product: ShopifyProductNode | null } }>(PRODUCT_BY_HANDLE_QUERY, { handle });
  return data.data.product;
}

export function formatShopifyPrice(money: ShopifyMoney): string {
  const amount = Number(money.amount);
  if (money.currencyCode === "INR") {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: money.currencyCode,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatCheckoutUrl(checkoutUrl: string): string {
  try {
    const url = new URL(checkoutUrl);
    // Force the host to Shopify's permanent domain. Shopify returns checkout
    // URLs on the store's primary domain, which is nairaflore.com — but that
    // domain is hosted on Lovable (not Shopify), so /cart/c/... 404s.
    url.host = SHOPIFY_STORE_PERMANENT_DOMAIN;
    url.protocol = "https:";
    url.port = "";
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}

export function isCartNotFoundError(userErrors: Array<{ message: string }>): boolean {
  return userErrors.some((error) => {
    const message = error.message.toLowerCase();
    return message.includes("cart not found") || message.includes("does not exist");
  });
}

const getLineForVariant = (lines: Array<{ node: { id: string; quantity?: number; merchandise: { id: string } } }>, variantId: string) =>
  lines.find((line) => line.node.merchandise.id === variantId)?.node;

export async function createShopifyCart(variantId: string, quantity: number): Promise<{ cartId: string; checkoutUrl: string; lineId: string; quantity: number } | null> {
  const data = await storefrontApiRequest<{
    data: {
      cartCreate: {
        cart: { id: string; checkoutUrl: string; lines: { edges: Array<{ node: { id: string; quantity: number; merchandise: { id: string } } }> } } | null;
        userErrors: Array<{ message: string }>;
      };
    };
  }>(CART_CREATE_MUTATION, {
    input: { lines: [{ quantity, merchandiseId: variantId }] },
  });

  const userErrors = data.data.cartCreate.userErrors;
  if (userErrors.length) throw new Error(userErrors.map((error) => error.message).join(", "));

  const cart = data.data.cartCreate.cart;
  const line = cart ? getLineForVariant(cart.lines.edges, variantId) : null;
  if (!cart?.checkoutUrl || !line?.id) return null;

  return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: line.id, quantity: line.quantity ?? quantity };
}

export async function addLineToShopifyCart(cartId: string, variantId: string, quantity: number): Promise<{ success: boolean; lineId?: string; quantity?: number; checkoutUrl?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    data: {
      cartLinesAdd: {
        cart: { checkoutUrl: string; lines: { edges: Array<{ node: { id: string; quantity: number; merchandise: { id: string } } }> } } | null;
        userErrors: Array<{ message: string }>;
      };
    };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ quantity, merchandiseId: variantId }],
  });

  const userErrors = data.data.cartLinesAdd.userErrors;
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length) throw new Error(userErrors.map((error) => error.message).join(", "));

  const cart = data.data.cartLinesAdd.cart;
  const line = cart ? getLineForVariant(cart.lines.edges, variantId) : null;
  return { success: true, lineId: line?.id, quantity: line?.quantity, checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number): Promise<{ success: boolean; quantity?: number; checkoutUrl?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    data: { cartLinesUpdate: { cart: { checkoutUrl: string; lines: { edges: Array<{ node: { id: string; quantity: number } }> } } | null; userErrors: Array<{ message: string }> } };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });

  const userErrors = data.data.cartLinesUpdate.userErrors;
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length) throw new Error(userErrors.map((error) => error.message).join(", "));
  const cart = data.data.cartLinesUpdate.cart;
  const updatedQuantity = cart?.lines.edges.find((line) => line.node.id === lineId)?.node.quantity;
  return { success: true, quantity: updatedQuantity, checkoutUrl: cart?.checkoutUrl ? formatCheckoutUrl(cart.checkoutUrl) : undefined };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string): Promise<{ success: boolean; checkoutUrl?: string; cartNotFound?: boolean }> {
  const data = await storefrontApiRequest<{
    data: { cartLinesRemove: { cart: { checkoutUrl: string; totalQuantity: number } | null; userErrors: Array<{ message: string }> } };
  }>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });

  const userErrors = data.data.cartLinesRemove.userErrors;
  if (isCartNotFoundError(userErrors)) return { success: false, cartNotFound: true };
  if (userErrors.length) throw new Error(userErrors.map((error) => error.message).join(", "));
  return { success: true, checkoutUrl: data.data.cartLinesRemove.cart?.checkoutUrl ? formatCheckoutUrl(data.data.cartLinesRemove.cart.checkoutUrl) : undefined };
}

export async function fetchShopifyCart(cartId: string) {
  const data = await storefrontApiRequest<{ data: { cart: { id: string; totalQuantity: number; checkoutUrl: string; lines: { edges: Array<{ node: ShopifyCartLine }> } } | null } }>(CART_QUERY, { id: cartId });
  return data.data.cart;
}
