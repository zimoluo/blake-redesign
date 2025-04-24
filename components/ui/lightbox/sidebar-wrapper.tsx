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
        transition: "width 0.15s ease-out, margin-right 0.15s ease-out",
      }}
      className="overflow-hidden"
    >
      {children}
    </div>
  );
}
