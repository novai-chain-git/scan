import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Layouts from 'vite-plugin-vue-layouts';
import DefineOptions from 'unplugin-vue-define-options/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Pages from 'vite-plugin-pages';

import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {}
  },
  esbuild: {
    // 删除 console debugger
  //  drop: ['console', 'debugger']
  },
  
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) =>
            [
              'ping-connect-wallet',
              'ping-token-convert',
              'ping-tx-dialog',
            ].includes(tag),
        },
      },
    }),
    vueJsx(),
    Pages({
      dirs: ['./src/modules', './src/pages'],
      exclude: ['**/*.ts'], // only load .vue as modules
    }),
    Layouts({
      layoutsDirs: './src/layouts/',
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/math',
        'vue-i18n',
        'pinia',
      ],
      vueTemplate: true,
    }),
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [
        fileURLToPath(
          new URL('./src/plugins/i18n/locales/**', import.meta.url)
        ),
      ],
    }),
    DefineOptions(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  optimizeDeps: {
    entries: ['./src/**/*.vue'],
  },
  server: {
    proxy: {
      '/cosmos': {
        //  target: 'http://192.168.101.50:18080',
        //target: 'http://192.168.101.44:8545',
        //  target: 'http://192.168.101.44:1317',
        target: 'https://scan.novaichain.com',
        changeOrigin: true,
      },
      '/evmos': {
        // target: 'http://192.168.101.50:18080',
       // target: 'http://192.168.101.44:8545',
        //  target: 'http://192.168.101.44:1317',
        target: 'https://scan.novaichain.com',
        changeOrigin: true,
      },
      '/api': {
        //arget: 'http://192.168.101.50:18080',
        // target: 'http://192.168.101.12:18080',
       //target: 'http://192.168.101.44:8545',
        //  ttarget: 'http://192.168.101.44:1317',
        target: 'https://scan.novaichain.com',
        changeOrigin: true,
      },
      '/chainFinder': {
        //target: 'http://192.168.101.50:18072',
        // target: 'http://192.168.101.12:18080',
       //target: 'http://192.168.101.44:8545',
        //  ttarget: 'http://192.168.101.44:1317',
        target: 'https://scan.novaichain.com/',
        changeOrigin: true,
      }
    },
  },
});
