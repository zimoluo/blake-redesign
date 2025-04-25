export const defaultLightbox: LightboxData = {
  images: [],
  hasSelectedImage: false,
  selectedImageIndex: 0,
  cameraCenterX: 0,
  cameraCenterY: 0,
  cameraZoom: 1,
  disableDotGrid: false,
};

enum LightboxEditorMode {
  SCALE = "scale",
  ROTATE = "rotate",
  SKEW = "skew",
  CROP = "crop",
}

export const defaultSettings: SettingsState = {
  lightboxIsSidebarOpen: true,
  savedLightbox: defaultLightbox,
  lightboxEditorMode: LightboxEditorMode.SCALE,
};
