import { defineEventHandler, getRequestHeader, createError } from "h3";
import jwt from "jsonwebtoken";

const unProtectedRoutes = [
  "/api/admin/login",
  "/api/user/register",
  "/api/admin/badgeCondition",
  "/api/company",
  "/api/facebook/refreshToken",
  "/api/pdf/send/whatsapp",
  "/api/user/getAll",
];

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (event.node.req.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    return "";
  }
  const route = event.node.req.url as string;
  console.log(unProtectedRoutes.includes("/company"));
  if (unProtectedRoutes.includes(route.split("?")[0])) {
    return;
  }

  const token = getRequestHeader(event, "Authorization")?.split(" ")[1];
  if (!token) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Unauthorized: No token provided.",
      })
    );
  }

  try {
    const config = useRuntimeConfig(event);
    const decoded = jwt.verify(token, config.jwt_secret);
    event.context.user = decoded;
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: "Unauthorized: Invalid token.",
      })
    );
  }
});
