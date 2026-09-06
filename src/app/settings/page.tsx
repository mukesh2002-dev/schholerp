"use client";

import React, { useEffect } from "react";
import { useSettings } from "@/components/providers/settings-provider";
import {
  CONTENT_WIDTH_OPTIONS,
  DENSITY_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  PRIMARY_PRESETS,
  SECONDARY_PRESETS,
  FontId,
  SettingOption,
  ThemeMode,
} from "@/lib/settings";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  LayoutDashboard,
  TableProperties,
  Rows3,
  ALargeSmall,
  Component as ComponentIcon,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { id: ThemeMode; label: string; hint: string; icon: React.ElementType }[] = [
  { id: "light", label: "Light", hint: "Bright daytime interface", icon: Sun },
  { id: "dark", label: "Dark", hint: "Easy on the eyes at night", icon: Moon },
  { id: "system", label: "System", hint: "Follow device preference", icon: Monitor },
];

/* Canonical status → badge mapping used across all 31 modules. */
const STATUS_BADGES: { label: string; variant: "success" | "warning" | "destructive" | "info" | "secondary" | "outline"; usage: string }[] = [
  { label: "Paid", variant: "success", usage: "Fees · Payroll" },
  { label: "Present", variant: "success", usage: "Attendance" },
  { label: "Pass", variant: "success", usage: "Exams" },
  { label: "Pending", variant: "warning", usage: "Fees · Approvals" },
  { label: "Overdue", variant: "destructive", usage: "Fees · Library" },
  { label: "Absent", variant: "destructive", usage: "Attendance" },
  { label: "New", variant: "info", usage: "Messages · Notices" },
  { label: "Draft", variant: "secondary", usage: "Exams · Payroll" },
  { label: "Archived", variant: "outline", usage: "Documents" },
];

