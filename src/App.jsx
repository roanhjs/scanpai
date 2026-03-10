import { useRef, useEffect, useState } from "react";
import worker from "./worker/worker.js?worker";
import { ImagePlus, ScanText } from "lucide-react";

export default function App() {
  const canvasRef = useRef(null);
  const workerInstance = useRef(new worker());

  const [rects, setRects] = useState([]);
  const [images, setImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const worker = workerInstance.current;
    if (!worker) return;

    worker.onmessage = ({ data }) => {
      setTexts((prev) => [...prev, data]);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !images[selectedIndex]) return;

    const currentImg = images[selectedIndex];

    canvas.width = currentImg.width;
    canvas.height = currentImg.height;

    const ctx = canvas.getContext("2d");

    let isDrawing = false;
    let startX = 0;
    let startY = 0;

    const getMousePos = (event) => {
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY,
      };
    };

    const drawPreview = (x, y, w, h) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);

      ctx.strokeRect(x, y, w, h);
    };

    const handleMouseDown = (event) => {
      const pos = getMousePos(event);

      startX = pos.x;
      startY = pos.y;

      isDrawing = true;
    };

    const handleMouseMove = (event) => {
      if (!isDrawing) return;

      const pos = getMousePos(event);

      const width = pos.x - startX;
      const height = pos.y - startY;

      drawPreview(startX, startY, width, height);
    };

    const handleMouseUp = (event) => {
      if (!isDrawing) return;

      isDrawing = false;

      const pos = getMousePos(event);

      let width = pos.x - startX;
      let height = pos.y - startY;

      let x = startX;
      let y = startY;

      if (width < 0) {
        x += width;
        width = Math.abs(width);
      }

      if (height < 0) {
        y += height;
        height = Math.abs(height);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (width < 5 || height < 5) return;

      setRects((prev) => [
        ...prev,
        {
          x: x / canvas.width,
          y: y / canvas.height,
          width: width / canvas.width,
          height: height / canvas.height,
        },
      ]);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [selectedIndex, images]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newImages = [];

    for (const file of files) {
      const url = URL.createObjectURL(file);

      const bitmap = await createImageBitmap(file);

      const arrayBuffer = await file.arrayBuffer();

      newImages.push({
        file,
        url,
        width: bitmap.width,
        height: bitmap.height,
        buffer: arrayBuffer,
      });

      bitmap.close();
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const extract = () => {
    if (!images[selectedIndex]) return;

    workerInstance.current.postMessage({
      file: images[selectedIndex].file,
      rects,
    });
  };

  return (
    <main className="bg-[#252525] w-full h-dvh grid grid-rows-[auto] text-white">
      <div className="min-h-0 grid grid-rows-[auto_1fr]">
        <nav className="flex justify-end items-center gap-2 p-2 border-b border-gray-200/10">
          <label
            htmlFor="file-input"
            className="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-200/10 cursor-pointer"
          >
            <input
              type="file"
              id="file-input"
              hidden
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />

            <ImagePlus className="w-5 h-5" />
            <p className="text-sm">Añadir</p>
          </label>

          <button
            onClick={extract}
            className="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-200/10 cursor-pointer"
          >
            <ScanText className="w-5 h-5" />
            <p className="text-sm">Extraer</p>
          </button>
        </nav>

        <div className="w-full h-full grid grid-cols-[1fr_2fr_1fr] min-h-0">
          <section className="overflow-hidden">
            <ul className="h-full flex flex-col gap-3 overflow-y-auto py-4">
              {images.map((img, index) => (
                <li key={index} className="flex justify-center">
                  <img
                    src={img.url}
                    alt=""
                    className={`w-1/2 max-w-60 rounded-lg cursor-pointer border transition
                    ${
                      selectedIndex === index
                        ? "border-white/40"
                        : "border-white/10 opacity-60"
                    }`}
                    onClick={() => {
                      setSelectedIndex(index);
                      setRects([]);
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="relative flex items-center justify-center bg-gray-200/10 overflow-hidden">
            {images[selectedIndex] ? (
              <div
                className="relative shadow-xl"
                style={{
                  aspectRatio: `${images[selectedIndex].width} / ${images[selectedIndex].height}`,
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              >
                <img
                  src={images[selectedIndex].url}
                  alt=""
                  className="block max-h-full max-w-full"
                />

                <canvas
                  key={selectedIndex}
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                />

                <div className="absolute inset-0 pointer-events-none">
                  {rects.map((rect, index) => (
                    <div
                      key={index}
                      className="absolute border-2 border-red-500"
                      style={{
                        left: `${rect.x * 100}%`,
                        top: `${rect.y * 100}%`,
                        width: `${rect.width * 100}%`,
                        height: `${rect.height * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <label
                className="w-full h-full border-dashed border-2 flex flex-col items-center justify-center cursor-pointer"
                htmlFor="file-input"
              >
                <ImagePlus className="w-8 h-8 mb-2" />
                <p>Arrastra imágenes aquí</p>
                <p className="text-sm opacity-70">
                  o haz clic para seleccionar
                </p>
              </label>
            )}
          </section>

          <section>
            <div className="p-2">
              <h3 className="font-bold">Texto extraído</h3>
            </div>

            <div className="p-2 bg-gray-200/20">
              <h4 className="font-semibold text-sm">Texto Original</h4>

              <ul className="flex flex-col gap-4 overflow-y-auto">
                {texts.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
