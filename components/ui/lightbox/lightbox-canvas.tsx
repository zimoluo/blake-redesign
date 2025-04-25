"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLightbox } from "@/components/context/lightbox-context";
import { useSettings } from "@/components/context/settings-context";

const HANDLE_SIZE = 10; // in "pixels"
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

const rad = (deg: number) => (deg * Math.PI) / 180;
const pointInRect = (
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
) => px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;

/**
 * Renders and manages interactions for Lightbox images on a full-window canvas.
 */
export default function LightboxCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { lightbox, images, updateImage, setSelectedImage, updateLightbox } =
    useLightbox();
  const { settings } = useSettings();
  const mode = settings.lightboxEditorMode as LightboxEditorMode;

  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [editingHandle, setEditingHandle] = useState<null | {
    imgIndex: number;
    type: "scale" | "rotate" | "skew" | "crop";
    corner: "tl" | "tr" | "br" | "bl" | "t" | "b" | "l" | "r";
  }>(null);

  const imgCache = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    images.forEach(({ src }) => {
      if (!imgCache.current[src]) {
        const img = new Image();
        img.src = src;
        imgCache.current[src] = img;
      }
    });
  }, [images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const observer = new ResizeObserver(() => {
      const { width, height } = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      render();
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  const worldToScreen = useCallback(
    (pos: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const { cameraCenterX, cameraCenterY, cameraZoom } = lightbox;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: (pos.x - cameraCenterX) * cameraZoom + cx,
        y: (pos.y - cameraCenterY) * cameraZoom + cy,
      };
    },
    [lightbox]
  );

  const screenToWorld = useCallback(
    (sx: number, sy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const { cameraCenterX, cameraCenterY, cameraZoom } = lightbox;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: (sx - cx) / cameraZoom + cameraCenterX,
        y: (sy - cy) / cameraZoom + cameraCenterY,
      };
    },
    [lightbox]
  );

  // Draws a dot grid in world‐space units
  const drawDotGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    const { cameraCenterX, cameraCenterY, cameraZoom } = lightbox;
    const dpr = window.devicePixelRatio || 1;
    const gridSize = 20;
    const halfW = canvas.width / (2 * cameraZoom);
    const halfH = canvas.height / (2 * cameraZoom);
    const startX = Math.floor((cameraCenterX - halfW) / gridSize) * gridSize;
    const startY = Math.floor((cameraCenterY - halfH) / gridSize) * gridSize;

    ctx.fillStyle = "#ccc";
    for (let x = startX; x <= cameraCenterX + halfW; x += gridSize) {
      for (let y = startY; y <= cameraCenterY + halfH; y += gridSize) {
        const { x: sx, y: sy } = worldToScreen({ x, y });
        ctx.beginPath();
        ctx.arc(sx * dpr, sy * dpr, 1 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!lightbox.disableDotGrid) drawDotGrid(ctx, canvas);

    const sorted = [...images].sort(
      (a, b) => a.layer - b.layer || a.order - b.order
    );

    sorted.forEach((image, idx) => {
      const imgEl = imgCache.current[image.src];
      if (!imgEl?.complete) return;

      ctx.save();
      const {
        x,
        y,
        rotation,
        skewX,
        skewY,
        scaleX,
        scaleY,
        opacity,
        width,
        height,
        cropFirstX,
        cropFirstY,
        cropSecondX,
        cropSecondY,
      } = image;

      const pos = worldToScreen({ x, y });
      ctx.translate(pos.x * dpr, pos.y * dpr);
      ctx.rotate(rad(rotation));
      ctx.transform(1, Math.tan(rad(skewY)), Math.tan(rad(skewX)), 1, 0, 0);
      ctx.scale(scaleX * lightbox.cameraZoom, scaleY * lightbox.cameraZoom);
      ctx.globalAlpha = opacity;

      const sx = cropFirstX * imgEl.naturalWidth;
      const sy = cropFirstY * imgEl.naturalHeight;
      const sw = (cropSecondX - cropFirstX) * imgEl.naturalWidth;
      const sh = (cropSecondY - cropFirstY) * imgEl.naturalHeight;

      ctx.drawImage(
        imgEl,
        sx,
        sy,
        sw,
        sh,
        (-width / 2) * dpr,
        (-height / 2) * dpr,
        width * dpr,
        height * dpr
      );

      if (lightbox.hasSelectedImage && lightbox.selectedImageIndex === idx) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2 / lightbox.cameraZoom;
        ctx.strokeRect(
          (-width / 2) * dpr,
          (-height / 2) * dpr,
          width * dpr,
          height * dpr
        );

        const handles = [
          { pos: "tl", x: -width / 2, y: -height / 2 },
          { pos: "tr", x: width / 2, y: -height / 2 },
          { pos: "br", x: width / 2, y: height / 2 },
          { pos: "bl", x: -width / 2, y: height / 2 },
          { pos: "t", x: 0, y: -height / 2 },
          { pos: "r", x: width / 2, y: 0 },
          { pos: "b", x: 0, y: height / 2 },
          { pos: "l", x: -width / 2, y: 0 },
        ];
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#3b82f6";

        handles.forEach(({ pos, x: hx, y: hy }) => {
          const visible =
            (mode === "scale" && ["tl", "tr", "br", "bl"].includes(pos)) ||
            (mode === "rotate" && pos === "t") ||
            (mode === "skew" && ["t", "b", "l", "r"].includes(pos)) ||
            (mode === "crop" && ["tl", "tr", "br", "bl"].includes(pos));
          if (visible) {
            ctx.beginPath();
            ctx.rect(
              (hx - HANDLE_SIZE / 2) * dpr,
              (hy - HANDLE_SIZE / 2) * dpr,
              HANDLE_SIZE * dpr,
              HANDLE_SIZE * dpr
            );
            ctx.fill();
            ctx.stroke();
          }
        });
      }

      ctx.restore();
    });
  }, [images, lightbox, mode, worldToScreen]);

  useEffect(() => {
    render();
  }, [render]);

  const findHandleAt = (sx: number, sy: number) => {
    if (!lightbox.hasSelectedImage) return null;
    const image = images[lightbox.selectedImageIndex];
    if (!image) return null;

    const center = worldToScreen({ x: image.x, y: image.y });
    const halfW = (image.width * image.scaleX * lightbox.cameraZoom) / 2;
    const halfH = (image.height * image.scaleY * lightbox.cameraZoom) / 2;

    const corners: Record<string, { x: number; y: number }> = {
      tl: { x: center.x - halfW, y: center.y - halfH },
      tr: { x: center.x + halfW, y: center.y - halfH },
      br: { x: center.x + halfW, y: center.y + halfH },
      bl: { x: center.x - halfW, y: center.y + halfH },
      t: { x: center.x, y: center.y - halfH },
      r: { x: center.x + halfW, y: center.y },
      b: { x: center.x, y: center.y + halfH },
      l: { x: center.x - halfW, y: center.y },
    };

    return (
      Object.entries(corners)
        .filter(
          ([pos]) =>
            (mode === "scale" && ["tl", "tr", "br", "bl"].includes(pos)) ||
            (mode === "rotate" && pos === "t") ||
            (mode === "skew" && ["t", "b", "l", "r"].includes(pos)) ||
            (mode === "crop" && ["tl", "tr", "br", "bl"].includes(pos))
        )
        .find(([, coord]) =>
          pointInRect(
            sx,
            sy,
            coord.x - HANDLE_SIZE / 2,
            coord.y - HANDLE_SIZE / 2,
            HANDLE_SIZE,
            HANDLE_SIZE
          )
        )?.[0] || null
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const sx = e.clientX * dpr;
    const sy = e.clientY * dpr;
    canvas.setPointerCapture(e.pointerId);

    const handlePos = findHandleAt(sx, sy) as
      | "tl"
      | "tr"
      | "br"
      | "bl"
      | "t"
      | "r"
      | "b"
      | "l"
      | null;
    if (handlePos) {
      setEditingHandle({
        imgIndex: lightbox.selectedImageIndex,
        type: mode,
        corner: handlePos,
      });
      setDragStart({ x: sx, y: sy });
      return;
    }

    const hit = [...images].reverse().findIndex((img) => {
      const center = worldToScreen({ x: img.x, y: img.y });
      const w2 = (img.width * img.scaleX * lightbox.cameraZoom) / 2;
      const h2 = (img.height * img.scaleY * lightbox.cameraZoom) / 2;
      return pointInRect(sx, sy, center.x - w2, center.y - h2, w2 * 2, h2 * 2);
    });

    if (hit >= 0) {
      const idx = images.length - 1 - hit;
      setSelectedImage(idx);
      updateLightbox({ hasSelectedImage: true });
    } else {
      setSelectedImage(-1);
      updateLightbox({ hasSelectedImage: false });
      setIsPanning(true);
      setDragStart({ x: sx, y: sy });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || (!isPanning && !editingHandle)) return;
    const dpr = window.devicePixelRatio || 1;
    const sx = e.clientX * dpr;
    const sy = e.clientY * dpr;
    if (!dragStart) return;

    const dx = sx - dragStart.x;
    const dy = sy - dragStart.y;

    if (isPanning) {
      updateLightbox({
        cameraCenterX: lightbox.cameraCenterX - dx / lightbox.cameraZoom,
        cameraCenterY: lightbox.cameraCenterY - dy / lightbox.cameraZoom,
      });
      setDragStart({ x: sx, y: sy });
    }

    if (editingHandle) {
      const image = images[editingHandle.imgIndex];
      const start = screenToWorld(dragStart.x, dragStart.y);
      const current = screenToWorld(sx, sy);
      const wx = current.x - start.x;
      const wy = current.y - start.y;

      switch (editingHandle.type) {
        case "scale":
          updateImage(editingHandle.imgIndex, {
            scaleX: Math.max(0.1, image.scaleX * (1 + (wx + wy) / 200)),
            scaleY: Math.max(0.1, image.scaleY * (1 + (wx + wy) / 200)),
          });
          break;
        case "rotate":
          updateImage(editingHandle.imgIndex, {
            rotation: image.rotation + (Math.atan2(wy, wx) * 180) / Math.PI,
          });
          break;
        case "skew":
          if (["l", "r"].includes(editingHandle.corner)) {
            updateImage(editingHandle.imgIndex, {
              skewY: image.skewY + wy,
            });
          } else {
            updateImage(editingHandle.imgIndex, {
              skewX: image.skewX + wy,
            });
          }
          break;
        case "crop":
          updateImage(editingHandle.imgIndex, {
            cropSecondX: Math.min(
              1,
              Math.max(0, image.cropSecondX + wx / image.width)
            ),
            cropSecondY: Math.min(
              1,
              Math.max(0, image.cropSecondY + wy / image.height)
            ),
          });
          break;
      }
      setDragStart({ x: sx, y: sy });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);
    setIsPanning(false);
    setEditingHandle(null);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    const factor = 1 + 0.1 * direction;
    updateLightbox({
      cameraZoom: Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, lightbox.cameraZoom * factor)
      ),
    });
  };

  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
