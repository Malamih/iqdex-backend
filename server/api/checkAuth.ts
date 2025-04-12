import prisma from "~/lib/prisma";
import { authChecker } from "../utils/authChecker";

export default defineEventHandler(async (event) => {
  const user = authChecker(event);

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
  });
  return { profile };
});
