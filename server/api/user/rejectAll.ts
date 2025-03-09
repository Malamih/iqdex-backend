import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    await prisma.user.updateMany({
      data: {
        status: "rejected"
      }
    })
    return {
      message: "Users have been rejected successfully.",
      ok: true
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
