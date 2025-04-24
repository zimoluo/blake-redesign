"use client";

import { useSettings } from "@/components/context/settings-context";

interface Props {
  children?: React.ReactNode;
}

export default function SidebarWrapper({ children }: Props) {
  const { settings } = useSettings();
  const { lightboxIsSidebarOpen } = settings;

  return (
    <div
      style={{
        width: lightboxIsSidebarOpen ? "12rem" : "0",
        marginRight: lightboxIsSidebarOpen ? "0.5rem" : "0rem",
        transform: lightboxIsSidebarOpen
          ? "translateX(0)"
          : "translateX(0.5rem)",
        transition:
          "width 0.15s ease-out, margin-right 0.15s ease-out, transform 0.15s ease-out, visibility 0.15s ease-out",
        visibility: lightboxIsSidebarOpen ? "visible" : "hidden",
      }}
      className={`overflow-hidden ${
        lightboxIsSidebarOpen ? "" : "pointer-events-none select-none"
      }`}
    >
      {children}
    </div>
  );
}
