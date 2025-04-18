"use client";

import { useNavbarControl } from "@/components/context/navbar-control-context";
import navbarStyle from "./navbar.module.css";

interface Props {
  children?: React.ReactNode;
}

export default function NavbarSecondaryMenuWrapper({ children }: Props) {
  const { isNavbarMenuOpen } = useNavbarControl();

  return (
    <div
      style={
        {
          "--navbar-submenu-height": !isNavbarMenuOpen ? "0" : undefined,
          transitionProperty: "height, visibility",
        } as Record<string, string>
      }
      className={`${
        isNavbarMenuOpen ? "" : "invisible pointer-events-none select-none"
      } ${navbarStyle.submenuHeight} duration-300 ease-in-out overflow-hidden`}
    >
      {children}
    </div>
  );
}
