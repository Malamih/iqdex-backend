import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    const admin = await prisma.admin.findFirst()
    return {
      message: "Admin have been fetched",
      admin: { email: admin?.email, id: admin?.id, badge_expired: admin?.badge_expired }
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
