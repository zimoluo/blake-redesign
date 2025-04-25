"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { defaultLightbox } from "@/lib/constants";
import { useSettings } from "./settings-context";

const LightboxContext = createContext<
  | {
      lightbox: LightboxData;
      images: LightboxImage[];
      updateLightbox: (newLightbox: Partial<LightboxData>) => void;
      updateImage: (index: number, newImage: Partial<LightboxImage>) => void;
      addImage: (newImage: LightboxImage) => void;
      removeImage: (index: number) => void;
      setSelectedImage: (index: number) => void;
      saveLightboxToSettings: () => void;
    }
  | undefined
>(undefined);

export const LightboxProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const [lightbox, setLightbox] = useState<LightboxData>(defaultLightbox);
  const { updateSettings, settings } = useSettings();

  const updateLightbox = useCallback(
    (patch: Partial<LightboxData>) =>
      setLightbox((prev) => ({ ...prev, ...patch })),
    []
  );

  const updateImage = useCallback(
    (index: number, patch: Partial<LightboxImage>) => {
      setLightbox((prev) => {
        const newImages = [...prev.images];
        newImages[index] = { ...newImages[index], ...patch };
        return { ...prev, images: newImages };
      });
    },
    []
  );

  const addImage = useCallback((newImage: LightboxImage) => {
    setLightbox((prev) => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
  }, []);

  const removeImage = useCallback((index: number) => {
    setLightbox((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const setSelectedImage = useCallback((index: number) => {
    setLightbox((prev) => ({
      ...prev,
      selectedImageIndex: index,
    }));
  }, []);

  const saveLightboxToSettings = useCallback(() => {
    // setLightbox ensures that the provided lightbox is up to date. It does not change the lightbox
    setLightbox((prev) => {
      const newLightbox = structuredClone(prev);
      updateSettings({ savedLightbox: newLightbox });
      return prev;
    });
  }, [lightbox, updateSettings]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Load the lightbox from settings on mount. This is intended to be a one-time load.
    setLightbox(settings.savedLightbox);
  }, []);

  const contextValue = useMemo(
    () => ({
      lightbox,
      images: lightbox.images,
      updateLightbox,
      updateImage,
      addImage,
      removeImage,
      setSelectedImage,
      saveLightboxToSettings,
    }),
    [
      lightbox,
      updateLightbox,
      updateImage,
      addImage,
      removeImage,
      setSelectedImage,
      saveLightboxToSettings,
    ]
  );

  return <LightboxContext value={contextValue}>{children}</LightboxContext>;
};

export const useLightbox = () => {
  const context = use(LightboxContext);
  if (!context) {
    throw new Error("useLightbox must be used within a LightboxProvider");
  }
  return context;
};
