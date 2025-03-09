import { getUserById } from "~/server/db/user";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);
  const { userId } = body;
  if (!userId) {
    return sendErrorResponse(event, 400, "Invalid params.");
  }

  const user: any = await getUserById(userId);
  if (!user) {
    return sendErrorResponse(event, 404, "User not found!");
  }

  if (user.status === "pending" || user.status === "rejected") {
    return sendErrorResponse(event, 400, "User is not accepted yet.");
  }

  const pdfFileUrl = user.pdf_file?.[0]?.url;
  if (!pdfFileUrl) {
    return sendErrorResponse(event, 404, "PDF file not found!");
  }

  const messageData = {
    messaging_product: "whatsapp",
    to: user.phone_number,
    type: "template",
    template: {
      name: "send_badge",
      language: { code: "en" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: pdfFileUrl,
                filename: `${user.first_name}_iqdex2025.pdf`,
              },
            },
          ],
        },
        {
          type: "body",
          parameters: [],
        },
      ],
    },
  };
  try {
    const result = await sendWhatsAppMessage(
      config.long_lived_token,
      config.phone_number_id,
      messageData
    );
    return {
      success: true,
      message: "Pdf file have been sent successfully.",
      result,
    };
  } catch (error: any) {
    if (
      error.response?.status === 401 ||
      error.response?.data?.error?.code === 190
    ) {
      console.log("🔄 Token expired, refreshing...");

      const refreshResponse: any = await $fetch("/api/facebook/refreshToken");

      if (refreshResponse.success && refreshResponse.newToken) {
        console.log("✅ Token refreshed successfully!");

        config.long_lived_token = refreshResponse.newToken;

        return await sendWhatsAppMessage(
          config.long_lived_token,
          config.phone_number_id,
          messageData
        );
      } else {
        console.error("❌ Failed to refresh token:", refreshResponse.error);
        return {
          error: "Token refresh failed",
          details: refreshResponse.error,
        };
      }
    }

    return { error: "Message error", details: error.statusMessage };
  }
});

function sendErrorResponse(event: any, statusCode: any, message: any) {
  return sendError(event, createError({ statusCode, statusMessage: message }));
}

const sendWhatsAppMessage = async (
  token: string,
  phoneNumberId: string,
  messageData: any
) => {
  return await $fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(messageData),
    }
  );
};
