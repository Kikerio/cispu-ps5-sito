import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// base "./" = funziona su qualsiasi indirizzo GitHub Pages (tuonome.github.io/nome-repo/)
export default defineConfig({ base: "./", plugins: [react(), tailwindcss()] });
