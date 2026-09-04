"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useERP } from "@/components/providers/erp-provider";
import { BranchSelector } from "./branch-selector";
import { ThemeToggle } from "./theme-toggle";
import { NotificationDropdown } from "./notification-dropdown";
import { GlobalSearchDialog } from "./global-search-dialog";
import {
  Menu,
  Search,
  Fingerprint,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TopbarProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Topbar({ sidebarCollapsed = false, onToggleSidebar }: TopbarProps) {
  const { session, setSearchOpen, triggerBiometricSync, logout } = useERP();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Signed out", { description: "Demo session cleared. See you soon." });
    router.replace("/login");
  };
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const handleSyncClick = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = triggerBiometricSync();
      setIsSyncing(false);
      setSyncFeedback(res.message);
      setTimeout(() => setSyncFeedback(null), 4000);
    }, 800);
  };

  return (
    <>
      <header
        className="sticky top-0 z-20 flex min-h-16 w-full items-center justify-between gap-2 border-b border-border bg-card/85 backdrop-blur-md px-2.5 py-2 sm:px-6"
        style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        {/* Left Side: Desktop Toggle / Mobile Menu + Campus Switcher */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-3">
          {/* Mobile Menu Drawer Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 shrink-0" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar Toggle Button */}
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="hidden lg:flex h-9 w-9 text-muted-foreground hover:text-foreground"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </Button>
          )}

          {/* Campus Context Selector */}
          <BranchSelector />
        </div>

        {/* Center / Search Quick Button */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-between w-full h-9 px-3 text-xs text-muted-foreground bg-muted/40 hover:bg-muted/70 rounded-xl border border-border transition-all duration-200"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Search campuses, students, faculty, invoices...</span>
            </span>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-2xs">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Side: Biometric Sync + Role + Notifications + Theme + Profile */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {/* Search Trigger for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="md:hidden h-10 w-10"
            title="Global Search"
            aria-label="Global search"
          >
            <Search className="h-[18px] w-[18px]" />
          </Button>

          {/* Biometric Gateway Pulse Action (Hidden per user request, code retained) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="hidden h-9 px-2.5 text-xs font-medium gap-1.5 border-dashed border-border hover:border-emerald-500/50"
            title="Simulated Biometric Sync"
          >
            <Fingerprint className={`h-3.5 w-3.5 ${isSyncing ? "animate-pulse text-amber-500" : "text-emerald-500"}`} />
            <span className="hidden lg:inline">{isSyncing ? "Syncing Gateways..." : "Biometric Gateway"}</span>
            <span className={`h-2 w-2 rounded-full ${isSyncing ? "bg-amber-500 animate-ping" : "bg-emerald-500"}`} />
          </Button>

          {/* Active role badge (role comes from login, not a switcher) */}
          <Badge variant="secondary" className="hidden sm:inline-flex text-[11px] max-w-[220px] truncate">
            {session.roleLabel}
          </Badge>

          {/* Notifications */}
          <NotificationDropdown />

          {/* Theme Toggle — icon button on sm+; inside profile menu on phones */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 sm:h-9 sm:w-9"
              >
                <img
                  src={session.avatar}
                  alt={session.name}
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-border"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56 max-w-[calc(100vw-2rem)] p-1.5">
              <DropdownMenuLabel className="font-normal p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none truncate">{session.name}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">{session.email}</p>
                  <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                    {session.roleLabel}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => toast.info("Profile Settings — demo placeholder", { description: "User profile management coming soon." })}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 cursor-pointer"
                onClick={() => toast.info("Documentation & Guides", { description: "Help docs at /docs — demo placeholder." })}
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <span>Documentation & Guides</span>
              </DropdownMenuItem>
              {/* Theme switcher for phones (standalone button is sm+ only) */}
              <div className="sm:hidden">
                <DropdownMenuSeparator />
                <div className="grid grid-cols-3 gap-1 p-1">
                  {[
                    { value: "light", label: "Light", Icon: Sun },
                    { value: "dark", label: "Dark", Icon: Moon },
                    { value: "system", label: "Auto", Icon: Laptop },
                  ].map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors ${
                        theme === value
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sync Toast Feedback Banner */}
      {syncFeedback && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 sm:px-4 py-2 text-xs flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex min-w-0 items-center gap-2">
            <Fingerprint className="h-4 w-4 shrink-0" />
            <span className="truncate">{syncFeedback}</span>
          </div>
          <span className="hidden sm:inline text-[10px] opacity-75 font-mono shrink-0">200 OK • Mock Hardware Layer</span>
        </div>
      )}

      {/* Global Search Dialog Modal */}
      <GlobalSearchDialog />
    </>
  );
}
