"use client";

import { useTheme } from "next-themes";
import SunIcon from "../asset/sun-icon";

export default function LightDarkModeToggle() {
  const { theme, setTheme } = useTheme();

  const rotateThemes = () => {
    if (theme === "dark") {
      setTheme("system");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <button onClick={rotateThemes}>
      <SunIcon className="w-6 h-6 transition-transform duration-300 ease-out hover:scale-110" />
    </button>
  );
}
