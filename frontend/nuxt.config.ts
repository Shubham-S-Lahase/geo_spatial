// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: [
    '~/assets/css/main.css',
    "mapbox-gl/dist/mapbox-gl.css",
    "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css",
  ],
  modules: ['@pinia/nuxt'],
  runtimeConfig: {
    public: {
      mapboxToken: process.env.MAPBOX_TOKEN,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
