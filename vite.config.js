import {defineConfig} from 'vite'
import {resolve} from 'node:path'

export default defineConfig({
  base: '/aves-uao/', // <-- AÑADE SOLO ESTA LÍNEA (reemplaza 'aves-uao' por el nombre de tu repositorio)
  server: {
    allowedHosts: true
  },
  preview: {
    allowedHosts: process.env.UAO_PREVIEW_HOST ? [process.env.UAO_PREVIEW_HOST] : []
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        diagnostico: resolve('diagnostico.html')
      }
    }
  }
})