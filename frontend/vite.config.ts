// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths"; // Hinzufügen

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    tsconfigPaths(), // Hinzufügen
  ],
  optimizeDeps: {
    include: ['jspdf', 'html2canvas'],
  },
  build: {
    rollupOptions: {
      external: ['jspdf', 'html2canvas'],
      output: {
        globals: {
          jspdf: 'jsPDF',
          html2canvas: 'html2canvas',
        },
      },
    },
  },
  define: {
    'import.meta.env.VITE_TINYMCE_API_KEY': JSON.stringify(process.env.VITE_TINYMCE_API_KEY || '8bmk9fctlv8xyyt73d6m24huvwe80y41zo96mpq26ejudp89'),
  },
});