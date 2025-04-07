import { getUserById } from "~/server/db/user";
import path from "path";
import fs from "fs/promises";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { uploadPdfFile } from "~/server/db/cloudinary";
import { createPdfFile } from "~/server/db/pdfFile";
import { useImageHelpers } from "~/composables/image";
import axios from "axios";
import sharp from "sharp";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fetchImage, getContentType } = useImageHelpers();
  const { user_id } = body;

  if (!user_id) {
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: "Invalid params!" })
    );
  }

  const user = await getUserById(user_id);
  if (!user) {
    return sendError(
      event,
      createError({ statusCode: 404, statusMessage: "User not found!" })
    );
  }

  let existingPdfBytes = "";
  try {
    const exhibitor =
      "https://res.cloudinary.com/dvrenrmbg/image/upload/v1740840884/s48hvkne6rgharhfry7l.pdf";
    const press =
      "https://res.cloudinary.com/dvrenrmbg/raw/upload/v1740739784/badges/v69l3dsbdym17jackbyu.pdf";
    const organizer =
      "https://res.cloudinary.com/dvrenrmbg/raw/upload/v1740739725/badges/gecoxnbkpinlnkap36tv.pdf";
    const visitor =
      "https://res.cloudinary.com/dvrenrmbg/raw/upload/v1740739826/badges/wb47ukmqsp33x9ascgbm.pdf";
    let pdfUrl = exhibitor;
    if (user.participation_type == "press") {
      pdfUrl = press;
    } else if (user.participation_type == "organizer") {
      pdfUrl = organizer;
    } else if (user.participation_type == "visitor") {
      pdfUrl = visitor;
    }

    try {
      const fileResponse = await axios.get(pdfUrl, {
        responseType: "arraybuffer",
      });
      existingPdfBytes = fileResponse.data;
    } catch (error: any) {
      return sendError(
        event,
        createError({
          statusCode: 404,
          statusMessage: "Original PDF file not found!" + ", Error: " + error,
        })
      );
    }

    if (existingPdfBytes == "") return;

    const imageBytes = await fetchImage(user.image[0].url);
    const qrCodeBytes = await fetchImage(user.qr_code[0].url);

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const contentType = getContentType(user.image[0].url);
    const processedImage = await sharp(imageBytes).rotate().toBuffer();
    const embeddedImage =
      contentType === "png"
        ? await pdfDoc.embedPng(processedImage)
        : await pdfDoc.embedJpg(processedImage);
    const embeddedQrCode = await pdfDoc.embedPng(qrCodeBytes);

    firstPage.drawImage(embeddedQrCode, {
      x: 220,
      y: 484,
      width: 60,
      height: 60,
    });
    firstPage.drawImage(embeddedImage, {
      x: 202,
      y: 667,
      width: 84,
      height: 85,
    });

    const fontSize = 15;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // كتابة الاسم
    firstPage.drawText(`${user.first_name} ${user.last_name}`, {
      x: 19,
      y: 637,
      size: fontSize,
      color: rgb(0, 0, 0),
      font: font,
    });

    // كتابة المنصب
    firstPage.drawText(user.position, {
      x: 19,
      y: 576,
      size: fontSize,
      color: rgb(0, 0, 0),
      font: font,
    });

    // كتابة اسم الشركة مع تقسيم النص
    const companyName = user.company_name;
    const maxWidth = 200; // تم تغيير القيمة إلى 200px
    const lineHeight = fontSize * 1.2; // ارتفاع السطر
    let currentY = 517; // الموضع الرأسي البدائي

    const words = companyName.split(" ");
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + " " + word;
      const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (lineWidth > maxWidth) {
        // رسم السطر الحالي
        firstPage.drawText(currentLine, {
          x: 19,
          y: currentY,
          size: fontSize,
          color: rgb(0, 0, 0),
          font: font,
        });
        currentY -= lineHeight; // الانتقال للسطر التالي
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    // رسم آخر سطر متبقي
    firstPage.drawText(currentLine, {
      x: 19,
      y: currentY,
      size: fontSize,
      color: rgb(0, 0, 0),
      font: font,
    });

    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = path.resolve(`/tmp/modified-${user_id}.pdf`);
    await fs.writeFile(modifiedPdfPath, modifiedPdfBytes);

    const response = await uploadPdfFile(modifiedPdfPath, "pdf_files");

    await fs.unlink(modifiedPdfPath);

    const data = {
      url: response.secure_url,
      public_id: response.public_id,
      user_id,
    };

    const savedFile = await createPdfFile(data);

    return { message: "Your file generated.", savedFile };
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to modify, upload, or save file! ${error}`,
    });
  }
});
