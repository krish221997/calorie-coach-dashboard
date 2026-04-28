"use client";

import * as React from "react";
import type { ThemeMode } from "@/types/ui";

interface ThemeCtx {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const Ctx = React.createContext<ThemeCtx>({
  mode: "dark",
  setMode: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = React.useState<ThemeMode>("dark");

  React.useEffect(() => {
    const saved = (localStorage.getItem("cc-theme") as ThemeMode | null) ?? "dark";
    setModeState(saved);
  }, []);

  React.useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(mode);
    localStorage.setItem("cc-theme", mode);
  }, [mode]);

  const setMode = React.useCallback((m: ThemeMode) => setModeState(m), []);
  const toggle = React.useCallback(
    () => setModeState((m) => (m === "dark" ? "light" : "dark")),
    []
  );

  return (
    <Ctx.Provider value={{ mode, setMode, toggle }}>{children}</Ctx.Provider>
  );
}

export function useTheme() {
  return React.useContext(Ctx);
}
