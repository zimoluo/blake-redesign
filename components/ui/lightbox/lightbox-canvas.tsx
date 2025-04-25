"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLightbox } from "@/components/context/lightbox-context";
import { useSettings } from "@/components/context/settings-context";

// -------------------- Types & Constants --------------------

const HANDLE_SIZE = 10; // in px (screen–space)
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

// -------------------- Helpers --------------------

const rad = (deg: number) => (deg * Math.PI) / 180;

// hit‑test helpers -------------------------------------------------------------
const pointInRect = (
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
) => px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;

// -------------------- Main Component --------------------

/**
 * A full‑window canvas that renders and manipulates Lightbox images.
 * Uses `settings.lightboxEditorMode` to switch between Scale/Rotate/Skew/Crop tools.
 */
export default function LightboxCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const { lightbox, images, updateImage, setSelectedImage, updateLightbox } =
    useLightbox();

  const { settings } = useSettings();
  const mode = settings.lightboxEditorMode as LightboxEditorMode;

  // local interaction state ----------------------------------------------------
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [editingHandle, setEditingHandle] = useState<null | {
    imgIndex: number;
    type: "scale" | "rotate" | "skew" | "crop";
    corner: "tl" | "tr" | "br" | "bl" | "t" | "b" | "l" | "r";
  }>(null);

  // Image cache ---------------------------------------------------------------
  const imgCache = useRef<{ [src: string]: HTMLImageElement }>({});
  useEffect(() => {
    images.forEach((img) => {
      if (!imgCache.current[img.src]) {
        const image = new Image();
        image.src = img.src;
        imgCache.current[img.src] = image;
      }
    });
  }, [images]);

  // Resize canvas to parent ----------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const resizeObserver = new ResizeObserver(() => {
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      render();
    });

    resizeObserver.observe(wrapper);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // World<->Screen transforms --------------------------------------------------
  const worldToScreen = useCallback(
    (wx: number, wy: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const { cameraCenterX, cameraCenterY, cameraZoom } = lightbox;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      return {
        x: (wx - cameraCenterX) * cameraZoom + cx,
        y: (wy - cameraCenterY) * cameraZoom + cy,
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

  // -------------------- Rendering --------------------

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // draw dot grid unless disabled -----------------------------------------
    if (!lightbox.disableDotGrid) {
      drawDotGrid(ctx, canvas, lightbox);
    }

    // sort images by order/layer ---------------------------------------------
    const sorted = [...images].sort(
      (a, b) => a.layer - b.layer || a.order - b.order
    );

    sorted.forEach((img, idx) => {
      const imageEl = imgCache.current[img.src];
      if (!imageEl || !imageEl.complete) return;

      ctx.save();

      // move to image center in screen space ---------------------------------
      const screenPos = worldToScreen(img.x, img.y);
      ctx.translate(screenPos.x * dpr, screenPos.y * dpr);
      ctx.rotate(rad(img.rotation));
      ctx.transform(
        1,
        Math.tan(rad(img.skewY)),
        Math.tan(rad(img.skewX)),
        1,
        0,
        0
      );
      ctx.scale(
        img.scaleX * lightbox.cameraZoom,
        img.scaleY * lightbox.cameraZoom
      );
      ctx.globalAlpha = img.opacity;

      const drawW = img.width;
      const drawH = img.height;

      // cropping -------------------------------------------------------------
      const sx = img.cropFirstX * imageEl.naturalWidth;
      const sy = img.cropFirstY * imageEl.naturalHeight;
      const sWidth = (img.cropSecondX - img.cropFirstX) * imageEl.naturalWidth;
      const sHeight =
        (img.cropSecondY - img.cropFirstY) * imageEl.naturalHeight;

      ctx.drawImage(
        imageEl,
        sx,
        sy,
        sWidth,
        sHeight,
        (-drawW / 2) * dpr,
        (-drawH / 2) * dpr,
        drawW * dpr,
        drawH * dpr
      );

      // selection outline & handles -----------------------------------------
      if (lightbox.hasSelectedImage && lightbox.selectedImageIndex === idx) {
        ctx.strokeStyle = "#3b82f6"; // blue‑500
        ctx.lineWidth = 2 / lightbox.cameraZoom;
        ctx.strokeRect(
          (-drawW / 2) * dpr,
          (-drawH / 2) * dpr,
          drawW * dpr,
          drawH * dpr
        );

        // handles -----------------------------------------------------------
        const handlePositions: [number, number, string][] = [
          [-drawW / 2, -drawH / 2, "tl"],
          [drawW / 2, -drawH / 2, "tr"],
          [drawW / 2, drawH / 2, "br"],
          [-drawW / 2, drawH / 2, "bl"],
          [0, -drawH / 2, "t"],
          [drawW / 2, 0, "r"],
          [0, drawH / 2, "b"],
          [-drawW / 2, 0, "l"],
        ];

        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#3b82f6";
        handlePositions.forEach(([hx, hy, pos]) => {
          if (
            (mode === "scale" && ["tl", "tr", "br", "bl"].includes(pos)) ||
            (mode === "rotate" && pos === "t") ||
            (mode === "skew" && ["t", "b", "l", "r"].includes(pos)) ||
            (mode === "crop" && ["tl", "tr", "br", "bl"].includes(pos))
          ) {
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

    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, lightbox, mode]);

  // re‑render when dependencies change ---------------------------------------
  useEffect(() => {
    render();
  }, [render]);

  // -------------------- Pointer Events --------------------

  const findHandleAt = (sx: number, sy: number) => {
    const { hasSelectedImage, selectedImageIndex } = lightbox;
    if (!hasSelectedImage) return null;
    const img = images[selectedImageIndex];
    if (!img) return null;

    // work in screen space ---------------------------------------------------
    const screenPos = worldToScreen(img.x, img.y);
    const corners = {
      tl: {
        x: screenPos.x - (img.width * img.scaleX * lightbox.cameraZoom) / 2,
        y: screenPos.y - (img.height * img.scaleY * lightbox.cameraZoom) / 2,
      },
      tr: {
        x: screenPos.x + (img.width * img.scaleX * lightbox.cameraZoom) / 2,
        y: screenPos.y - (img.height * img.scaleY * lightbox.cameraZoom) / 2,
      },
      br: {
        x: screenPos.x + (img.width * img.scaleX * lightbox.cameraZoom) / 2,
        y: screenPos.y + (img.height * img.scaleY * lightbox.cameraZoom) / 2,
      },
      bl: {
        x: screenPos.x - (img.width * img.scaleX * lightbox.cameraZoom) / 2,
        y: screenPos.y + (img.height * img.scaleY * lightbox.cameraZoom) / 2,
      },
      t: {
        x: screenPos.x,
        y: screenPos.y - (img.height * img.scaleY * lightbox.cameraZoom) / 2,
      },
      b: {
        x: screenPos.x,
        y: screenPos.y + (img.height * img.scaleY * lightbox.cameraZoom) / 2,
      },
      l: {
        x: screenPos.x - (img.width * img.scaleX * lightbox.cameraZoom) / 2,
        y: screenPos.y,
      },
      r: {
        x: screenPos.x + (img.width * img.scaleX * lightbox.cameraZoom) / 2,
        y: screenPos.y,
      },
    } as const;

    const activePositions = Object.entries(corners).filter(([pos]) => {
      return (
        (mode === "scale" && ["tl", "tr", "br", "bl"].includes(pos)) ||
        (mode === "rotate" && pos === "t") ||
        (mode === "skew" && ["t", "b", "l", "r"].includes(pos)) ||
        (mode === "crop" && ["tl", "tr", "br", "bl"].includes(pos))
      );
    });

    for (const [pos, coord] of activePositions) {
      if (
        pointInRect(
          sx,
          sy,
          coord.x - HANDLE_SIZE / 2,
          coord.y - HANDLE_SIZE / 2,
          HANDLE_SIZE,
          HANDLE_SIZE
        )
      ) {
        return pos as typeof pos;
      }
    }
    return null;
  };

  const drawDotGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    lightbox: LightboxData
  ) => {
    const dpr = window.devicePixelRatio || 1;
    const gridSize = 20; // grid spacing in *world* units

    // Compute the world-space bounds that are currently visible
    const halfW = canvas.width / (2 * lightbox.cameraZoom);
    const halfH = canvas.height / (2 * lightbox.cameraZoom);
    const minX = lightbox.cameraCenterX - halfW;
    const maxX = lightbox.cameraCenterX + halfW;
    const minY = lightbox.cameraCenterY - halfH;
    const maxY = lightbox.cameraCenterY + halfH;

    // Snap the first dot to the nearest grid intersection
    const startX = Math.floor(minX / gridSize) * gridSize;
    const startY = Math.floor(minY / gridSize) * gridSize;

    ctx.fillStyle = "#ccc";

    for (let x = startX; x <= maxX; x += gridSize) {
      for (let y = startY; y <= maxY; y += gridSize) {
        const { x: sx, y: sy } = worldToScreen(x, y); // convert to screen space
        ctx.beginPath();
        ctx.arc(sx * dpr, sy * dpr, 1 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const sx = e.clientX * (window.devicePixelRatio || 1);
    const sy = e.clientY * (window.devicePixelRatio || 1);

    // try handles first ------------------------------------------------------
    const handlePos = findHandleAt(sx, sy);
    if (handlePos) {
      setEditingHandle({
        imgIndex: lightbox.selectedImageIndex,
        type: mode,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        corner: handlePos as any,
      });
      setDragStart({ x: sx, y: sy });
      return;
    }

    // hit‑test images --------------------------------------------------------
    const hitIndex = [...images].reverse().findIndex((img) => {
      const screenCenter = worldToScreen(img.x, img.y);
      const halfW = (img.width * img.scaleX * lightbox.cameraZoom) / 2;
      const halfH = (img.height * img.scaleY * lightbox.cameraZoom) / 2;
      return pointInRect(
        sx,
        sy,
        screenCenter.x - halfW,
        screenCenter.y - halfH,
        halfW * 2,
        halfH * 2
      );
    });

    if (hitIndex >= 0) {
      // account for reversed array
      const idx = images.length - 1 - hitIndex;
      setSelectedImage(idx);
      updateLightbox({ hasSelectedImage: true });
    } else {
      setSelectedImage(-1);
      updateLightbox({ hasSelectedImage: false });
      // start panning -------------------------------------------------------
      setIsPanning(true);
      setDragStart({ x: sx, y: sy });
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (!isPanning && !editingHandle)) return;

    const sx = e.clientX * (window.devicePixelRatio || 1);
    const sy = e.clientY * (window.devicePixelRatio || 1);

    if (dragStart) {
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
        const img = images[editingHandle.imgIndex];
        if (!img) return;
        const worldStart = screenToWorld(dragStart.x, dragStart.y);
        const worldCurrent = screenToWorld(sx, sy);

        const wx = worldCurrent.x - worldStart.x;
        const wy = worldCurrent.y - worldStart.y;

        switch (editingHandle.type) {
          case "scale": {
            const scaleFactor = 1 + (wx + wy) / 200; // heuristic scaling speed
            updateImage(editingHandle.imgIndex, {
              scaleX: Math.max(0.1, img.scaleX * scaleFactor),
              scaleY: Math.max(0.1, img.scaleY * scaleFactor),
            });
            break;
          }
          case "rotate": {
            const angle = (Math.atan2(wy, wx) * 180) / Math.PI;
            updateImage(editingHandle.imgIndex, {
              rotation: img.rotation + angle,
            });
            break;
          }
          case "skew": {
            const skewFactor = wy;
            if (["l", "r"].includes(editingHandle.corner)) {
              updateImage(editingHandle.imgIndex, {
                skewY: img.skewY + skewFactor,
              });
            } else {
              updateImage(editingHandle.imgIndex, {
                skewX: img.skewX + skewFactor,
              });
            }
            break;
          }
          case "crop": {
            // naive crop: adjust second corner proportionally
            const newCrop = {
              cropSecondX: Math.min(
                1,
                Math.max(0, img.cropSecondX + wx / img.width)
              ),
              cropSecondY: Math.min(
                1,
                Math.max(0, img.cropSecondY + wy / img.height)
              ),
            } as Partial<LightboxImage>;
            updateImage(editingHandle.imgIndex, newCrop);
            break;
          }
        }
        setDragStart({ x: sx, y: sy });
      }
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.releasePointerCapture(e.pointerId);
    setIsPanning(false);
    setEditingHandle(null);
    setDragStart(null);
  };

  // zoom with wheel -----------------------------------------------------------
  const onWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { deltaY } = e;
    const direction = deltaY > 0 ? -1 : 1;
    const factor = 1 + 0.1 * direction;
    const newZoom = Math.max(
      MIN_ZOOM,
      Math.min(MAX_ZOOM, lightbox.cameraZoom * factor)
    );
    updateLightbox({ cameraZoom: newZoom });
  };

  // -------------------- JSX --------------------
  return (
    <div
      ref={wrapperRef}
      className="relative w-full h-full touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
    </div>
  );
}
