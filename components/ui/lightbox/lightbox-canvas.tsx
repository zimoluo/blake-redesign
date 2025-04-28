"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useLightbox } from "@/components/context/lightbox-context";
import { useSettings } from "@/components/context/settings-context";

// Apr 27 11:25 PM: a few things to fix: the motion translation (translating the delta x or y to the change amount of whatever property) is very janky at the moment. only rotation handle works properly and the other ones have either weird logic or such. this is a general description but you can try to fix that.
// the scale handle needs a rework. it will have eight, not four, handles. the additional four are on the middle of each sides. it will resize it with respect to the handle on the opposite end rather than from the center, unless option or alt is pressed, like how a real editor works. it will also be able to break the aspect ratio unless shift is pressed, like how a real editor works.

const HANDLE_SIZE = 10; // in "pixels"
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

const rad = (deg: number) => (deg * Math.PI) / 180;

// Transform a point through a transform matrix
const transformPoint = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  rotation: number,
  skewX: number,
  skewY: number,
  scaleX: number,
  scaleY: number
) => {
  // Translate to origin
  let nx = x - centerX;
  let ny = y - centerY;

  // Apply inverse transformations in reverse order

  // Inverse scale
  nx /= scaleX;
  ny /= scaleY;

  // Inverse skew (more complex)
  const skewXRad = rad(skewX);
  const skewYRad = rad(skewY);
  const det = 1 - Math.tan(skewXRad) * Math.tan(skewYRad);
  const tempX = nx - ny * Math.tan(skewYRad);
  const tempY = ny - nx * Math.tan(skewXRad);
  nx = tempX / det;
  ny = tempY / det;

  // Inverse rotation
  const rotRad = rad(rotation);
  const cosR = Math.cos(rotRad);
  const sinR = Math.sin(rotRad);
  const tempRX = nx * cosR + ny * sinR;
  const tempRY = ny * cosR - nx * sinR;
  nx = tempRX;
  ny = tempRY;

  // Translate back
  nx += centerX;
  ny += centerY;

  return { x: nx, y: ny };
};

