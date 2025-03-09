import { getAllUsers } from "~/server/db/user"

export default defineEventHandler(async (event) => {
  const users = await getAllUsers()
  return {
    ok: true,
    message: "Users have been fetched.",
    users
  }
})
