import prisma from "~/lib/prisma"
import { getUserById } from "~/server/db/user"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId } = body
  if (!userId) {
    return sendError(event, createError({ statusCode: 500, statusMessage: "User id is required." }))
  }
  const user = await getUserById(userId)
  if (!user) {
    return sendError(event, createError({ statusCode: 404, statusMessage: "User is not found." }))
  }
  try {
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: "rejected"
      }
    })
    return {
      message: "User have been rejected.",
      ok: true
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
