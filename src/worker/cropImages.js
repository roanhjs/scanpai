async function cropImage({ bitmap, rect }) {
  const imgWidth = bitmap.width;
  const imgHeight = bitmap.height;

  let x = Math.round(rect.x * imgWidth);
  let y = Math.round(rect.y * imgHeight);
  let width = Math.round(rect.width * imgWidth);
  let height = Math.round(rect.height * imgHeight);

  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }

  if (height < 0) {
    y += height;
    height = Math.abs(height);
  }

  width = Math.max(1, width);
  height = Math.max(1, height);

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);

  const blob = await canvas.convertToBlob({
    type: "image/png",
  });

  return blob;
}

export { cropImage };
