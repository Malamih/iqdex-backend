import { getUserById } from "~/server/db/user"

export default defineEventHandler(async (event) => {
  const params = event.context.params
  const id = params?.id
  const user = await getUserById(id)
  if (!user) {
    return sendError(event, createError({
      statusCode: 404,
      statusMessage: "User not found."
    }))
  }
  return { user }
})
