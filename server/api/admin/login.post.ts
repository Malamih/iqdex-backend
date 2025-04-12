import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const config = useRuntimeConfig(event);
  const { email, password } = body;
  if (!email || !password) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: "Invalid params!" })
    );
  }
  try {
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      const data = {
        email,
        password: (await bcrypt.hash(password, 10)) || "",
      };
      const admin = await prisma.admin.create({ data });
      const token = jwt.sign({ admin_id: admin.id }, config.jwt_secret, {
        expiresIn: "1d",
      });
      return {
        message: "logged in successfully",
        token,
        admin,
      };
    }
    const adminByEmail = await prisma.admin.findFirst({ where: { email } });
    if (!adminByEmail) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: "Admin email is wrong." })
      );
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: "Password is not correct.",
        })
      );
    }
    const token = jwt.sign({ admin_id: adminByEmail.id }, config.jwt_secret, {
      expiresIn: "1d",
    });
    setCookie(event, "token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });
    return {
      message: "Logged in successfully.",
      admin: {
        id: adminByEmail.id,
        email: adminByEmail.email,
        badge_expired: adminByEmail.badge_expired,
      },
      token,
    };
  } catch (err: any) {
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: err.statusMessage })
    );
  }
});
