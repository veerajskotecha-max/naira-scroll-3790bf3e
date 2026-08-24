import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { searchProducts } from "../storefront";

export default defineTool({
  name: "search_products",
  title: "Search Naira Flore pieces",
  description:
    "Search the live Naira Flore catalogue (jewellery and indo-western pieces) by keyword, returning titles, prices, availability and product links.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(120)
      .optional()
      .describe("Keyword such as 'earrings', 'ring', 'zircone'. Omit to list current pieces."),
    limit: z.number().int().min(1).max(50).default(12).describe("How many pieces to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, limit }) => {
    const products = await searchProducts(query, limit ?? 12);
    return {
      content: [{ type: "text", text: JSON.stringify(products, null, 2) }],
      structuredContent: { products },
    };
  },
});
