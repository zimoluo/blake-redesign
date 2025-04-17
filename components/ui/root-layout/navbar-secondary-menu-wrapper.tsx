"use client";

import { useNavbarControl } from "@/components/context/NavbarControlContext";

interface Props {
  children?: React.ReactNode;
}

export default function NavbarSecondaryMenuWrapper({ children }: Props) {
  const { isNavbarMenuOpen } = useNavbarControl();

  return (
    <div
      style={{
        height: isNavbarMenuOpen ? "20rem" : "0",
        transitionProperty: "height, visibility",
      }}
      className={`${
        isNavbarMenuOpen ? "" : "invisible pointer-events-none select-none"
      } duration-300 ease-in-out overflow-hidden`}
    >
      {children}
    </div>
  );
}
