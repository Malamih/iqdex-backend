import prisma from "~/lib/prisma";
import { deleteFromCloudinary } from "./cloudinary";

export const createImage = async (data: any) => {
  const image = await prisma.image.create({ data });
  return image;
};

export const deleteImage = async (id: any) => {
  try {
    const image = await prisma.image.findFirst({ where: { user_id: id } });
    const cldResult: any = await deleteFromCloudinary(
      image?.public_id as string,
      "image"
    );
    const result = await prisma.image.delete({
      where: {
        id,
      },
    });
    return { result, cldResult };
  } catch (error: any) {
    throw Error(error.statusMessage);
  }
};
