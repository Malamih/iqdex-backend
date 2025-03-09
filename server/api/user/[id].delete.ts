import prisma from "~/lib/prisma";
import { deleteFromCloudinary } from "~/server/db/cloudinary";

export default defineEventHandler(async (event) => {
  const params = event.context.params;
  const id = params?.id;

  if (!id) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: "User ID is required.",
      })
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        pdf_file: true,
        image: true,
        qr_code: true,
      },
    });

    if (!user) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "User not found.",
        })
      );
    }
    if (user.image[0]) {
      await deleteFromCloudinary(user.image[0].public_id, "image");
    }
    if (user.qr_code[0]) {
      await deleteFromCloudinary(user.qr_code[0].public_id, "image");
    }
    if (user.pdf_file[0]) {
      await deleteFromCloudinary(user.pdf_file[0].public_id, "file");
    }
    await prisma.pdfFile.deleteMany({
      where: { user_id: user.id },
    });
    await prisma.image.deleteMany({
      where: { user_id: user.id },
    });
    await prisma.qrCode.deleteMany({
      where: { user_id: user.id },
    });

    await prisma.user.delete({
      where: { id },
    });

    return {
      message: "User has been deleted successfully.",
    };
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error.statusMessage,
      })
    );
  }
});
