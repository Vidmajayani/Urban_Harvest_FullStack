import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      registerType: 'autoUpdate',
      injectRegister: null, // We are handling registration manually in main.jsx
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],

      // Enable dev mode for testing
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
        /* swSrc: 'src/service-worker.js' */
      },

      manifest: {
        name: 'Urban Harvest Hub',
        short_name: 'Urban Harvest',
        description: 'Eco-friendly community platform for sustainable living',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/Images/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/Images/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        start_url: "/",
        scope: "/",
        categories: ["lifestyle", "sustainability", "shopping"]
      },

      workbox: {
        // Increase cache size limits
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB

        // Precache important files
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // Navigation fallback - serve index.html for all navigation requests
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],

        runtimeCaching: [
          // Cache API calls - Network First
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
            }
          },
          // Cache Images - Cache First with fallback
          {
            urlPattern: ({ url }) => {
              return url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/i);
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Cache Images from /Images folder specifically
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/Images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // Cache Google Fonts
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  preview: {
    allowedHosts: true
  }
})
