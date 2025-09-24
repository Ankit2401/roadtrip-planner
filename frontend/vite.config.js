import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["react-simple-image-viewer"], // prevent Vite from pre-bundling its TS config
  },
  esbuild: {
    loader: "jsx", // force JSX loader for .js files
  },
});
