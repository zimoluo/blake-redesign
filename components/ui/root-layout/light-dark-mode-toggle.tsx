"use client";

import { useTheme } from "next-themes";
import SunIcon from "../asset/sun-icon";
import MoonIcon from "../asset/moon-icon";
import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !systemTheme) return <div className="w-6 h-6 invisible" />;

  const isLight =
    theme === "light" || (theme === "system" && systemTheme === "light");

  const handleToggle = () => {
    if (theme === "system") {
      setTheme(systemTheme === "light" ? "dark" : "light");
    } else if (theme === "light") {
      systemTheme === "light" ? setTheme("dark") : setTheme("system");
    } else if (theme === "dark") {
      systemTheme === "dark" ? setTheme("light") : setTheme("system");
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle light/dark mode"
      className={`w-6 h-6 ${className}`}
    >
      {isLight ? (
        <SunIcon
          className={`w-6 h-6 transition-transform duration-300 ease-out hover:scale-110 ${toggleStyle.startup}`}
          strokeClassName={strokeClassName}
        />
      ) : (
        <MoonIcon
          className={`w-6 h-6 transition-transform duration-300 ease-out hover:scale-110 ${toggleStyle.startup}`}
          strokeClassName={strokeClassName}
        />
      )}
    </button>
  );
}
