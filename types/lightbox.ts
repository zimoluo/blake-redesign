interface LightboxImage {
  src: string;
  alt?: string;
  x: number; // center position. x, y, width, height are in "pixels"
  y: number;
  width: number;
  height: number;
  scaleX: number; // 0-1
  scaleY: number;
  rotation: number; // in degrees. the software will handle cycling
  skewX: number; // in degrees. the software will handle range
  skewY: number;
  cropFirstX: number; // 0-1. proportion of the image size. two points that determines the rectangle (parallel to the image's sides if skewed)
  cropFirstY: number;
  cropSecondX: number;
  cropSecondY: number;
  opacity: number; // 0-1
  order: number; // z-index internal control
  layer: number; // also z-index internal control
  // more properties can be added as needed
}

interface LightboxData {
  images: LightboxImage[];
  hasSelectedImage: boolean;
  selectedImageIndex: number;
  cameraCenterX: number;
  cameraCenterY: number;
  cameraZoom: number;

  disableDotGrid: boolean;
}
