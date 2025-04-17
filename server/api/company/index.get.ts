import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const search = (query.search as string) || "";
    const limit = Math.min(Number(query.limit) || Infinity, 500);

    const take = limit;

    const where = {
      name: search
        ? {
            contains: search,
            mode: "insensitive" as const,
          }
        : undefined,
    };

    const totalCount = await prisma.company.count({ where });

    const companies = await prisma.company.findMany({
      skip: (page - 1) * take,
      take,
      where,
      include: {
        _count: {
          select: {
            users: true, // Only count the users relation
          },
        },
      },
    });

    // Transform the response to flatten the count
    const companiesWithUserCount = companies.map((company) => ({
      ...company,
      userCount: company._count.users, // Extract the count
      _count: undefined, // Remove the _count field
    }));

    return {
      message: "Companies are fetched successfully.",
      companies: companiesWithUserCount,
      pagination: {
        currentPage: page,
        pageSize: take,
        totalPages: Math.ceil(totalCount / take),
        totalCount,
        hasMore: page * take < totalCount && page * take < limit,
      },
    };
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.message || "Failed to fetch companies.",
      })
    );
  }
});
