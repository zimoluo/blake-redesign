"use client";

import { useEffect, useRef, useState, MouseEvent, TouchEvent } from "react";
import { useLightbox } from "@/components/context/lightbox-context";
import { useSettings } from "@/components/context/settings-context";

type HandleType = "scale" | "rotate" | "skew" | "crop" | "move";

export default function LightboxCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lightbox, images, updateLightbox, updateImage } = useLightbox();
  const { settings } = useSettings();

  // State for drag interactions
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [initialTransform, setInitialTransform] = useState<{
    x?: number;
    y?: number;
    scaleX?: number;
    scaleY?: number;
    rotation?: number;
    skewX?: number;
    skewY?: number;
    cropFirstX?: number;
    cropFirstY?: number;
    cropSecondX?: number;
    cropSecondY?: number;
  }>({});

  // Render the canvas content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to match parent dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(lightbox.cameraZoom, lightbox.cameraZoom);
    ctx.translate(-lightbox.cameraCenterX, -lightbox.cameraCenterY);

    // Draw dot grid if enabled
    if (!lightbox.disableDotGrid) {
      drawDotGrid(ctx, canvas, lightbox);
    }

    // Sort images by order and layer for rendering
    const sortedImages = [...images].sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      return a.order - b.order;
    });

    // Draw all images
    sortedImages.forEach((image, index) => {
      drawImage(ctx, image);

      // Draw edit handles if this image is selected
      if (lightbox.hasSelectedImage && index === lightbox.selectedImageIndex) {
        drawHandles(ctx, image, settings.lightboxEditorMode);
      }
    });

    ctx.restore();
  }, [lightbox, images, settings.lightboxEditorMode]);

  // Handle mouse/touch interactions
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    setStartX(mouseX);
    setStartY(mouseY);

    // Convert to world coordinates
    const worldX =
      (mouseX - canvas.width / 2) / lightbox.cameraZoom +
      lightbox.cameraCenterX;
    const worldY =
      (mouseY - canvas.height / 2) / lightbox.cameraZoom +
      lightbox.cameraCenterY;

    // Check if clicking on a handle (if an image is selected)
    if (lightbox.hasSelectedImage) {
      const selectedImage = images[lightbox.selectedImageIndex];
      const handle = getHandleAtPosition(
        worldX,
        worldY,
        selectedImage,
        settings.lightboxEditorMode
      );

      if (handle) {
        setActiveHandle(handle);
        setIsDragging(true);
        setInitialTransform({
          x: selectedImage.x,
          y: selectedImage.y,
          scaleX: selectedImage.scaleX,
          scaleY: selectedImage.scaleY,
          rotation: selectedImage.rotation,
          skewX: selectedImage.skewX,
          skewY: selectedImage.skewY,
          cropFirstX: selectedImage.cropFirstX,
          cropFirstY: selectedImage.cropFirstY,
          cropSecondX: selectedImage.cropSecondX,
          cropSecondY: selectedImage.cropSecondY,
        });
        return;
      }

      // Check if clicking on selected image for move
      if (isPointInsideImage(worldX, worldY, selectedImage)) {
        setActiveHandle("move");
        setIsDragging(true);
        setInitialTransform({
          x: selectedImage.x,
          y: selectedImage.y,
        });
        return;
      }
    }

    // Check if clicking on any image to select it
    for (let i = images.length - 1; i >= 0; i--) {
      if (isPointInsideImage(worldX, worldY, images[i])) {
        updateLightbox({
          hasSelectedImage: true,
          selectedImageIndex: i,
        });
        setActiveHandle("move");
        setIsDragging(true);
        setInitialTransform({
          x: images[i].x,
          y: images[i].y,
        });
        return;
      }
    }

    // If no image was clicked, start panning
    setIsPanning(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging && !isPanning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const deltaX = (mouseX - startX) / lightbox.cameraZoom;
    const deltaY = (mouseY - startY) / lightbox.cameraZoom;

    if (isPanning) {
      // Handle camera panning
      updateLightbox({
        cameraCenterX: lightbox.cameraCenterX - deltaX,
        cameraCenterY: lightbox.cameraCenterY - deltaY,
      });
      setStartX(mouseX);
      setStartY(mouseY);
      return;
    }

    if (isDragging && lightbox.hasSelectedImage && activeHandle) {
      const selectedImage = images[lightbox.selectedImageIndex];
      const centerX = initialTransform.x || selectedImage.x;
      const centerY = initialTransform.y || selectedImage.y;

      // Handle various editing operations
      switch (activeHandle) {
        case "move":
          updateImage(lightbox.selectedImageIndex, {
            x: centerX + deltaX,
            y: centerY + deltaY,
          });
          break;

        case "scale":
          if (settings.lightboxEditorMode === "scale") {
            const initialScaleX =
              initialTransform.scaleX || selectedImage.scaleX;
            const initialScaleY =
              initialTransform.scaleY || selectedImage.scaleY;
            const scaleFactor = 1 + deltaX / 100; // Adjust sensitivity as needed

            updateImage(lightbox.selectedImageIndex, {
              scaleX: initialScaleX * scaleFactor,
              scaleY: initialScaleY * scaleFactor,
            });
          }
          break;

        case "rotate":
          if (settings.lightboxEditorMode === "rotate") {
            // Calculate angle based on mouse position relative to image center
            const initialRotation =
              initialTransform.rotation || selectedImage.rotation;
            const worldX =
              (mouseX - canvas.width / 2) / lightbox.cameraZoom +
              lightbox.cameraCenterX;
            const worldY =
              (mouseY - canvas.height / 2) / lightbox.cameraZoom +
              lightbox.cameraCenterY;

            const angle =
              Math.atan2(worldY - selectedImage.y, worldX - selectedImage.x) *
              (180 / Math.PI);
            const startAngle =
              Math.atan2(
                (startY - canvas.height / 2) / lightbox.cameraZoom +
                  lightbox.cameraCenterY -
                  selectedImage.y,
                (startX - canvas.width / 2) / lightbox.cameraZoom +
                  lightbox.cameraCenterX -
                  selectedImage.x
              ) *
              (180 / Math.PI);

            const rotationDelta = angle - startAngle;
            updateImage(lightbox.selectedImageIndex, {
              rotation: initialRotation + rotationDelta,
            });
          }
          break;

        case "skew":
          if (settings.lightboxEditorMode === "skew") {
            const initialSkewX = initialTransform.skewX || selectedImage.skewX;
            const initialSkewY = initialTransform.skewY || selectedImage.skewY;

            updateImage(lightbox.selectedImageIndex, {
              skewX: initialSkewX + deltaX / 5,
              skewY: initialSkewY + deltaY / 5,
            });
          }
          break;

        case "crop":
          if (settings.lightboxEditorMode === "crop") {
            // Determine which crop handle is being dragged and update accordingly
            // For simplicity, this example adjusts cropSecondX/Y
            const initialCropSecondX =
              initialTransform.cropSecondX || selectedImage.cropSecondX;
            const initialCropSecondY =
              initialTransform.cropSecondY || selectedImage.cropSecondY;

            // Convert delta to proportion of image size
            const deltaXProp = deltaX / selectedImage.width;
            const deltaYProp = deltaY / selectedImage.height;

            updateImage(lightbox.selectedImageIndex, {
              cropSecondX: Math.min(
                Math.max(initialCropSecondX + deltaXProp, 0),
                1
              ),
              cropSecondY: Math.min(
                Math.max(initialCropSecondY + deltaYProp, 0),
                1
              ),
            });
          }
          break;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
    setActiveHandle(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1; // Zoom in or out

    updateLightbox({
      cameraZoom: lightbox.cameraZoom * zoomFactor,
    });
  };

  // Utility functions for rendering
  const drawDotGrid = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lightbox: any
  ) => {
    const gridSize = 20; // Size of grid cells in world space

    // Calculate visible grid area
    const startX =
      lightbox.cameraCenterX - canvas.width / 2 / lightbox.cameraZoom;
    const startY =
      lightbox.cameraCenterY - canvas.height / 2 / lightbox.cameraZoom;
    const endX =
      lightbox.cameraCenterX + canvas.width / 2 / lightbox.cameraZoom;
    const endY =
      lightbox.cameraCenterY + canvas.height / 2 / lightbox.cameraZoom;

    // Round to nearest grid cell
    const gridStartX = Math.floor(startX / gridSize) * gridSize;
    const gridStartY = Math.floor(startY / gridSize) * gridSize;

    ctx.fillStyle = "#ccc";

    for (let x = gridStartX; x <= endX; x += gridSize) {
      for (let y = gridStartY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const drawImage = (ctx: CanvasRenderingContext2D, image: any) => {
    if (!image) return;

    // Create a placeholder image for demonstration
    // In a real implementation, load the actual image from image.src
    const img = new Image();
    img.src = image.src;

    ctx.save();

    // Apply transformations
    ctx.translate(image.x, image.y);
    ctx.rotate((image.rotation * Math.PI) / 180);
    ctx.scale(image.scaleX, image.scaleY);

    // Apply skew
    if (image.skewX || image.skewY) {
      const skewRadX = (image.skewX * Math.PI) / 180;
      const skewRadY = (image.skewY * Math.PI) / 180;
      ctx.transform(1, Math.tan(skewRadY), Math.tan(skewRadX), 1, 0, 0);
    }

    // Apply crop if needed
    const cropX = image.cropFirstX * image.width;
    const cropY = image.cropFirstY * image.height;
    const cropWidth = (image.cropSecondX - image.cropFirstX) * image.width;
    const cropHeight = (image.cropSecondY - image.cropFirstY) * image.height;

    // Set opacity
    ctx.globalAlpha = image.opacity;

    // Draw the image (centered)
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      -image.width / 2,
      -image.height / 2,
      image.width,
      image.height
    );

    ctx.restore();
  };

  const drawHandles = (
    ctx: CanvasRenderingContext2D,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: any,
    mode: string
  ) => {
    ctx.save();

    // Position at image center
    ctx.translate(image.x, image.y);
    ctx.rotate((image.rotation * Math.PI) / 180);

    // Draw bounding box
    ctx.strokeStyle = "#007bff";
    ctx.lineWidth = 2 / lightbox.cameraZoom;
    const width = image.width * image.scaleX;
    const height = image.height * image.scaleY;

    ctx.strokeRect(-width / 2, -height / 2, width, height);

    // Draw handles based on mode
    ctx.fillStyle = "#007bff";

    switch (mode) {
      case "scale":
        // Draw corner handles for scaling
        drawHandle(ctx, width / 2, height / 2);
        drawHandle(ctx, -width / 2, height / 2);
        drawHandle(ctx, width / 2, -height / 2);
        drawHandle(ctx, -width / 2, -height / 2);
        break;

      case "rotate":
        // Draw rotation handle
        drawHandle(ctx, 0, -height / 2 - 20);
        // Draw line to rotation handle
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, -height / 2 - 20);
        ctx.stroke();
        break;

      case "skew":
        // Draw skew handles
        drawHandle(ctx, width / 2, 0);
        drawHandle(ctx, -width / 2, 0);
        drawHandle(ctx, 0, height / 2);
        drawHandle(ctx, 0, -height / 2);
        break;

      case "crop":
        // Draw crop handles at corners
        const cropX1 = -width / 2 + image.cropFirstX * width;
        const cropY1 = -height / 2 + image.cropFirstY * height;
        const cropX2 = -width / 2 + image.cropSecondX * width;
        const cropY2 = -height / 2 + image.cropSecondY * height;

        // Draw crop rectangle
        ctx.strokeStyle = "#ff0000";
        ctx.strokeRect(cropX1, cropY1, cropX2 - cropX1, cropY2 - cropY1);

        // Draw crop handles
        drawHandle(ctx, cropX1, cropY1);
        drawHandle(ctx, cropX2, cropY1);
        drawHandle(ctx, cropX1, cropY2);
        drawHandle(ctx, cropX2, cropY2);
        break;
    }

    ctx.restore();
  };

  const drawHandle = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const handleSize = 8 / lightbox.cameraZoom;
    ctx.fillRect(
      x - handleSize / 2,
      y - handleSize / 2,
      handleSize,
      handleSize
    );
  };

  const getHandleAtPosition = (
    x: number,
    y: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: any,
    mode: string
  ): HandleType | null => {
    // Transform point to image's local space
    const dx = x - image.x;
    const dy = y - image.y;

    // Rotate point to match image rotation
    const rotRad = (-image.rotation * Math.PI) / 180;
    const rotatedX = dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
    const rotatedY = dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

    const width = image.width * image.scaleX;
    const height = image.height * image.scaleY;
    const handleSize = 10 / lightbox.cameraZoom;

    // Check if cursor is over a handle based on mode
    switch (mode) {
      case "scale":
        // Corner handles
        if (
          isPointNearPoint(
            rotatedX,
            rotatedY,
            width / 2,
            height / 2,
            handleSize
          ) ||
          isPointNearPoint(
            rotatedX,
            rotatedY,
            -width / 2,
            height / 2,
            handleSize
          ) ||
          isPointNearPoint(
            rotatedX,
            rotatedY,
            width / 2,
            -height / 2,
            handleSize
          ) ||
          isPointNearPoint(
            rotatedX,
            rotatedY,
            -width / 2,
            -height / 2,
            handleSize
          )
        ) {
          return "scale";
        }
        break;

      case "rotate":
        // Rotation handle
        if (
          isPointNearPoint(rotatedX, rotatedY, 0, -height / 2 - 20, handleSize)
        ) {
          return "rotate";
        }
        break;

      case "skew":
        // Skew handles
        if (
          isPointNearPoint(rotatedX, rotatedY, width / 2, 0, handleSize) ||
          isPointNearPoint(rotatedX, rotatedY, -width / 2, 0, handleSize) ||
          isPointNearPoint(rotatedX, rotatedY, 0, height / 2, handleSize) ||
          isPointNearPoint(rotatedX, rotatedY, 0, -height / 2, handleSize)
        ) {
          return "skew";
        }
        break;

      case "crop":
        // Crop handles
        const cropX1 = -width / 2 + image.cropFirstX * width;
        const cropY1 = -height / 2 + image.cropFirstY * height;
        const cropX2 = -width / 2 + image.cropSecondX * width;
        const cropY2 = -height / 2 + image.cropSecondY * height;

        if (
          isPointNearPoint(rotatedX, rotatedY, cropX1, cropY1, handleSize) ||
          isPointNearPoint(rotatedX, rotatedY, cropX2, cropY1, handleSize) ||
          isPointNearPoint(rotatedX, rotatedY, cropX1, cropY2, handleSize) ||
          isPointNearPoint(rotatedX, rotatedY, cropX2, cropY2, handleSize)
        ) {
          return "crop";
        }
        break;
    }

    return null;
  };

  const isPointNearPoint = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    threshold: number
  ) => {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy) <= threshold;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isPointInsideImage = (x: number, y: number, image: any) => {
    // Transform point to image's local space
    const dx = x - image.x;
    const dy = y - image.y;

    // Rotate point to match image rotation
    const rotRad = (-image.rotation * Math.PI) / 180;
    const rotatedX = dx * Math.cos(rotRad) - dy * Math.sin(rotRad);
    const rotatedY = dx * Math.sin(rotRad) + dy * Math.cos(rotRad);

    const width = image.width * image.scaleX;
    const height = image.height * image.scaleY;

    // Check if point is inside rectangle
    return (
      rotatedX >= -width / 2 &&
      rotatedX <= width / 2 &&
      rotatedY >= -height / 2 &&
      rotatedY <= height / 2
    );
  };

  // Touch event handlers (simplified versions of mouse handlers)
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent<HTMLCanvasElement>;
      handleMouseDown(simulatedEvent);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent<HTMLCanvasElement>;
      handleMouseMove(simulatedEvent);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "none" }}
    />
  );
}
