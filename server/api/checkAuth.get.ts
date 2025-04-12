import prisma from "~/lib/prisma";
import { authChecker } from "../utils/authChecker";

export default defineEventHandler(async (event) => {
  const user = authChecker(event);

  return { user };
});
