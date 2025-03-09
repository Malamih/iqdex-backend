export const useImageHelpers = () => {
  const fetchImage = async (url: any) => {
    const response = await fetch(url);

    const contentType = response.headers.get("Content-Type");
    if (!contentType || !["image/jpeg", "image/png"].includes(contentType)) {
      throw createError({
        statusCode: 400,
        message: "Only PNG, JPG, or JPEG images are allowed.",
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  };

  const getContentType = (url: any) => {
    const extension = url.split(".").pop().toLowerCase();

    switch (extension) {
      case "jpg":
      case "jpeg":
        return "jpeg";
      case "png":
        return "png";
      case "gif":
        return "gif";
      default:
        return "unknown";
    }
  };

  return { getContentType, fetchImage }
}
