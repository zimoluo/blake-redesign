"use client";

import { useState } from "react";
import navbarStyle from "./navbar.module.css";
import MagnifyingGlassIcon from "../asset/magnifying-glass-icon";

export default function NavbarSearchBar() {
  const [isSearchBarExpanded, setIsSearchBarExpanded] = useState(false);
  return (
    <div
      style={{
        width: isSearchBarExpanded ? "12rem" : "1.5rem",
        transitionProperty: "width",
      }}
      className="h-6 relative duration-300 ease-out"
    >
      <input
        type="text"
        placeholder="Search"
        className={`h-9 absolute -right-1.5 top-1/2 -translate-y-1/2 w-full rounded-full text-sm py-1.5 pl-2.5 pr-8 bg-highlight/90 text-dark placeholder:text-dark/50 outline-none transition-[opacity,visibility] duration-300 ease-out ${
          isSearchBarExpanded
            ? "opacity-100"
            : "opacity-0 invisible pointer-events-none select-none"
        }`}
      />
      <button
        onClick={() => setIsSearchBarExpanded((prev) => !prev)}
        className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6"
      >
        <MagnifyingGlassIcon
          className={`h-6 w-6 transition-transform duration-300 ease-out ${
            isSearchBarExpanded ? "scale-[0.8]" : "hover:scale-110"
          }`}
        />
      </button>
      <div
        className={`h-9 absolute -right-1.5 top-1/2 -translate-y-1/2 w-full rounded-full border-reflect ${
          isSearchBarExpanded ? "opacity-100" : "opacity-0 invisible"
        } pointer-events-none transition-[opacity,visibility] duration-300 ease-out select-none ${
          navbarStyle.searchBarBorderAdjust
        }`}
      />
    </div>
  );
}
