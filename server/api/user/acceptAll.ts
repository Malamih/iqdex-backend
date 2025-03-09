import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    await prisma.user.updateMany({
      data: {
        status: "accepted"
      }
    })
    return {
      message: "Users have been accepted successfully.",
      ok: true
    }
  } catch (error: any) {
    if (error.message) {
      return sendError(event, createError({ statusCode: 500, statusMessage: error.message }))
    }
    if (error.statusMessage) {
      return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
    }
  }
})
