"use client";

import React, { useRef, useState, useEffect, MouseEvent } from "react";

export interface ImageItem {
  id: string;
  url: string;
  img?: HTMLImageElement;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  cropRect?: { x: number; y: number; width: number; height: number };
}

type HandleType = "move" | "rotate" | "resize";
type ResizeHandle = "nw" | "ne" | "se" | "sw";

const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 30;
const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;

const CustomImageEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [action, setAction] = useState<HandleType | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [origState, setOrigState] = useState<Partial<ImageItem>>({});

  useEffect(() => {
    images.forEach((item) => {
      if (!item.img) {
        const imgEl = new Image();
        imgEl.crossOrigin = "anonymous";
        imgEl.onload = () => {
          setImages((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, img: imgEl } : i))
          );
        };
        imgEl.src = item.url;
      }
    });
  }, [images]);

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    images.forEach((item) => {
      if (!item.img) return;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);
      ctx.drawImage(item.img, -item.img.width / 2, -item.img.height / 2);
      ctx.restore();

      if (item.id === selectedId && item.img) {
        drawHandles(ctx, item);
      }
    });
  }, [images, selectedId]);

  // Add image
  const handleAddImage = () => {
    if (!newUrl) return;
    const id = Date.now().toString();
    setImages((prev) => [
      ...prev,
      {
        id,
        url: newUrl,
        x: DEFAULT_CANVAS_WIDTH / 2,
        y: DEFAULT_CANVAS_HEIGHT / 2,
        rotation: 0,
        scale: 1,
      },
    ]);
    setNewUrl("");
    setSelectedId(id);
  };

  // Mouse helpers
  const toCanvasCoords = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Hit test for handles or image body
  const hitTest = (pt: {
    x: number;
    y: number;
  }): {
    handle?: ResizeHandle;
    overRotate?: boolean;
    overImage?: ImageItem | null;
  } => {
    const sel = images.find((i) => i.id === selectedId);
    if (!sel || !sel.img) return { overImage: null };
    // Transform point into image local space
    const dx = pt.x - sel.x;
    const dy = pt.y - sel.y;
    const angle = (-sel.rotation * Math.PI) / 180;
    const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
    const ly = dx * Math.sin(angle) + dy * Math.cos(angle);
    const w = (sel.img.width * sel.scale) / 2;
    const h = (sel.img.height * sel.scale) / 2;

    // Check resize handles
    const corners: Record<ResizeHandle, { x: number; y: number }> = {
      nw: { x: -w, y: -h },
      ne: { x: w, y: -h },
      se: { x: w, y: h },
      sw: { x: -w, y: h },
    };
    for (const key in corners) {
      const c = corners[key as ResizeHandle];
      if (
        Math.abs(lx - c.x) < HANDLE_SIZE &&
        Math.abs(ly - c.y) < HANDLE_SIZE
      ) {
        return { handle: key as ResizeHandle, overImage: sel };
      }
    }
    // Check rotate handle (above top-center)
    if (Math.hypot(lx, ly + h + ROTATE_HANDLE_OFFSET) < HANDLE_SIZE) {
      return { overRotate: true, overImage: sel };
    }
    // Check inside image
    if (lx > -w && lx < w && ly > -h && ly < h) {
      return { overImage: sel };
    }
    return { overImage: null };
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const pt = toCanvasCoords(e);
    const { handle, overRotate, overImage } = hitTest(pt);
    if (overImage) {
      setSelectedId(overImage.id);
      setStartPoint(pt);
      setOrigState({
        x: overImage.x,
        y: overImage.y,
        rotation: overImage.rotation,
        scale: overImage.scale,
      });
      if (handle) {
        setAction("resize");
        setResizeHandle(handle);
      } else if (overRotate) {
        setAction("rotate");
      } else {
        setAction("move");
      }
    } else {
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!action || !selectedId) return;
    const pt = toCanvasCoords(e);
    const dx = pt.x - startPoint.x;
    const dy = pt.y - startPoint.y;

    setImages((prev) =>
      prev.map((item) => {
        if (item.id !== selectedId) return item;
        const orig = origState;
        if (action === "move") {
          return {
            ...item,
            x: (orig.x as number) + dx,
            y: (orig.y as number) + dy,
          };
        }
        if (action === "rotate") {
          const center = { x: orig.x as number, y: orig.y as number };
          const ang1 = Math.atan2(
            startPoint.y - center.y,
            startPoint.x - center.x
          );
          const ang2 = Math.atan2(pt.y - center.y, pt.x - center.x);
          return {
            ...item,
            rotation:
              (orig.rotation as number) + ((ang2 - ang1) * 180) / Math.PI,
          };
        }
        if (action === "resize" && resizeHandle && item.img) {
          // Resize proportional
          const signX = resizeHandle.includes("e") ? 1 : -1;
          const signY = resizeHandle.includes("s") ? 1 : -1;
          const delta = signX * dx + signY * dy;
          const base = (item.img.width + item.img.height) / 2;
          const newScale = Math.max(
            0.1,
            (base * (orig.scale as number) + delta) / base
          );
          return { ...item, scale: newScale };
        }
        return item;
      })
    );
  };

  const handleMouseUp = () => {
    setAction(null);
    setResizeHandle(null);
  };

  // Draw UI handles
  const drawHandles = (ctx: CanvasRenderingContext2D, item: ImageItem) => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.scale, item.scale);
    if (!item.img) return;
    const w = item.img.width / 2;
    const h = item.img.height / 2;
    const corners = [
      { x: -w, y: -h },
      { x: w, y: -h },
      { x: w, y: h },
      { x: -w, y: h },
    ];
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    corners.forEach(({ x, y }) => {
      ctx.fillRect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE
      );
      ctx.strokeRect(
        x - HANDLE_SIZE / 2,
        y - HANDLE_SIZE / 2,
        HANDLE_SIZE,
        HANDLE_SIZE
      );
    });
    // rotate handle
    ctx.beginPath();
    ctx.arc(0, -h - ROTATE_HANDLE_OFFSET, HANDLE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  return (
    <div className="p-4 flex space-x-4">
      <div className="w-64 space-y-2">
        <h2 className="text-xl font-bold">Images</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Image URL"
            className="border p-2 flex-grow"
          />
          <button
            onClick={handleAddImage}
            className="bg-blue-500 text-white px-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-2 space-y-1">
          {images.map((item) => (
            <li
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`p-2 border rounded cursor-pointer ${
                selectedId === item.id ? "border-blue-500" : ""
              }`}
            >
              {item.id}
            </li>
          ))}
        </ul>
      </div>
      <canvas
        ref={canvasRef}
        width={DEFAULT_CANVAS_WIDTH}
        height={DEFAULT_CANVAS_HEIGHT}
        className="border flex-grow"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default CustomImageEditor;
