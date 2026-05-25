import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const deployTarget = process.env.VITE_DEPLOY_TARGET;

export default defineConfig({
  base: deployTarget === "github-pages" ? "/kaoyan-agent/" : "/",
  plugins: [react(), tailwindcss()],
});
