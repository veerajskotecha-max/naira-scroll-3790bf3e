import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "join_inner_circle",
  title: "Join the Inner Circle",
  description:
    "Add the signed-in member's email to the Naira Flore Inner Circle list for pre-launch collection access.",
  inputSchema: {
    name: z.string().trim().max(80).optional().describe("Name to store with the signup."),
    phone: z.string().trim().max(20).optional().describe("Optional phone number."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  handler: async ({ name, phone }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const email = ctx.getUserEmail();
    if (!email) {
      return { content: [{ type: "text", text: "This account has no email address." }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { error } = await supabase.from("inner_circle_signups").insert({
      email,
      name: name ?? null,
      phone: phone ?? null,
      source: "mcp",
      user_id: ctx.getUserId(),
    });
    if (error && error.code !== "23505") {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [
        { type: "text", text: error ? `${email} is already on the Inner Circle list.` : `${email} added to the Inner Circle.` },
      ],
      structuredContent: { email, already: Boolean(error) },
    };
  },
});
