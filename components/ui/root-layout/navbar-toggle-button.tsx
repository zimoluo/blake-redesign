"use client";

import { useNavbarControl } from "@/components/context/navbar-control-context";
import navbarStyle from "./navbar.module.css";
import MenuToggleIcon from "@/components/asset/menu-toggle-icon";

export default function NavbarToggleButton() {
  const { isNavbarMenuOpen, toggleNavbarMenu } = useNavbarControl();

  return (
    <button
      className="h-6 w-6 hover:scale-110 transition-transform duration-300 ease-out"
      onClick={toggleNavbarMenu}
    >
      <div
        className={`absolute pointer-events-none ${
          isNavbarMenuOpen
            ? "-translate-y-1/2"
            : "delay-[80ms] -translate-y-1/3"
        } ${navbarStyle.toggle}`}
      >
        <MenuToggleIcon
          className={`h-6 w-6 ${
            isNavbarMenuOpen ? "delay-[80ms] -rotate-45" : "rotate-0"
          } ${navbarStyle.toggle}`}
        />
      </div>
      <div
        className={`absolute pointer-events-none ${
          isNavbarMenuOpen
            ? "-translate-y-1/2"
            : "delay-[80ms] -translate-y-2/3"
        } ${navbarStyle.toggle}`}
      >
        <MenuToggleIcon
          className={`h-6 w-6 ${
            isNavbarMenuOpen ? "delay-[80ms] rotate-45" : "rotate-0"
          } ${navbarStyle.toggle}`}
        />
      </div>
    </button>
  );
}
