// Real catalogue from the Storefront API, reshaped into Liquid's object model.
// Storefront returns rupee decimals ("1899.00"); Liquid money filters expect cents.
import fs from 'node:fs';
import path from 'node:path';

const URL_ = 'https://nc5eti-gp.myshopify.com/api/2025-07/graphql.json';
const TOKEN = '0f6fd83502924ac437a5d19180bb08c3';
const CACHE = path.join(import.meta.dirname, 'catalogue.json');

const Q = `{
  products(first: 100) {
    edges { node {
      id handle title description descriptionHtml productType vendor tags availableForSale
      featuredImage { url altText }
      images(first: 10) { edges { node { url altText width height } } }
      options { name values }
      variants(first: 20) { edges { node {
        id title availableForSale
        price { amount } compareAtPrice { amount }
        selectedOptions { name value }
      } } }
    } }
  }
  collections(first: 30) { edges { node { id handle title description image { url altText } } } }
  shop { name description primaryDomain { url } }
}`;

const cents = (a) => Math.round(Number(a || 0) * 100);

const toImage = (n) => n && ({ src: n.url, url: n.url, alt: n.altText || '', width: n.width, height: n.height });

function toProduct(n) {
  const images = (n.images?.edges || []).map((e) => toImage(e.node)).filter(Boolean);
  const variants = (n.variants?.edges || []).map((e) => {
    const v = e.node;
    return {
      id: v.id, title: v.title, available: v.availableForSale,
      price: cents(v.price?.amount), compare_at_price: v.compareAtPrice ? cents(v.compareAtPrice.amount) : null,
      options: (v.selectedOptions || []).map((o) => o.value),
      option1: v.selectedOptions?.[0]?.value ?? null,
      featured_image: images[0] || null,
    };
  });
  const first = variants.find((v) => v.available) || variants[0] || { price: 0, compare_at_price: null, available: false, options: [] };
  return {
    id: n.id, handle: n.handle, title: n.title,
    description: n.descriptionHtml || n.description, content: n.descriptionHtml || n.description,
    type: n.productType, vendor: n.vendor, tags: n.tags || [],
    available: n.availableForSale,
    price: first.price, price_min: Math.min(...variants.map(v=>v.price)), price_max: Math.max(...variants.map(v=>v.price)),
    compare_at_price: first.compare_at_price,
    featured_image: toImage(n.featuredImage) || images[0] || null,
    images, media: images.map((im) => ({ preview_image: im, alt: im.alt, media_type: 'image' })),
    variants, selected_or_first_available_variant: first,
    options_with_values: (n.options || []).map((o, i) => ({ name: o.name, position: i + 1, values: o.values })),
    url: `/products/${n.handle}`,
  };
}

export async function loadCatalogue({ refresh = false } = {}) {
  if (!refresh && fs.existsSync(CACHE)) return JSON.parse(fs.readFileSync(CACHE, 'utf8'));
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': TOKEN },
    body: JSON.stringify({ query: Q }),
  });
  if (!res.ok) throw new Error(`Storefront ${res.status}`);
  const { data, errors } = await res.json();
  if (errors) throw new Error(JSON.stringify(errors).slice(0, 300));
  const products = data.products.edges.map((e) => toProduct(e.node));
  const collections = data.collections.edges.map((e) => ({
    id: e.node.id, handle: e.node.handle, title: e.node.title, description: e.node.description,
    image: toImage(e.node.image), products: [], products_count: 0, url: `/collections/${e.node.handle}`,
  }));
  // Bucket products into collections by vendor/type so listing pages have real content.
  for (const c of collections) {
    c.products = products.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === c.handle) ||
      (p.type || '').toLowerCase().replace(/\s+/g, '-') === c.handle);
    c.products_count = c.products.length;
  }
  const all = { handle: 'all', title: 'All', products, products_count: products.length, url: '/collections/all', description: '' };
  collections.push(all);
  const out = { products, collections, shop: { name: data.shop.name, description: data.shop.description, url: data.shop.primaryDomain.url, money_format: '₹{{amount}}', email: 'shopatnaira@gmail.com' } };
  fs.writeFileSync(CACHE, JSON.stringify(out));
  return out;
}

export const routes = {
  root_url: '/', all_products_collection_url: '/collections/all', collections_url: '/collections',
  cart_url: '/cart', cart_add_url: '/cart/add', cart_change_url: '/cart/change', cart_clear_url: '/cart/clear',
  search_url: '/search', predictive_search_url: '/search/suggest',
  account_url: '/account', account_login_url: '/account/login', account_logout_url: '/account/logout',
  account_register_url: '/account/register', account_addresses_url: '/account/addresses',
};
