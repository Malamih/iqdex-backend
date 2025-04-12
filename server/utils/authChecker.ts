import jwt from "jsonwebtoken";
import { getCookie } from "h3";

export const authChecker = (event: any) => {
  const config = useRuntimeConfig(event);
  const token = getCookie(event, "token");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret) as { id: string };
    return decoded; // ترجع بيانات المستخدم مثل id
  } catch (err) {
    throw createError({ statusCode: 401, statusMessage: "Invalid token" });
  }
};
