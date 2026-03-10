import { createWorker } from "tesseract.js";
import { cropImage } from "./cropImages.js";

self.onmessage = async ({ data: { file, rects, lang = "spa" } }) => {
  if (!file || !rects?.length) return;
  const texts = [];
  const bitmap = await createImageBitmap(file);

  for (const rect of rects) {
    const croppedImage = await cropImage({ bitmap, rect });
    const worker = await createWorker(lang);
    const ret = await worker.recognize(croppedImage);
    const result = ret.data.text;
    await worker.terminate();
    texts.push(result);
  }

  self.postMessage(texts);
  bitmap.close();
};
