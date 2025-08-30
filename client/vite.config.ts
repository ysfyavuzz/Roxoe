import path from 'node:path'

import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'

// .env dosyasını manuel yükle
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: process.env.NODE_ENV === 'test' ? [
      // Stub Electron/Node-heavy backup modules in web/E2E build
      { find: /^\.{1,2}\/utils\/fileUtils$/, replacement: '/src/backup/utils/fileUtils.web.ts' },
      { find: /^\.{1,2}\/scheduler\/BackupScheduler$/, replacement: '/src/backup/scheduler/BackupScheduler.web.ts' },
    ] : [],
  },
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test'
        // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
        ? undefined
        : {},
    }),
  ],
})
