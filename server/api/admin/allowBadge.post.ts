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
        badge_expired: false
      }
    })
    return {
      message: "Badge is not expired now",
      badge_expired: false,
      result
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
