import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { productByHandle } from "../storefront";

export default defineTool({
  name: "get_product",
  title: "Get a piece by handle",
  description:
    "Fetch full detail for one Naira Flore piece by its product handle, including description, variants, sizes and availability.",
  inputSchema: {
    handle: z.string().trim().min(1).max(160).describe("Shopify product handle, e.g. 'the-vine-ring'."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ handle }) => {
    const product = await productByHandle(handle);
    if (!product) throw new ToolError(`No piece found with handle "${handle}".`);
    return {
      content: [{ type: "text", text: JSON.stringify(product, null, 2) }],
      structuredContent: { product },
    };
  },
});
