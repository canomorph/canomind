import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    // Rust build output must not be watched by Vite (causes EBUSY on Windows)
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
