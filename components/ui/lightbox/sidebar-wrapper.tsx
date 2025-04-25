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
        transition:
          "width 0.15s ease-out, margin-right 0.15s ease-out, transform 0.15s ease-out, translate 0.15s ease-out, visibility 0.15s ease-out",
      }}
      className={`overflow-hidden ${
        lightboxIsSidebarOpen ? "" : "pointer-events-none select-none"
      } w-full ${
        lightboxIsSidebarOpen
          ? "md:w-48 md:mr-3 md:translate-x-0"
          : "md:w-0 md:mr-0 md:translate-x-2 md:invisible"
      } rounded-[0.65rem_0.65rem_0.65rem_1rem] md:rounded-[0.65rem]`}
    >
      {children}
    </div>
  );
}
