// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  modules: ['@nuxt/ui'],
  vite: {
    optimizeDeps: {
      include: [
        'zod',
      ]
    },
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    preset: 'static'
  },
  app: {
    baseURL: './'
  },
  runtimeConfig: {
    public: {
      APP_NAME: process.env.APP_NAME,
      APP_ENV: process.env.APP_ENV,
      WEBAPI_URL: process.env.WEBAPI_URL,
      APPAPI_URL: process.env.APPAPI_URL
    }
  },
})
