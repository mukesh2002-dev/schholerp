"use client";

import React, { useEffect } from "react";
import { useSettings } from "@/components/providers/settings-provider";
import {
  FONT_OPTIONS,
  PRIMARY_PRESETS,
  SECONDARY_PRESETS,
  FontId,
  ThemeMode,
} from "@/lib/settings";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sun,
  Moon,
  Monitor,
  Type,
  Palette,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { id: ThemeMode; label: string; hint: string; icon: React.ElementType }[] = [
  { id: "light", label: "Light", hint: "Bright daytime interface", icon: Sun },
  { id: "dark", label: "Dark", hint: "Easy on the eyes at night", icon: Moon },
  { id: "system", label: "System", hint: "Follow device preference", icon: Monitor },
];

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/80 shadow-2xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const settings = useSettings();

  // Preload every font option so previews render in their real typeface
  useEffect(() => {
    FONT_OPTIONS.forEach((f) => {
      if (!f.googleFontsUrl) return;
      const id = `settings-preview-font-${f.id}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = f.googleFontsUrl;
      link.onerror = () => link.remove();
      document.head.appendChild(link);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Settings
            </h1>
            <Badge variant="outline" className="text-xs">
              Saved locally
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Personalize theme, typography, brand colors, and interface. Changes apply instantly
            and persist in this browser.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={settings.reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to defaults
        </Button>
      </div>

      {/* 1. Appearance */}
      <SectionCard
        icon={Sun}
        title="Appearance"
        description="Choose between light, dark, or automatic system theme."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const active = settings.theme === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => settings.update({ theme: opt.id })}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/70 hover:border-primary/40 bg-card"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    {opt.label}
                    {active && <Check className="h-3.5 w-3.5 text-primary" />}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {opt.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 2. Typography */}
      <SectionCard
        icon={Type}
        title="Typography"
        description="Set the default font used across the entire platform."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FONT_OPTIONS.map((font) => {
            const active = settings.font === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => settings.update({ font: font.id as FontId })}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all space-y-1",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border/70 hover:border-primary/40 bg-card"
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{font.label}</span>
                  {active ? (
                    <Badge variant="default" className="text-[10px]">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">
                      {font.id === "system" ? "No download" : "Google Font"}
                    </Badge>
                  )}
                </span>
                <span
                  className="block text-2xl text-foreground leading-snug"
                  style={{ fontFamily: `${font.family}, sans-serif` }}
                >
                  Aa Bb Cc 123
                </span>
                <span
                  className="block text-xs text-muted-foreground"
                  style={{ fontFamily: `${font.family}, sans-serif` }}
                >
                  The quick brown fox jumps over the lazy dog
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* 3. Brand colors */}
      <SectionCard
        icon={Palette}
        title="Brand Colors"
        description="Primary drives buttons, highlights, and active states. Secondary tints supporting surfaces."
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Primary color
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {PRIMARY_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  onClick={() => settings.update({ primaryColor: c.value })}
                  className={cn(
                    "h-9 w-9 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-background",
                    settings.primaryColor.toLowerCase() === c.value.toLowerCase()
                      ? "ring-primary"
                      : "ring-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {settings.primaryColor.toLowerCase() === c.value.toLowerCase() && (
                    <Check className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
              <label
                className="h-9 w-9 rounded-full border-2 border-dashed border-border cursor-pointer flex items-center justify-center text-muted-foreground hover:border-primary transition-colors overflow-hidden relative"
                title="Custom color"
              >
                <Input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => settings.update({ primaryColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer p-0 h-full w-full"
                />
                <span className="text-sm font-bold">+</span>
              </label>
              <span className="text-xs font-mono text-muted-foreground ml-1">
                {settings.primaryColor}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Secondary color
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {SECONDARY_PRESETS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.name}
                  onClick={() => settings.update({ secondaryColor: c.value })}
                  className={cn(
                    "h-9 w-9 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-background border border-border/50",
                    settings.secondaryColor.toLowerCase() === c.value.toLowerCase()
                      ? "ring-primary"
                      : "ring-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {settings.secondaryColor.toLowerCase() === c.value.toLowerCase() && (
                    <Check className="h-4 w-4 text-foreground mx-auto" />
                  )}
                </button>
              ))}
              <label
                className="h-9 w-9 rounded-full border-2 border-dashed border-border cursor-pointer flex items-center justify-center text-muted-foreground hover:border-primary transition-colors overflow-hidden relative"
                title="Custom color"
              >
                <Input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => settings.update({ secondaryColor: e.target.value })}
                  className="absolute inset-0 opacity-0 cursor-pointer p-0 h-full w-full"
                />
                <span className="text-sm font-bold">+</span>
              </label>
              <span className="text-xs font-mono text-muted-foreground ml-1">
                {settings.secondaryColor}
              </span>
            </div>
          </div>

          {/* Live preview */}
          <div className="p-4 rounded-xl border border-border/60 bg-muted/30 space-y-3">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Live preview
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="gradient" size="sm">
                Primary Action
              </Button>
              <Button variant="secondary" size="sm">
                Secondary
              </Button>
              <Button variant="outline" size="sm">
                Outline
              </Button>
              <Badge>Active</Badge>
              <Badge variant="secondary">Draft</Badge>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 4. Interface */}
      <SectionCard
        icon={SlidersHorizontal}
        title="Interface"
        description="Fine-tune corner roundness used across cards, buttons, and inputs."
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Corner radius</span>
            <span className="text-xs font-mono text-muted-foreground">
              {settings.radius.toFixed(2)}rem
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.radius}
            onChange={(e) => settings.update({ radius: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex items-center gap-2">
            {[0, 0.375, 0.75, 1].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => settings.update({ radius: r })}
                className={cn(
                  "h-9 flex-1 border text-[11px] font-medium transition-colors",
                  settings.radius === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/70 text-muted-foreground hover:border-primary/40"
                )}
                style={{ borderRadius: `${r}rem` }}
              >
                {r === 0 ? "Sharp" : r === 1 ? "Round" : `${r}rem`}
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <Card className="border-border/60 bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <SettingsIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Settings are stored in this browser&apos;s local storage
            (<span className="font-mono">school_erp_settings_v1</span>) and apply instantly without
            a reload. They are per-device — clearing site data restores the defaults (Manrope,
            system theme, Ocean Blue).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
