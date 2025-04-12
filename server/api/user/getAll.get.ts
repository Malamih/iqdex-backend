import { getAllUsers } from "~/server/db/user";

export default defineEventHandler(async (event) => {
  const users = await getAllUsers();
  return users;
});
