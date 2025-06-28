// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  ssr: false,
  devtools: { enabled: false },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "nuxt-marquee",
    "nuxt-vue3-google-signin",
    "nuxt-particles",
  ],
  runtimeConfig: {
    public: {
      apiUrl: process.env.API_URL,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    },
  },
  plugins: ["~/plugins/01.api.js", "~/plugins/vue-tel-input.js"],
  googleSignIn: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  particles: {
    mode: "full",
  },
  build: {
    transpile: ["reka-ui"]
  },
});
