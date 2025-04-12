import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const page = parseInt(query.page as string) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { email: { contains: search, mode: "insensitive" } },
      skip,
      take: limit,
      include: {
        _count: true,
        company: true,
        image: true,
        pdf_file: true,
        qr_code: true,
      },
    }),
    prisma.user.count(),
  ]);
  return {
    ok: true,
    message: "Users have been fetched.",
    users,
    totalPages: Math.ceil(total / limit),
    count: total,
  };
});
