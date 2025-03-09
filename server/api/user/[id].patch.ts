import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const params = event.context.params;
  const id = params?.id;

  if (!id) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "User ID is required." })
    );
  }

  const { newData } = body;

  if (!newData) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Invalid params: newData is required." })
    );
  }

  const validFields: (keyof any)[] = [
    "first_name",
    "last_name",
    "email",
    "company_name",
    "country",
    "country_code",
    "phone_number",
    "position",
    "participation_type",
    "send_via",
    "status",
    "company_id",
  ];

  const filteredData = Object.keys(newData)
    .filter((key) => validFields.includes(key as keyof any))
    .reduce((obj, key) => {
      obj[key] = newData[key];
      return obj;
    }, {} as Partial<any>);

  if (Object.keys(filteredData).length === 0) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "No valid fields provided." })
    );
  }

  try {
    const result = await prisma.user.update({
      where: { id },
      data: filteredData,
    });

    return {
      message: "User updated successfully.",
      result,
    };
  } catch (error: any) {
    console.error("Error updating user:", error);

    let errorMessage = "An error occurred while updating the user.";
    if (error.code === "P2025") {
      errorMessage = "User not found.";
    } else if (error.code === "P2002") {
      errorMessage = "Duplicate entry: Email already exists.";
    }

    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: errorMessage })
    );
  }
});