interface SettingsState {
  lightboxIsSidebarOpen: boolean;
  savedLightbox: LightboxData; // not the live lightbox. just for persistence. live lightbox is in the context/session
  lightboxEditorMode: LightboxEditorMode;
}

type LightboxEditorMode = "scale" | "rotate" | "skew" | "crop";
