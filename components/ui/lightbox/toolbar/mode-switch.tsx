"use client";

import MoonIcon from "@/components/asset/moon-icon";
import { useSettings } from "@/components/context/settings-context";

interface Props {
  mode: LightboxEditorMode;
}

export default function LightboxModeSwitch({ mode }: Props) {
  const { settings, updateSettings } = useSettings();

  return (
    <button
      onClick={() => updateSettings({ lightboxEditorMode: mode })}
      className="hidden md:block"
    >
      <MoonIcon
        className="w-full h-full transition-transform duration-300 ease-out hover:scale-110"
        strokeClassName={
          settings.lightboxEditorMode === mode ? "stroke-accent" : "stroke-dark"
        }
      />
    </button>
  );
}
