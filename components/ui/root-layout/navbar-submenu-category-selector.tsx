"use client";

import { useNavbarControl } from "@/components/context/NavbarControlContext";
import clsx from "clsx";
import navbarStyle from "./navbar.module.css";

const categories = [
  "Illuminated Books",
  "Commercial Book Illustrations",
  "Separate Prints and Prints in Sales",
  "Paintings and Drawings",
  "Manuscripts and Typographic Works",
  "Works in Preview",
  "All Works",
  "Archive Exhibitions",
];

export default function NavbarSubmenuCategorySelector() {
  const { selectedNavbarMenuIndex, setSelectedNavbarMenuIndex } =
    useNavbarControl();

  return (
    <nav aria-label="Category selector">
      <div className="w-full grid grid-cols-8 gap-4 py-4 px-4">
        {categories.map((label, idx) => {
          const isActive = idx === selectedNavbarMenuIndex;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedNavbarMenuIndex(idx)}
              className={clsx(
                "text-center px-2.5 py-2.5 text-sm rounded-2xl flex items-center justify-center",
                navbarStyle.submenuBorderAdjust,
                navbarStyle.submenuTransition,
                {
                  "border-reflect bg-accent/15 shadow-lg/5": isActive,
                  "bg-transparent": !isActive,
                }
              )}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
