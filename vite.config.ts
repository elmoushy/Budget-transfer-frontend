import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      '@vueup/vue-quill',
      'quill',
      'quill-delta',
      '@tiptap/vue-3',
      '@tiptap/starter-kit',
      '@tiptap/core',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/quill/, /@vueup\/.*/, /@tiptap\/.*/, /node_modules/],
    },
  },
})
