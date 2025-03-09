import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserById = async (id: any) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      pdf_file: true,
      image: true,
      qr_code: true
    },
  });
  return user;
};

export const createUser = async (data: any) => {
  const user = await prisma.user.create({ data, include: { image: true, qr_code: true } });
  return user;
};

export const getUserByName = async (first_name: string) => {
  const user = await prisma.user.findFirst({
    where: { first_name },
  });
  return user;
};

export const getUserByEmail = async (email: any) => {
  const user = await prisma.user.findFirst({ where: { email } })
  return user
}

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      image: true,
      qr_code: true,
      pdf_file: true
    }
  })
  return users
}