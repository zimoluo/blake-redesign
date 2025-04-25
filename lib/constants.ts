export const defaultLightbox: LightboxData = {
  images: [],
  hasSelectedImage: false,
  selectedImageIndex: 0,
  cameraCenterX: 0,
  cameraCenterY: 0,
  cameraZoom: 1,
  disableDotGrid: false,
};

export const defaultSettings: SettingsState = {
  lightboxIsSidebarOpen: true,
  savedLightbox: defaultLightbox,
};
