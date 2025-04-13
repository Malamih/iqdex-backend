import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const search = (query.search as string) || "";
  const statusParam = query.status as string | undefined;
  const page = parseInt(query.page as string) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    email: {
      contains: search,
      mode: "insensitive",
    },
  };

  // Handle multiple status values
  if (statusParam) {
    const validStatuses = ["accepted", "rejected", "pending"];
    const statuses = statusParam
      .split(",")
      .filter((s) => validStatuses.includes(s.toLowerCase()));

    if (statuses.length > 0) {
      whereClause.status = {
        in: statuses,
      };
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
      include: {
        _count: true,
        company: true,
        image: true,
        pdf_file: true,
        qr_code: true,
      },
    }),
    prisma.user.count({
      where: whereClause,
    }),
  ]);

  return {
    ok: true,
    message: "Users have been fetched.",
    users,
    totalPages: Math.ceil(total / limit),
    count: total,
  };
});
