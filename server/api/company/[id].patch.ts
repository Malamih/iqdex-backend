import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const params = event.context.params;
  const id = params?.id;

  if (!id) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Company ID is required." })
    );
  }

  const { newData } = body;

  if (!newData) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Invalid params: newData is required." })
    );
  }

  const validFields: (keyof any)[] = ["name", "users_limit"];

  const filteredData = Object.keys(newData)
    .filter((key) => validFields.includes(key as keyof any))
    .reduce((obj, key) => {
      obj[key] = newData[key];
      return obj;
    }, {} as Partial<any>);

  if (Object.keys(filteredData).length === 0) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "No valid fields provided. Expected 'name' or 'users_limit'." })
    );
  }

  try {
    const result = await prisma.company.update({
      where: { id },
      data: filteredData,
    });

    return {
      message: "Company updated successfully.",
      result,
    };
  } catch (error: any) {
    console.error("Error updating company:", error);

    let errorMessage = "An error occurred while updating the company.";
    if (error.code === "P2025") {
      errorMessage = "Company not found.";
    } else if (error.code === "P2002") {
      errorMessage = "Duplicate entry: Company name already exists.";
    }

    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: errorMessage })
    );
  }
});