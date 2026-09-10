import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
interface ThemeContextType { theme: Theme; setTheme: (theme: Theme) => void; toggleTheme: () => void; switchable: boolean; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
interface ThemeProviderProps { children: React.ReactNode; defaultTheme?: Theme; switchable?: boolean; }

export function ThemeProvider({ children, defaultTheme = "light", switchable = false }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!switchable || typeof window === "undefined") return defaultTheme;
    const stored = localStorage.getItem("theme");
    return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme;
  });
  useEffect(() => {
    const root = document.documentElement;
    const resolved = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
    root.classList.toggle("dark", resolved === "dark");
    root.dataset.theme = theme;
    if (switchable) localStorage.setItem("theme", theme);
  }, [theme, switchable]);
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => document.documentElement.classList.toggle("dark", media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : prev === "dark" ? "system" : "light");
  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, switchable }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error("useTheme must be used within ThemeProvider"); return context; }
