// دفق البيانات مع Node.js Readable Stream
import { Readable } from "stream";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const stream = new Readable({ objectMode: true, read() {} });

  const processUsers = async (cursor: any) => {
    const users = await prisma.user.findMany({
      take: 1000,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { id: "asc" },
    });

    if (users.length === 0) {
      stream.push(null); 
      return;
    }

    users.forEach((user) => stream.push(user));
    await processUsers(users[users.length - 1].id);
  };

  processUsers(null);

  return sendStream(event, stream);
});
