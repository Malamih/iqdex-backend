import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    const companies = await prisma.company.findMany({ include: { users: true, _count: true } })
    return {
      message: "Companies are fetched successfully.",
      companies
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
