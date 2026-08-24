import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "my_profile",
  title: "My member profile",
  description: "Read the signed-in Naira Flore member's profile (name, phone, city, birthday).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, birthday, city")
      .eq("id", ctx.getUserId())
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const profile = data ?? { id: ctx.getUserId(), full_name: null, phone: null, birthday: null, city: null };
    return {
      content: [{ type: "text", text: JSON.stringify({ email: ctx.getUserEmail(), ...profile }, null, 2) }],
      structuredContent: { profile },
    };
  },
});
