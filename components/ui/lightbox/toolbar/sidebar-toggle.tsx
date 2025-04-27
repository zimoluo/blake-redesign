"use client";

import SidebarIcon from "@/components/asset/sidebar-icon";
import { useSettings } from "@/components/context/settings-context";

export default function LightboxSidebarToggle() {
  const { toggleSettings } = useSettings();

  return (
    <button
      onClick={() => toggleSettings("lightboxIsSidebarOpen")}
      className="hidden md:block"
    >
      <SidebarIcon
        className="w-full h-full transition-transform duration-300 ease-out hover:scale-110"
        strokeClassName="stroke-dark"
      />
    </button>
  );
}
