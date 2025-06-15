import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
<<<<<<< HEAD
// import componentTagger from "vite-plugin-component-tagger"; 
=======
import { componentTagger } from "lovable-tagger";
>>>>>>> new-origin/main

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
<<<<<<< HEAD
    // mode === 'development' &&
    // componentTagger(), 
  ].filter(Boolean), 
=======
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
>>>>>>> new-origin/main
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
