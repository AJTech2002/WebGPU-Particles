import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
  assetsInclude: ['**/*.glsl', '**/*.vs', '**/*.fs', '**/*.png'],
  base: 'WebGPU-Particles',
  resolve: {
    
    alias: {
      "@engine": path.resolve(__dirname, 'src/engine/'),
      "@renderer": path.resolve(__dirname, 'src/engine/renderer/'),
      "@math": path.resolve(__dirname, 'src/engine/math/src/index.js'),
  },
  }
})
