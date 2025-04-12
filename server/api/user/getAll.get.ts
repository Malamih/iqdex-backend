import prisma from "~/lib/prisma";
import { writeFile } from "fs/promises";

export default defineEventHandler(async (event) => {
  const batchSize = 1000; // عدد المستخدمين في كل دفعة
  try {
    const users = await prisma.user.findMany();

    return {
      ok: true,
      users,
    };
  } catch (error: any) {
    sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.message,
      })
    );
  }
});
