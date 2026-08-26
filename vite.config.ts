// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// On Vercel, build a Vercel serverless output instead of the default Cloudflare
// Worker bundle. Inside Lovable's sandbox this option is ignored (Cloudflare is forced).
const isVercel = !!process.env["VERCEL"];
const publicEnv = loadEnv("production", process.cwd(), "VITE_SUPABASE_");

export default defineConfig({
  ...(isVercel ? { nitro: { preset: "vercel" } } : {}),
  vite: {
    // The browser-safe backend URL and publishable key are committed in .env.
    // Also compile them into the server-side process.env fallbacks so Vercel
    // does not depend on separately configured runtime environment variables.
    define: {
      "process.env.SUPABASE_URL": JSON.stringify(publicEnv["VITE_SUPABASE_URL"] ?? ""),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        publicEnv["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "",
      ),
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
