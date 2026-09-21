"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowLeft,
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
import { StaffPortal } from "@/lib/auth/roles";
import { getDemoAccountByRole } from "@/lib/auth/demo-accounts";
import { UNIVERSAL_PASSWORD } from "@/lib/auth/campus-credentials";
import { CampusEmailSelector } from "./campus-email-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCHOOL_DATA } from "@/lib/school-data";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const PORTAL_ICONS: Record<string, React.ElementType> = {
  ADMIN: ShieldCheck,
  PRINCIPAL: GraduationCap,
  ACCOUNTANT: Calculator,
  HR_MANAGER: Users,
};

export function PortalLoginForm({ portal }: { portal: StaffPortal }) {
  const router = useRouter();
  const { login, isAuthenticated, isAuthLoading } = useERP();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [logoFailed, setLogoFailed] = React.useState(false);
  const showLogo = !logoFailed && SCHOOL_DATA.logoPath;

  const demo = React.useMemo(() => getDemoAccountByRole(portal.role), [portal.role]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: demo?.email ?? "", password: UNIVERSAL_PASSWORD },
  });

  const currentEmail = watch("email");

  const handleSelectAccount = (email: string, password = UNIVERSAL_PASSWORD) => {
    setValue("email", email, { shouldValidate: true, shouldDirty: true });
    setValue("password", password, { shouldValidate: true, shouldDirty: true });
    setServerError(null);
  };

  // Prefill when portal changes (admin/principal/accountant/hr)
  React.useEffect(() => {
    if (demo) reset({ email: demo.email, password: UNIVERSAL_PASSWORD });
  }, [demo, reset]);

  // Already signed in → the shell bounces to the role landing page.
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(getLandingPageForRole(portal.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    const result = await login(portal.role, values.email, values.password);
    if (!result.success) {
      setServerError(result.error ?? "Sign-in failed. Please try again.");
      return;
    }
    toast.success(`Signed in to the ${portal.label} portal`, {
      description: "Loading your workspace…",
    });
    router.replace(getLandingPageForRole(portal.role));
  };

  const PortalIcon = PORTAL_ICONS[portal.role] ?? ShieldCheck;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: form column ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All portals
          </Link>
          <div className="flex items-center gap-2">
            {showLogo ? (
              <img
                src={SCHOOL_DATA.logoPath}
                alt={SCHOOL_DATA.appName}
                onError={() => setLogoFailed(true)}
                className="h-8 w-8 rounded-xl object-contain bg-white shadow-md shadow-primary/20"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="text-sm font-bold tracking-tight">{SCHOOL_DATA.appName}</span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[420px] space-y-6 py-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-[11px] gap-1">
                <PortalIcon className="h-3 w-3" /> {portal.title}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight">
                Sign in as {portal.label}
              </h1>
              <p className="text-sm text-muted-foreground">{portal.description}</p>
            </div>

            {/* Campus-wise email suggestions */}
            <CampusEmailSelector
              currentEmail={currentEmail}
              onSelectAccount={handleSelectAccount}
              preferredCategory={portal.label}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="text-xs font-semibold">
                    Email address
                  </label>
                  <span className="text-[10px] text-muted-foreground">Click a role above to auto-fill</span>
                </div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.edu"
                    className="pl-9 font-medium"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold">
                    Password
                  </label>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Universal: {UNIVERSAL_PASSWORD}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9 pr-10 font-mono"
                    aria-invalid={!!errors.password}
                    {...register("password")}
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
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {demo && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs">
                  <p className="font-semibold text-primary flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Demo credentials prefilled</p>
                  <p className="text-muted-foreground mt-1 font-mono break-all">Email: {demo.email} · Password: {demo.password}</p>
                  <p className="text-[11px] text-muted-foreground">Just click Sign in — or edit if you want to test another account.</p>
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    Sign in to {portal.title} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Credentials are verified against the school API. Accounts lock for 15 minutes after
              5 failed attempts. Only {portal.label.toLowerCase()} accounts can use this portal.
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: cover panel ────────────────────────────────────────────── */}
      <div className={cn("relative hidden lg:block overflow-hidden bg-gradient-to-br", portal.gradient)}>
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80"
          alt="Campus building"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <Badge className="mb-6 w-fit bg-white/15 text-white border-white/20 backdrop-blur">
            {portal.title}
          </Badge>
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
            One platform. Role-aware access.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
            {portal.description}
          </p>
          <p className="mt-6 flex items-center gap-2 text-xs text-white/70">
            <ShieldCheck className="h-3.5 w-3.5" /> Protected workspace · token-based sessions
          </p>
        </div>
      </div>
    </div>
  );
}
