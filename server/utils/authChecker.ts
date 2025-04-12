import jwt from "jsonwebtoken";
import {
  getCookie,
  getQuery,
  getHeader,
  H3Event,
  sendError,
  createError,
} from "h3";

export const authChecker = (event: H3Event) => {
  const config = useRuntimeConfig(event);

  // 1. حاول تأخذ التوكن من الكوكي
  let token = getCookie(event, "token");

  // 2. أو من الهيدر (Authorization: Bearer xxx)
  if (!token) {
    const authHeader = getHeader(event, "authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "No token provided" })
    );
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret) as { id: string };
    return decoded;
  } catch (err) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Invalid token" })
    );
  }
};
