import { defineConfig } from "vite";
import legacy from '@vitejs/plugin-legacy'
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    legacy(),
  ],
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})