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
  // Önbelleği node_modules dışına al. Varsayılan "./node_modules/.astro"
  // konteyner overlay FS'inde npm sırasında EBUSY (rmdir) hatasına yol açıyor.
  cacheDir: './.astro',
  adapter: node({ mode: 'middleware' }),
  vite: {
    plugins: [tailwindcss()]
  }
});
