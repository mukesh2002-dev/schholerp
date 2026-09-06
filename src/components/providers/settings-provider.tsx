"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  FONT_SIZE_SCALE,
  contrastForeground,
  hexToHsl,
  loadSettings,
  saveSettings,
} from "@/lib/settings";

interface SettingsContextType extends AppSettings {
  update: (patch: Partial<AppSettings>) => void;
  reset: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const FONT_LINK_ID = "app-dynamic-font";

function ensureFontLink(url: string | undefined) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!url) {
    existing?.remove();
    return;
  }
  if (existing) {
    if (existing.href !== url) existing.href = url;
    return;
  }
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = url;
  link.onerror = () => link.remove(); // offline-safe: fall back to system stack
  document.head.appendChild(link);
}

function applySettings(settings: AppSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Brand colors → shadcn variables (HSL triplets)
  const primaryHsl = hexToHsl(settings.primaryColor);
  root.style.setProperty("--primary", primaryHsl);
  root.style.setProperty("--ring", primaryHsl);
  root.style.setProperty("--sidebar-primary", primaryHsl);
  root.style.setProperty("--primary-foreground", contrastForeground(settings.primaryColor));

  const secondaryHsl = hexToHsl(settings.secondaryColor);
  root.style.setProperty("--secondary", secondaryHsl);
  root.style.setProperty("--secondary-foreground", contrastForeground(settings.secondaryColor));

  // Corner radius
  root.style.setProperty("--radius", `${settings.radius}rem`);

  // Base text size — percentage of 16px so the whole app scales
  root.style.fontSize = FONT_SIZE_SCALE[settings.fontSize] ?? "100%";

  // Density / table striping / motion — consumed by global CSS rules
  root.dataset.density = settings.density;
  root.dataset.tableStriped = String(settings.tableStriped);
  root.dataset.motion = settings.animations ? "full" : "off";

  // Font family
  const font = FONT_OPTIONS.find((f) => f.id === settings.font) ?? FONT_OPTIONS[0];
  root.style.setProperty("--app-font", font.family);
  ensureFontLink(font.googleFontsUrl);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const { setTheme } = useTheme();

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Apply on every change (CSS vars + font + next-themes mode)
  useEffect(() => {
    applySettings(settings);
    setTheme(settings.theme);
    saveSettings(settings);
  }, [settings, setTheme]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = React.useMemo(
    () => ({ ...settings, update, reset }),
    [settings, update, reset]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
