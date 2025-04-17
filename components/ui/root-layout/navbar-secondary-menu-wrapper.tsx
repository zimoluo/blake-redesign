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
        height: isNavbarMenuOpen ? "16rem" : "0",
        transitionProperty: "height, visibility",
      }}
      className={`${
        isNavbarMenuOpen ? "" : "invisible"
      } duration-300 ease-in-out`}
    >
      {children}
    </div>
  );
}
