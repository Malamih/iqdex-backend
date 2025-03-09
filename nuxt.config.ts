export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt", "@prisma/nuxt", "@nuxt/icon"],
  css: ["~/assets/scss/main.scss"],
  runtimeConfig: {
    access_token: process.env.ACCESS_TOKEN,
    phone_number_id: process.env.PHONE_NUMBER_ID,
    facebook_app_id: process.env.FACEBOOK_APP_ID,
    facebook_app_secret: process.env.FACEBOOK_APP_SECRET,
    long_lived_token: process.env.FACEBOOK_LONG_LIVED_TOKEN,
    jwt_secret: process.env.JWT_SECRET
  }
});
