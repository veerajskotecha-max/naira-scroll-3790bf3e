import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchProductsTool from "./tools/search-products";
import getProductTool from "./tools/get-product";
import myProfileTool from "./tools/my-profile";
import myOrdersTool from "./tools/my-orders";
import joinInnerCircleTool from "./tools/join-inner-circle";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "naira",
  title: "Naira",
  version: "0.1.0",
  instructions:
    "Tools for Naira Flore, a handcrafted jewellery and indo-western label. Use `search_products` and `get_product` to browse the live catalogue, and `my_profile`, `my_orders` and `join_inner_circle` for the signed-in member's account.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [searchProductsTool, getProductTool, myProfileTool, myOrdersTool, joinInnerCircleTool],
});
