import prisma from "~/lib/prisma";

// استخدم التقسيم إلى صفحات مع دفق البيانات
export default defineEventHandler(async (event) => {
  const users = await prisma.user.findMany({
    select: {
      first_name: true,
      last_name: true,
      phone_number: true,
      email: true,
      country: true,
      position: true,
      status: true,
      participation_type: true,
    },
  });
  return { users };
});
