import prisma from "~/lib/prisma";
import { deleteFromCloudinary } from "./cloudinary";

export const createPdfFile = async (data: any) => {
  const file = await prisma.pdfFile.create({ data });
  return file;
};

export const getPdfByUserId = async (id: any) => {
  const file = await prisma.pdfFile.findFirst({
    where: {
      user_id: id,
    },
  });
  return file;
};

export const deletePdfFile = async (id: any) => {
  try {
    const file = await prisma.pdfFile.findFirst({ where: { user_id: id } });
    const cldResult: any = await deleteFromCloudinary(
      file?.public_id as string,
      "file"
    );
    const result = await prisma.pdfFile.delete({
      where: {
        id,
      },
    });
    return { result, cldResult };
  } catch (error: any) {
    throw Error(error);
  }
};
