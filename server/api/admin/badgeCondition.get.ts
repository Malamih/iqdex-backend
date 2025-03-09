import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    const admin = await prisma.admin.findFirst()
    return {
      badge_expired: admin?.badge_expired,
      admin: admin
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
