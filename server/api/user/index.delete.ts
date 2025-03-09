import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    await prisma.image.deleteMany();

    await prisma.qrCode.deleteMany();
    await prisma.pdfFile.deleteMany();

    const deletedUsers = await prisma.user.deleteMany();

    return {
      message: "Users and related data have been deleted successfully.",
      ok: true,
      deletedUsers
    };
  } catch (error: any) {
    if (error.statusMessage) {
      return sendError(event, createError({ statusCode: 500, statusMessage: error.statusMessage }));
    }
    return sendError(event, createError({ statusCode: 500, statusMessage: error.message }));
  }
});
