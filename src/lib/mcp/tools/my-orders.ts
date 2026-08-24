import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "my_orders",
  title: "My orders",
  description: "List the signed-in Naira Flore member's orders, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("How many orders to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("member_orders")
      .select("*")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const orders = data ?? [];
    return {
      content: [
        {
          type: "text",
          text: orders.length ? JSON.stringify(orders, null, 2) : "No orders on this account yet.",
        },
      ],
      structuredContent: { orders },
    };
  },
});
