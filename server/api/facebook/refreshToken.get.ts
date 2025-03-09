export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const token = config.access_token;

  try {
    const response: any = await $fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${config.facebook_app_id}&client_secret=${config.facebook_app_secret}&fb_exchange_token=${token}`
    );

    if (response.access_token) {
      return { success: true, newToken: response.access_token };
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
