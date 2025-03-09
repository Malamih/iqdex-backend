export const useCalculateCover = (image: any, frame: any) => {
  const { width: imgWidth, height: imgHeight } = image;
  const { x, y, width: frameWidth, height: frameHeight } = frame;

  // نسب الصورة والإطار
  const imgAspectRatio = imgWidth / imgHeight;
  const frameAspectRatio = frameWidth / frameHeight;

  let renderWidth, renderHeight, offsetX, offsetY;

  if (imgAspectRatio > frameAspectRatio) {
    // إذا كانت الصورة أعرض، اضبط العرض وركز الصورة عموديًا
    renderWidth = frameHeight * imgAspectRatio;
    renderHeight = frameHeight;
    offsetX = x - (renderWidth - frameWidth) / 2; // قص الجوانب
    offsetY = y;
  } else {
    // إذا كانت الصورة أطول، اضبط الارتفاع وركز الصورة أفقيًا
    renderWidth = frameWidth;
    renderHeight = frameWidth / imgAspectRatio;
    offsetX = x;
    offsetY = y - (renderHeight - frameHeight) / 2; // قص الأعلى والأسفل
  }

  return {
    x: offsetX,
    y: offsetY,
    width: renderWidth,
    height: renderHeight,
  };
};
