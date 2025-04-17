"use client";

import { useTheme } from "next-themes";
import SunIcon from "../asset/sun-icon";
import MoonIcon from "../asset/moon-icon";
import { useEffect, useState } from "react";

export default function LightDarkModeToggle() {
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
      className="transition-transform duration-300 ease-out hover:scale-110"
    >
      {isLight ? (
        <SunIcon className="w-6 h-6" />
      ) : (
        <MoonIcon className="w-6 h-6" />
      )}
    </button>
  );
}
