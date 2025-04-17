"use client";

import { useNavbarControl } from "@/components/context/NavbarControlContext";
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
              className={`
                text-center px-2 py-1.5 rounded-2xl flex items-center justify-center ${
                  navbarStyle.submenuBorderAdjust
                } ${
                isActive
                  ? "border-reflect bg-accent/15"
                  : "border-transparent bg-transparent"
              } transition-colors duration-150
              `}
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
