"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";

import { Button } from "~/components/base/buttons/button";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const getPreferredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

export const ThemeToggle = ({ className }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const currentTheme = getPreferredTheme();

    setTheme(currentTheme);
    setMounted(true);
    applyTheme(currentTheme);

    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== STORAGE_KEY ||
        (event.newValue !== "light" && event.newValue !== "dark")
      ) {
        return;
      }

      setTheme(event.newValue);
      applyTheme(event.newValue);
    };

    window.addEventListener("storage", onStorage);

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      size="sm"
      color="secondary"
      iconLeading={
        mounted ? (theme === "dark" ? SunMedium : MoonStar) : undefined
      }
      onClick={() => {
        setTheme(nextTheme);
        applyTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
      }}
      className={className}
    >
      {mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
    </Button>
  );
};
