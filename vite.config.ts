import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "fs";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";


/**
 * Injects the pre-boot /products -> /jewellery rewrite into index.html.
 *
 * The handle list lives in src/data/jewelleryHandles.ts and is read from there
 * rather than duplicated, so the inline script and the app can never disagree
 * about which pieces are jewellery. The file is generated and its shape is
 * fixed, so a regex is enough — but a parse that comes back short means the
 * shape changed, and shipping a near-empty map would silently send every ad
 * click back through the slow path. Fail the build instead.
 */
const jewelleryRedirect = () => ({
  name: "naira-jewellery-redirect",
  transformIndexHtml(html: string) {
    const MARK = "<!--NAIRA_JEWELLERY_REDIRECT-->";
    if (!html.includes(MARK)) return html;

    const source = readFileSync(path.resolve(__dirname, "src/data/jewelleryHandles.ts"), "utf8");
    const handles = [...source.matchAll(/^\s*"([a-z0-9-]+)",\s*$/gm)].map((m) => m[1]);
    if (handles.length < 20) {
      throw new Error(
        `naira-jewellery-redirect: parsed only ${handles.length} handles from ` +
          "src/data/jewelleryHandles.ts — refusing to ship a near-empty redirect map.",
      );
    }

    const map = JSON.stringify(Object.fromEntries(handles.map((h) => [h, 1])));
    const script =
      "<script>(function(){try{" +
      "var m=location.pathname.match(/^\\/products?\\/([^\\/]+)\\/?$/);if(!m)return;" +
      `var J=${map};` +
      "if(!Object.prototype.hasOwnProperty.call(J,decodeURIComponent(m[1])))return;" +
      // replaceState, not pushState: Back must return to the ad, not to a URL
      // that would only redirect here again.
      "history.replaceState(null,\"\",\"/jewellery/\"+m[1]+location.search+location.hash);" +
      "}catch(e){}})();</script>";

    return html.replace(MARK, script);
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), jewelleryRedirect(), mcpPlugin(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          gsap: ['gsap'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
        }
      }
    }
  }
}));
