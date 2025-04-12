import prisma from "~/lib/prisma";

// استخدم التقسيم إلى صفحات مع دفق البيانات
export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany({});
  return { users };
});
