"use client";

export type ThemeMode = "light" | "dark" | "system";
export type FontId = "manrope" | "inter" | "plus-jakarta" | "system";

export interface FontOption {
  id: FontId;
  label: string;
  /** CSS family name applied via --app-font */
  family: string;
  /** Google Fonts css2 URL (injected at runtime; fails silently offline) */
  googleFontsUrl?: string;
  previewText?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "manrope",
    label: "Manrope",
    family: "Manrope",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
  },
  {
    id: "inter",
    label: "Inter",
    family: "Inter",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans",
    family: '"Plus Jakarta Sans"',
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  },
  {
    id: "system",
    label: "System Default",
    family: "ui-sans-serif, system-ui, sans-serif",
  },
];

export interface ColorPreset {
  name: string;
  value: string; // hex
}

export const PRIMARY_PRESETS: ColorPreset[] = [
  { name: "Ocean Blue", value: "#3b82f6" },
  { name: "Royal Purple", value: "#8b5cf6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#ec4899" },
  { name: "Crimson", value: "#ef4444" },
  { name: "Slate", value: "#64748b" },
];

export const SECONDARY_PRESETS: ColorPreset[] = [
  { name: "Slate Mist", value: "#e2e8f0" },
  { name: "Sky Tint", value: "#dbeafe" },
  { name: "Violet Tint", value: "#ede9fe" },
  { name: "Mint Tint", value: "#d1fae5" },
  { name: "Peach Tint", value: "#ffedd5" },
  { name: "Pink Tint", value: "#fce7f3" },
];

export interface AppSettings {
  theme: ThemeMode;
  font: FontId;
  primaryColor: string; // hex
  secondaryColor: string; // hex
  radius: number; // rem
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  font: "manrope",
  primaryColor: "#3b82f6",
  secondaryColor: "#e2e8f0",
  radius: 0.75,
};

export const SETTINGS_STORAGE_KEY = "school_erp_settings_v1";

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable — settings apply for this session only
  }
}

/** Convert #rrggbb → "H S% L%" for shadcn CSS variables. */
export function hexToHsl(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/** Pick readable foreground (dark text on light bg, white on dark bg). */
export function contrastForeground(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "222 47% 11%" : "0 0% 100%";
}
