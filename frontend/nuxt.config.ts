export default defineNuxtConfig({

  compatibilityDate: '2025-07-15',

  css: ['~/assets/css/dark.css'],

  app: {
    head: {
      titleTemplate: '%s | MedAgenda',
      title: 'MedAgenda'
    }
  },

  devtools: {
    enabled: true
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxt/image'
  ],

  vite: {
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'axios',
        '@fullcalendar/vue3',
        '@fullcalendar/daygrid',
        '@fullcalendar/timegrid',
        '@fullcalendar/interaction',
        '@fullcalendar/core/locales/pt-br'
      ]
    }
  }

})