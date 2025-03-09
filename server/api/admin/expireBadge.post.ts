import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id } = body
  if (!id) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "Invalid params" }))
  }
  try {
    const result = await prisma.admin.update({
      where: { id },
      data: {
        badge_expired: true
      }
    })
    return {
      result,
      message: "Badge is expired now",
      badge_expired: true
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