// Check if point is in rectangle
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
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [editingHandle, setEditingHandle] = useState<null | {
    imgIndex: number;
    type: LightboxEditorMode;
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

  // Fix for passive wheel event
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheelEvent = (e: WheelEvent) => {
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

    canvas.addEventListener("wheel", handleWheelEvent, { passive: false });

    return () => {
      canvas.removeEventListener("wheel", handleWheelEvent);
    };
  }, [lightbox.cameraZoom, updateLightbox]);

  const worldToScreen = useCallback(
    (pos: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const { cameraCenterX, cameraCenterY, cameraZoom } = lightbox;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
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
      const rect = canvas.getBoundingClientRect();
      const { cameraCenterX, cameraCenterY, cameraZoom } = lightbox;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
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

    images.forEach((image, idx) => {
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

      // Calculate cropped dimensions
      const cropWidth = cropSecondX - cropFirstX;
      const cropHeight = cropSecondY - cropFirstY;

      // Apply crop to the image dimensions
      const croppedWidth = width * cropWidth;
      const croppedHeight = height * cropHeight;

      const pos = worldToScreen({ x, y });
      ctx.translate(pos.x * dpr, pos.y * dpr);
      ctx.rotate(rad(rotation));
      ctx.transform(1, Math.tan(rad(skewY)), Math.tan(rad(skewX)), 1, 0, 0);
      ctx.scale(scaleX * lightbox.cameraZoom, scaleY * lightbox.cameraZoom);
      ctx.globalAlpha = opacity;

      const sx = cropFirstX * imgEl.naturalWidth;
      const sy = cropFirstY * imgEl.naturalHeight;
      const sw = cropWidth * imgEl.naturalWidth;
      const sh = cropHeight * imgEl.naturalHeight;

      // Draw the image using the cropped dimensions
      ctx.drawImage(
        imgEl,
        sx,
        sy,
        sw,
        sh,
        (-croppedWidth / 2) * dpr,
        (-croppedHeight / 2) * dpr,
        croppedWidth * dpr,
        croppedHeight * dpr
      );

      if (lightbox.hasSelectedImage && lightbox.selectedImageIndex === idx) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2 / lightbox.cameraZoom;

        // Draw selection border using the cropped dimensions
        ctx.strokeRect(
          (-croppedWidth / 2) * dpr,
          (-croppedHeight / 2) * dpr,
          croppedWidth * dpr,
          croppedHeight * dpr
        );

        // Update handle positions based on cropped dimensions
        const handles = [
          { pos: "tl", x: -croppedWidth / 2, y: -croppedHeight / 2 },
          { pos: "tr", x: croppedWidth / 2, y: -croppedHeight / 2 },
          { pos: "br", x: croppedWidth / 2, y: croppedHeight / 2 },
          { pos: "bl", x: -croppedWidth / 2, y: croppedHeight / 2 },
          { pos: "t", x: 0, y: -croppedHeight / 2 },
          { pos: "r", x: croppedWidth / 2, y: 0 },
          { pos: "b", x: 0, y: croppedHeight / 2 },
          { pos: "l", x: -croppedWidth / 2, y: 0 },
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

  // Improved hit test function that accounts for transformations
  const findImageAt = (sx: number, sy: number) => {
    // Check in reverse order for proper z-ordering (top image first)
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i];
      const center = worldToScreen({ x: img.x, y: img.y });

      // Calculate cropped dimensions
      const cropWidth = img.cropSecondX - img.cropFirstX;
      const cropHeight = img.cropSecondY - img.cropFirstY;
      const croppedWidth = img.width * cropWidth;
      const croppedHeight = img.height * cropHeight;

      // Convert image dimensions to screen space
      const halfW = (croppedWidth * img.scaleX * lightbox.cameraZoom) / 2;
      const halfH = (croppedHeight * img.scaleY * lightbox.cameraZoom) / 2;

      // Convert screen point to world coordinates
      const worldPoint = screenToWorld(sx, sy);

      // Transform point to account for image transformations
      const transformedPoint = transformPoint(
        worldPoint.x,
        worldPoint.y,
        img.x,
        img.y,
        img.rotation,
        img.skewX,
        img.skewY,
        img.scaleX,
        img.scaleY
      );

      // Check if transformed point is within image bounds
      if (
        Math.abs(transformedPoint.x - img.x) <= croppedWidth / 2 &&
        Math.abs(transformedPoint.y - img.y) <= croppedHeight / 2
      ) {
        return i;
      }
    }

    return -1;
  };

  // Improved handle hit test
  const findHandleAt = (sx: number, sy: number) => {
    if (!lightbox.hasSelectedImage) return null;
    const imgIndex = lightbox.selectedImageIndex;
    const image = images[imgIndex];
    if (!image) return null;

    // Calculate cropped dimensions
    const cropWidth = image.cropSecondX - image.cropFirstX;
    const cropHeight = image.cropSecondY - image.cropFirstY;
    const croppedWidth = image.width * cropWidth;
    const croppedHeight = image.height * cropHeight;

    // Get screen position of image center
    const center = worldToScreen({ x: image.x, y: image.y });

    // Handle positions in world space (centered around image)
    const handlePositions = {
      tl: { x: -croppedWidth / 2, y: -croppedHeight / 2 },
      tr: { x: croppedWidth / 2, y: -croppedHeight / 2 },
      br: { x: croppedWidth / 2, y: croppedHeight / 2 },
      bl: { x: -croppedWidth / 2, y: croppedHeight / 2 },
      t: { x: 0, y: -croppedHeight / 2 },
      r: { x: croppedWidth / 2, y: 0 },
      b: { x: 0, y: croppedHeight / 2 },
      l: { x: -croppedWidth / 2, y: 0 },
    };

    // Convert world point to screen space
    const worldToHandleScreen = (handle: { x: number; y: number }) => {
      // Create a temporary canvas context to apply transformations
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return { x: 0, y: 0 };

      // Apply transformations in the same order as in the render function
      ctx.translate(center.x, center.y);
      ctx.rotate(rad(image.rotation));
      ctx.transform(
        1,
        Math.tan(rad(image.skewY)),
        Math.tan(rad(image.skewX)),
        1,
        0,
        0
      );
      ctx.scale(
        image.scaleX * lightbox.cameraZoom,
        image.scaleY * lightbox.cameraZoom
      );

      // Get the transformation matrix
      const matrix = ctx.getTransform();

      // Apply the matrix to the handle position
      const screenX = matrix.a * handle.x + matrix.c * handle.y + matrix.e;
      const screenY = matrix.b * handle.x + matrix.d * handle.y + matrix.f;

      return { x: screenX, y: screenY };
    };

    // Convert all handle positions to screen space
    const screenHandles: Record<string, { x: number; y: number }> = {} as any;
    Object.entries(handlePositions).forEach(([key, pos]) => {
      screenHandles[key] = worldToHandleScreen(pos);
    });

    // Check if point is within any handle's hit area
    const handleSize = HANDLE_SIZE * 1.5;

    return (
      Object.entries(screenHandles)
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
            coord.x - handleSize / 2,
            coord.y - handleSize / 2,
            handleSize,
            handleSize
          )
        )?.[0] || null
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    canvas.setPointerCapture(e.pointerId);

    // First check if we're clicking on a handle
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

    // Check if we're clicking on an image
    const hitIndex = findImageAt(sx, sy);

    if (hitIndex >= 0) {
      setSelectedImage(hitIndex);
      updateLightbox({ hasSelectedImage: true, selectedImageIndex: hitIndex });

      // If we hit an image, we might be dragging it
      setIsDraggingImage(true);
      setDragStart({ x: sx, y: sy });
    } else {
      // Otherwise, we're panning the canvas
      setSelectedImage(-1);
      updateLightbox({ hasSelectedImage: false });
      setIsPanning(true);
      setDragStart({ x: sx, y: sy });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (!isPanning && !editingHandle && !isDraggingImage)) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (!dragStart) return;

    const dx = sx - dragStart.x;
    const dy = sy - dragStart.y;

    if (isPanning) {
      updateLightbox({
        cameraCenterX: lightbox.cameraCenterX - dx / lightbox.cameraZoom,
        cameraCenterY: lightbox.cameraCenterY - dy / lightbox.cameraZoom,
      });
      setDragStart({ x: sx, y: sy });
    } else if (isDraggingImage && lightbox.hasSelectedImage) {
      // Move the image if we're dragging it
      const worldDelta = {
        x: dx / lightbox.cameraZoom,
        y: dy / lightbox.cameraZoom,
      };

      const imageIndex = lightbox.selectedImageIndex;
      const image = images[imageIndex];

      updateImage(imageIndex, {
        x: image.x + worldDelta.x,
        y: image.y + worldDelta.y,
      });

      setDragStart({ x: sx, y: sy });
    } else if (editingHandle) {
      const image = images[editingHandle.imgIndex];
      const start = screenToWorld(dragStart.x, dragStart.y);
      const current = screenToWorld(sx, sy);
      const wx = current.x - start.x;
      const wy = current.y - start.y;

      // Calculate cropped dimensions
      const cropWidth = image.cropSecondX - image.cropFirstX;
      const cropHeight = image.cropSecondY - image.cropFirstY;
      const croppedWidth = image.width * cropWidth;
      const croppedHeight = image.height * cropHeight;

      switch (editingHandle.type) {
        case "scale":
          updateImage(editingHandle.imgIndex, {
            scaleX: Math.max(0.1, image.scaleX * (1 + (wx + wy) / 200)),
            scaleY: Math.max(0.1, image.scaleY * (1 + (wx + wy) / 200)),
          });
          break;
        case "rotate":
          const centerX = image.x;
          const centerY = image.y;

          // Get angles from center to start and current points
          const startAngle = Math.atan2(start.y - centerY, start.x - centerX);
          const currentAngle = Math.atan2(
            current.y - centerY,
            current.x - centerX
          );

          // Calculate the angle difference in degrees
          const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);

          updateImage(editingHandle.imgIndex, {
            rotation: image.rotation + angleDiff,
          });
          break;
        case "skew":
          if (["l", "r"].includes(editingHandle.corner)) {
            updateImage(editingHandle.imgIndex, {
              skewY: image.skewY + wy * 0.5,
            });
          } else {
            updateImage(editingHandle.imgIndex, {
              skewX: image.skewX + wy * 0.5,
            });
          }
          break;
        case "crop":
          const cropChange = {
            x: wx / (croppedWidth * image.scaleX),
            y: wy / (croppedHeight * image.scaleY),
          };

          // Update crop values based on the corner being dragged
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const updates: any = {};

          if (editingHandle.corner === "tl") {
            updates.cropFirstX = Math.min(
              image.cropSecondX - 0.05,
              Math.max(0, image.cropFirstX + cropChange.x)
            );
            updates.cropFirstY = Math.min(
              image.cropSecondY - 0.05,
              Math.max(0, image.cropFirstY + cropChange.y)
            );
          } else if (editingHandle.corner === "tr") {
            updates.cropSecondX = Math.max(
              image.cropFirstX + 0.05,
              Math.min(1, image.cropSecondX + cropChange.x)
            );
            updates.cropFirstY = Math.min(
              image.cropSecondY - 0.05,
              Math.max(0, image.cropFirstY + cropChange.y)
            );
          } else if (editingHandle.corner === "bl") {
            updates.cropFirstX = Math.min(
              image.cropSecondX - 0.05,
              Math.max(0, image.cropFirstX + cropChange.x)
            );
            updates.cropSecondY = Math.max(
              image.cropFirstY + 0.05,
              Math.min(1, image.cropSecondY + cropChange.y)
            );
          } else if (editingHandle.corner === "br") {
            updates.cropSecondX = Math.max(
              image.cropFirstX + 0.05,
              Math.min(1, image.cropSecondX + cropChange.x)
            );
            updates.cropSecondY = Math.max(
              image.cropFirstY + 0.05,
              Math.min(1, image.cropSecondY + cropChange.y)
            );
          }

          updateImage(editingHandle.imgIndex, updates);
          break;
      }
      setDragStart({ x: sx, y: sy });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);
    setIsPanning(false);
    setIsDraggingImage(false);
    setEditingHandle(null);
    setDragStart(null);
  };

  // This is no longer used due to passive event handling issue, but kept for React's interface
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    // This function is now handled by the useEffect with non-passive wheel event
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
