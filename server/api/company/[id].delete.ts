import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  const params = event.context.params
  const id = params?.id
  try {
    await prisma.user.deleteMany({
      where: {
        company_id: id
      }
    })
    const result = await prisma.company.delete({ where: { id } })
    return {
      message: "Company have been deleted successfully.",
      result
    }
  } catch (error: any) {
    return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }))
  }
})
