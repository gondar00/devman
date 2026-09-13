"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("lgtm_theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("lgtm_theme", "dark");
    }
  }

  return (
    <button
      onClick={toggle}
      className="text-xs text-zinc-500 hover:text-zinc-300 font-mono transition-colors"
      aria-label="Toggle theme"
    >
      {isLight ? "◑ Dark" : "○ Light"}
    </button>
  );
}
