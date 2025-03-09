import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const params = event.context.params
  const id = params?.id
  try {
    const company = await prisma.company.findUnique({ where: { id }, include: { users: true, _count: true } })
    if (!company) {
      return sendError(event, createError({ statusCode: 404, statusMessage: "Company is not found." }))
    }
    return {
      message: "Company have fetched successfully.",
      company
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
