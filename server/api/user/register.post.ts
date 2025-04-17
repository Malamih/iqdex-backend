import { usePhoneNumberHelpers } from "~/composables/phoneNumberHelpers";
import prisma from "~/lib/prisma";
import {
  uploadStreamCloudinary,
  uploadToCloudinary,
} from "~/server/db/cloudinary";
import { createImage } from "~/server/db/image";
import { createQrCode, generateQrCode } from "~/server/db/qrCode";
import { createUser } from "~/server/db/user";

export default defineEventHandler(async (event) => {
  const form = await readMultipartFormData(event);

  const getFieldValue = (fieldName: string, isImage: boolean) => {
    if (isImage) {
      const field = form?.find((field) => field.name == fieldName)?.data;
      return field;
    } else {
      const field = form
        ?.find((field) => field.name == fieldName)
        ?.data.toString("utf-8");
      return field;
    }
  };
  const first_name = getFieldValue("first_name", false);
  const last_name = getFieldValue("last_name", false);
  const email = getFieldValue("email", false);
  const phone_number = getFieldValue("phone_number", false);
  const position = getFieldValue("position", false);
  const company_name: string | any = getFieldValue("company_name", false);
  const participation_type: any = getFieldValue("participation_type", false);
  const send_via: any = getFieldValue("send_via", false);
  // const country = getFieldValue("country", false);
  const image = getFieldValue("image", true);
  const country_code = getFieldValue("country_code", false);

  const { validateCountryCode } = usePhoneNumberHelpers();
  const fields = [
    first_name,
    last_name,
    email,
    phone_number,
    position,
    company_name,
    participation_type,
    send_via,
    // country,
    image,
    country_code,
  ];
  fields.forEach((field) => {
    if (!field) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: "Invalid params!" })
      );
    }
  });
  // if (!validateCountryCode(country_code)) {
  //   return sendError(
  //     event,
  //     createError({
  //       statusCode: 500,
  //       statusMessage: "Country code is not valid.",
  //     })
  //   );
  // }
  const availableParticipationTypes = [
    "exhibitor",
    "press",
    "visitor",
    "organizer",
  ];
  const isParticipation_typeAvailable = availableParticipationTypes.includes(
    participation_type.toLowerCase()
  );
  if (!isParticipation_typeAvailable) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: "Participation type is not available.",
      })
    );
  }

  if (
    send_via.toLowerCase() != "whatsapp" &&
    send_via.toLowerCase() != "email"
  ) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: `Send badge via ${send_via} is not available right now.`,
      })
    );
  }

  if (participation_type != "exhibitor") {
    try {
      const company = await prisma.company.findFirst({
        where: { name: company_name.toLowerCase() },
      });
      if (company) {
        return sendError(
          event,
          createError({
            statusCode: 500,
            statusMessage: `Sorry but ${company.name} company only support exhibitors, please choose exhibitor type to continue.`,
          })
        );
      }

      const data = {
        first_name: first_name ?? "",
        last_name: last_name ?? "",
        email: email ?? "",
        company_name: company_name ?? "",
        // country: country ?? "",
        country_code: country_code?.toString(),
        phone_number: phone_number?.toString() ?? "",
        position: position ?? "",
        participation_type: participation_type.toLowerCase() ?? "",
        send_via: send_via.toLowerCase() ?? "",
      };
      const qrCodeBinary = await generateQrCode(
        `
        full name: ${first_name} ${last_name}
        email: ${email}
        phone number: ${phone_number}
        company name: ${company_name}
        position: ${position}
        participation type: ${participation_type}
        send via: ${send_via}
        `
      );
      const cldImage = await (<any>(
        uploadStreamCloudinary(image, "profile_images")
      ));
      const cldQrcode = await uploadToCloudinary(qrCodeBinary, "qr_codes");
      const user = await createUser(data);
      await createImage({
        public_id: cldImage.public_id,
        url: cldImage.secure_url,
        user_id: user.id,
      });
      await createQrCode({
        public_id: cldQrcode.public_id,
        url: cldQrcode.secure_url,
        user_id: user.id,
      });
      return {
        message: "User registered successfully.",
        ok: true,
        user,
      };
    } catch (error: any) {
      return sendError(
        event,
        createError({ statusCode: 500, statusMessage: error.statusMessage })
      );
    }
  } else {
    const company = await prisma.company.findFirst({
      where: {
        name: company_name,
      },
      include: {
        users: true,
      },
    });
    if (!company) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: `${company_name} is not registered in our system, please try again or contact us.`,
        })
      );
    }
    const users = company.users;
    if (users.length >= company.users_limit) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: `${company_name} have reached the users limit.`,
        })
      );
    }
    const data = {
      first_name: first_name ?? "",
      last_name: last_name ?? "",
      email: email ?? "",
      company_name: company_name ?? "",
      // country: country ?? "",
      country_code: country_code?.toString(),
      phone_number: phone_number?.toString() ?? "",
      position: position ?? "",
      participation_type: participation_type.toLowerCase() ?? "",
      send_via: send_via.toLowerCase() ?? "",
      company_id: company.id,
    };
    const qrCodeBinary = await generateQrCode(
      `
      full name: ${first_name} ${last_name}
      email: ${email}
      phone number: ${phone_number}
      company name: ${company_name}
      position: ${position}
      participation type: ${participation_type}
      send via: ${send_via}
      `
    );
    const cldImage = await (<any>(
      uploadStreamCloudinary(image, "profile_images")
    ));
    const cldQrcode = await uploadToCloudinary(qrCodeBinary, "qr_codes");

    const user = await createUser(data);
    await createImage({
      public_id: cldImage.public_id,
      url: cldImage.secure_url,
      user_id: user.id,
    });
    await createQrCode({
      public_id: cldQrcode.public_id,
      url: cldQrcode.secure_url,
      user_id: user.id,
    });
    return {
      message: "User registered successfully",
      user,
    };
  }
});
