// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
// SSR (output: 'server'): sayfalar her istekte DB'den okur, panel
// değişiklikleri anında yansır. node adapter "middleware" modunda
// derlenir; panel/sunucu.mjs içindeki Express'e bağlanır.
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'middleware' }),
  vite: {
    plugins: [tailwindcss()]
  }
});
