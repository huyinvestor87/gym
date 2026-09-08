import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/gym/",
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
});
