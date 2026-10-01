import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      workbox: {
        navigateFallback: '/index.html',
        // Se agregaron jpg y jpeg al patrón de caché
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,ico}'],
      },
      manifest: {
        name: 'Solu Stock',
        short_name: 'SoluStock',
        description: 'Aplicación web progresiva para gestión de inventario',
        theme_color: '#8b0000', // Color institucional (Rojo)
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        
        icons: [
          {
            src: '/icons/LOGO-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/LOGO-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/LOGO-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Permite adaptarse a iconos circulares/cuadrados en móviles
          }
        ],
      },
    }),
  ],
})