const SAMPLE_ROWS = [
  { name: "Aarav Sharma", detail: "Grade 10 · STU-1042", amount: "₹12,500", status: "Paid" },
  { name: "Diya Patel", detail: "Grade 9 · STU-0912", amount: "₹8,200", status: "Pending" },
  { name: "Arjun Nair", detail: "Grade 10 · STU-1055", amount: "₹4,750", status: "Overdue" },
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

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SettingOption<T>[];
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-2", options.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            aria-pressed={active}
            className={cn(
              "flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-left transition-all",
              active
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border/70 hover:border-primary/40 bg-card"
            )}
          >
            <span className="min-w-0">
              <span className="text-sm font-semibold text-foreground block">{opt.label}</span>
              <span className="text-[11px] text-muted-foreground block truncate">{opt.hint}</span>
            </span>
            {active && <Check className="h-4 w-4 text-primary shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
        checked
          ? "border-primary/50 bg-primary/[0.04]"
          : "border-border/70 hover:border-primary/40 bg-card"
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
          checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground block">{title}</span>
        <span className="text-[11px] text-muted-foreground block">{description}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors shrink-0",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

function PreviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
      {children}
    </span>
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
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
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
            Personalize theme, typography, layout, tables, and every component. Changes apply
            instantly across all modules and persist in this browser.
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
                  "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
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
        description="Font family and base text size used across the entire platform."
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
        <div className="space-y-2">
          <PreviewLabel>Base text size — scales the whole app</PreviewLabel>
          <SegmentedControl
            value={settings.fontSize}
            onChange={(v) => settings.update({ fontSize: v })}
            options={FONT_SIZE_OPTIONS}
          />
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
            <PreviewLabel>Live preview</PreviewLabel>
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

      {/* 4. Workspace layout */}
      <SectionCard
        icon={LayoutDashboard}
        title="Workspace Layout"
        description="Control page width, header behavior, and motion across the app."
      >
        <div className="space-y-2">
          <PreviewLabel>Content width</PreviewLabel>
          <SegmentedControl
            value={settings.contentWidth}
            onChange={(v) => settings.update({ contentWidth: v })}
            options={CONTENT_WIDTH_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div
              className={cn(
                "rounded-lg border p-2 transition-colors",
                settings.contentWidth === "contained" ? "border-primary/50 bg-primary/5" : "border-border/60"
              )}
            >
              <div className="mx-auto h-10 w-3/5 rounded bg-primary/25 ring-1 ring-primary/30" />
              <p className="text-center text-[10px] text-muted-foreground mt-1.5">Contained</p>
            </div>
            <div
              className={cn(
                "rounded-lg border p-2 transition-colors",
                settings.contentWidth === "full" ? "border-primary/50 bg-primary/5" : "border-border/60"
              )}
            >
              <div className="h-10 w-full rounded bg-primary/25 ring-1 ring-primary/30" />
              <p className="text-center text-[10px] text-muted-foreground mt-1.5">Full width</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <ToggleRow
            icon={LayoutDashboard}
            title="Sticky header"
            description="Pin the top bar while scrolling"
            checked={settings.stickyTopbar}
            onChange={(v) => settings.update({ stickyTopbar: v })}
          />
          <ToggleRow
            icon={SlidersHorizontal}
            title="Animations"
            description="Transitions & hover effects"
            checked={settings.animations}
            onChange={(v) => settings.update({ animations: v })}
          />
        </div>
      </SectionCard>

      {/* 5. Density & corners */}
      <SectionCard
        icon={Rows3}
        title="Density & Corners"
        description="Compact mode fits more rows on screen — ideal for data-heavy registers."
      >
        <div className="space-y-2">
          <PreviewLabel>Density — applies to every table & card</PreviewLabel>
          <SegmentedControl
            value={settings.density}
            onChange={(v) => settings.update({ density: v })}
            options={DENSITY_OPTIONS}
          />
        </div>
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

      {/* 6. Tables */}
      <SectionCard
        icon={TableProperties}
        title="Tables"
        description="Style every data table (Students, Fees, Attendance, HR) in one place."
      >
        <ToggleRow
          icon={TableProperties}
          title="Striped rows"
          description="Subtle zebra banding for long registers"
          checked={settings.tableStriped}
          onChange={(v) => settings.update({ tableStriped: v })}
        />
        <div className="space-y-2">
          <PreviewLabel>Live preview — reflects density & striping</PreviewLabel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Due</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_ROWS.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>
                    <span className="font-medium text-foreground block">{row.name}</span>
                    <span className="text-xs text-muted-foreground">{row.detail}</span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.amount}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        row.status === "Paid"
                          ? "success"
                          : row.status === "Pending"
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>

      {/* 7. Component playground */}
      <SectionCard
        icon={ComponentIcon}
        title="Component Playground"
        description="Every primitive below reacts live to your theme, font, colors, radius, and text size."
      >
        <div className="space-y-2">
          <PreviewLabel>Buttons — 8 variants</PreviewLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
            <Button size="sm" variant="link">
              Link
            </Button>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
            <Button size="sm" variant="glass">
              Glass
            </Button>
            <Button size="sm" variant="gradient">
              Gradient
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        <div className="space-y-2">
          <PreviewLabel>Status system — one color per meaning, app-wide</PreviewLabel>
          <div className="flex flex-wrap gap-2">
            {STATUS_BADGES.map((s) => (
              <span key={s.label} className="inline-flex flex-col gap-1">
                <Badge variant={s.variant}>{s.label}</Badge>
                <span className="text-[10px] text-muted-foreground text-center">{s.usage}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <PreviewLabel>Form controls</PreviewLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Text input — e.g. student name" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select — e.g. campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apex">Apex Global Campus</SelectItem>
                <SelectItem value="green">Green Valley School</SelectItem>
                <SelectItem value="river">Riverdale Academy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea placeholder="Textarea — e.g. admission remarks" rows={2} />
        </div>

        <div className="space-y-2">
          <PreviewLabel>Tabs & stats</PreviewLabel>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <StatCard
                  title="Collection"
                  value="₹4.2L"
                  change={12}
                  changeType="increase"
                  period="vs last month"
                  icon={<Wallet className="h-5 w-5" />}
                />
                <StatCard
                  title="Strength"
                  value="1,248"
                  change={-2}
                  changeType="decrease"
                  period="vs last term"
                  icon={<Users className="h-5 w-5" />}
                />
              </div>
            </TabsContent>
            <TabsContent value="records">
              <p className="text-sm text-muted-foreground py-2">
                Tab panels inherit the active font, radius, and density automatically.
              </p>
            </TabsContent>
            <TabsContent value="reports">
              <div className="space-y-2 py-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-2">
          <PreviewLabel>Overlays</PreviewLabel>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Open dialog
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sample dialog</DialogTitle>
                  <DialogDescription>
                    Dialogs share one style everywhere — same radius, same backdrop, same
                    entrance.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button size="sm">Confirm</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  Open sheet
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sample sheet</SheetTitle>
                  <SheetDescription>
                    Sheets slide in from the edge — used for filters and quick edits.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-3 py-4">
                  <Input placeholder="Filter by name…" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </SectionCard>

      {/* 8. Text-size note */}
      <SectionCard
        icon={ALargeSmall}
        title="Accessibility"
        description="Comfort options that apply everywhere instantly."
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <ToggleRow
            icon={ALargeSmall}
            title="Large text"
            description="112.5% base size"
            checked={settings.fontSize === "lg"}
            onChange={(v) => settings.update({ fontSize: v ? "lg" : "md" })}
          />
          <ToggleRow
            icon={Rows3}
            title="Compact rows"
            description="Dense tables"
            checked={settings.density === "compact"}
            onChange={(v) => settings.update({ density: v ? "compact" : "comfortable" })}
          />
          <ToggleRow
            icon={SlidersHorizontal}
            title="Reduce motion"
            description="Calm interface"
            checked={!settings.animations}
            onChange={(v) => settings.update({ animations: !v })}
          />
        </div>
      </SectionCard>

      <Card className="border-border/60 bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <SettingsIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Settings are stored in this browser&apos;s local storage
            (<span className="font-mono">school_erp_settings_v1</span>) and apply instantly without
            a reload. They are per-device — clearing site data restores the defaults (Manrope,
            system theme, Ocean Blue, default size, comfortable density, contained width).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
