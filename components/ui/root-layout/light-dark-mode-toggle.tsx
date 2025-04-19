"use client";

import { useTheme } from "next-themes";
import SunIcon from "@/components/asset/sun-icon";
import MoonIcon from "@/components/asset/moon-icon";
import toggleStyle from "./light-dark-mode-toggle.module.css";

interface Props {
  className?: string;
  strokeClassName?: string;
}

export default function LightDarkModeToggle({
  className = "",
  strokeClassName = "",
}: Props) {
  const { theme, systemTheme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === "system") {
      setTheme(systemTheme === "light" ? "dark" : "light");
    } else if (theme === "light") {
      systemTheme === "light" ? setTheme("dark") : setTheme("system");
    } else {
      systemTheme === "dark" ? setTheme("light") : setTheme("system");
    }
  };

  return (
    <button
      aria-label="Toggle light/dark mode"
      onClick={handleToggle}
      className={`relative w-6 h-6 group ${className}`}
    >
      <SunIcon
        aria-hidden
        className={`icon-sun absolute inset-0 transition-transform duration-300 ease-out origin-center group-hover:scale-110 ${toggleStyle.sun}`}
        strokeClassName={strokeClassName}
      />
      <MoonIcon
        aria-hidden
        className={`icon-moon absolute inset-0 transition-transform duration-300 ease-out origin-center group-hover:scale-110 ${toggleStyle.moon}`}
        strokeClassName={strokeClassName}
      />
    </button>
  );
}
