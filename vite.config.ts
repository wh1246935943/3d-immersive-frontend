import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: mode === 'development' ? '/' : '/case/3d-immersive/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname,'./src')
      }
    },
  }
})
