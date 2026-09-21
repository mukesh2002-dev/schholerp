"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useERP } from "@/components/providers/erp-provider";
import { getLandingPageForRole } from "@/lib/auth/role-navigation";
import { STAFF_PORTALS } from "@/lib/auth/roles";
import { UNIVERSAL_PASSWORD } from "@/lib/auth/campus-credentials";
import { CampusEmailSelector } from "@/components/auth/campus-email-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SCHOOL_DATA } from "@/lib/school-data";

const PORTAL_ICONS: Record<string, React.ElementType> = {
  ADMIN: ShieldCheck,
  PRINCIPAL: GraduationCap,
  ACCOUNTANT: Calculator,
  HR_MANAGER: Users,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAuthLoading, session } = useERP();
  const [logoFailed, setLogoFailed] = useState(false);
  const [email, setEmail] = useState("principal.main@school.local");
  const [password, setPassword] = useState(UNIVERSAL_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const showLogo = !logoFailed && SCHOOL_DATA.logoPath;

  // Already signed in → bounce to the role landing page.
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(getLandingPageForRole(session.role, { allowedModules: session.sidebar }));
    }
  }, [isAuthenticated, isAuthLoading, router, session]);

  const handleSelectAccount = (selectedEmail: string, selectedPassword = UNIVERSAL_PASSWORD) => {
    setEmail(selectedEmail);
    setPassword(selectedPassword);
    setServerError(null);
  };

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setServerError("Please enter an email address.");
      return;
    }
    if (!password) {
      setServerError("Please enter a password.");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    const result = await login("ADMIN", email.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      setServerError(result.error ?? "Sign-in failed. Please try again.");
      return;
    }

    toast.success("Signed in successfully", {
      description: "Loading your campus workspace…",
    });
  };

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            {showLogo ? (
              <img
                src={SCHOOL_DATA.logoPath}
                alt={SCHOOL_DATA.appName}
                onError={() => setLogoFailed(true)}
                className="h-10 w-10 rounded-xl object-contain bg-white shadow-md shadow-primary/20"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <span className="text-xl font-bold tracking-tight">{SCHOOL_DATA.appName}</span>
          </div>

          <Badge variant="secondary" className="text-[11px] gap-1 px-2 py-0.5">
            <Sparkles className="h-3 w-3 text-primary" /> Multi-Campus Staff Console
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Click any staff role below to auto-fill credentials and sign in instantly.
          </p>
        </div>

        {/* ── Main Quick Login Card with Campus Suggestion ────────────────── */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          {/* Campus Suggestion Selector */}
          <CampusEmailSelector
            currentEmail={email}
            onSelectAccount={handleSelectAccount}
          />

          <form onSubmit={handleDirectLogin} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. principal.main@school.local"
                  className="pl-9 font-medium text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold">
                  Password
                </label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Universal: {UNIVERSAL_PASSWORD}
                </span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10 font-mono text-xs sm:text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <Button type="submit" variant="gradient" className="w-full text-xs sm:text-sm font-semibold" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in as {email.split("@")[0]} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* ── Optional Dedicated Portal Links ──────────────────────────────── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Or browse by dedicated role portal:</span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {STAFF_PORTALS.map((portal) => {
              const Icon = PORTAL_ICONS[portal.role] ?? ShieldCheck;
              return (
                <Link
                  key={portal.slug}
                  href={`/login/${portal.slug}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3 text-left transition-all",
                    "hover:border-primary/50 hover:bg-accent/40 hover:shadow-xs active:scale-[0.99]"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-xs text-xs",
                      portal.gradient
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold">{portal.label} Portal</span>
                    <span className="block text-[11px] text-muted-foreground truncate">
                      {portal.description}
                    </span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Universal password for all seed accounts is <code className="font-mono text-foreground font-medium">Mukesh@1234</code>.
        </p>
      </div>
    </div>
  );
}
