import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    await prisma.user.deleteMany({
      where: {
        company_id: {
          not: null
        }
      }
    })
    const result = await prisma.company.deleteMany()
    return {
      message: "Companies have been deleted successfully.",
      result
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
