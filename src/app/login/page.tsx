"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  GraduationCap,
  Calculator,
  Users,
  Copy,
  Check,
  Lock,
  Mail,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useERP } from "@/components/providers/erp-provider";
import { DEMO_ACCOUNTS, DEMO_PASSWORD_HINT, DemoAccount } from "@/lib/auth/demo-accounts";
import { getLandingPageForRole } from "@/lib/auth/role-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SCHOOL_DATA } from "@/lib/school-data";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const ROLE_ICONS: Record<string, React.ElementType> = {
  SUPER_ADMIN: ShieldCheck,
  PRINCIPAL: GraduationCap,
  ACCOUNTANT: Calculator,
  HR_MANAGER: Users,
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isAuthLoading } = useERP();
  const [showPassword, setShowPassword] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<DemoAccount>(DEMO_ACCOUNTS[0]);
  const [copiedEmail, setCopiedEmail] = React.useState(false);
  // Logo file may not exist yet (place it at schholerp/public/logo.png).
  const [logoFailed, setLogoFailed] = React.useState(false);
  const showLogo = !logoFailed && SCHOOL_DATA.logoPath;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: DEMO_ACCOUNTS[0].email, password: DEMO_PASSWORD_HINT },
  });

  // Prefill email when a role card is picked.
  const pickRole = React.useCallback(
    (account: DemoAccount) => {
      setSelectedRole(account);
      setValue("email", account.email, { shouldValidate: true });
      setValue("password", DEMO_PASSWORD_HINT, { shouldValidate: true });
    },
    [setValue]
  );

  // Already signed in → bounce to role landing page.
  React.useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.replace(getLandingPageForRole(selectedRole.role));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAuthLoading]);

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 1500);
    } catch {
      toast.info(email);
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    const result = login(values.email, values.password);
    if (!result.success) {
      toast.error("Sign-in failed", { description: result.error });
      return;
    }
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === values.email.trim().toLowerCase()
    );
    toast.success(`Welcome back, ${account?.label ?? "Admin"}`, {
      description: `Signed in as ${values.email.trim().toLowerCase()}. Sidebar updated for your role.`,
    });
    router.replace(getLandingPageForRole(account?.role));
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
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: form column (shadcn login-02 pattern) ─────────────────── */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-background">
        <div className="flex items-center gap-2">
          {showLogo ? (
            <img
              src={SCHOOL_DATA.logoPath}
              alt={SCHOOL_DATA.appName}
              onError={() => setLogoFailed(true)}
              className="h-9 w-9 rounded-xl object-contain bg-white shadow-md shadow-primary/20"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-primary/20">
              <Sparkles className="h-4 w-4" />
            </div>
          )}
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight">{SCHOOL_DATA.appName}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {SCHOOL_DATA.appTagline}
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[420px] space-y-8 py-6">
            <div className="space-y-2">
              <Badge variant="secondary" className="text-[11px]">
                Staff Console — Demo Mode
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Sign in to the admin console. Every staff role uses the same demo password.
              </p>
            </div>

            {/* Role quick-pick */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                1 · Pick a role
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = ROLE_ICONS[account.role] ?? ShieldCheck;
                  const active = selectedRole.role === account.role;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => pickRole(account)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-2 text-left transition-all active:scale-[0.98]",
                        active
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30 shadow-sm"
                          : "border-border bg-card hover:border-primary/40 hover:bg-accent"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-xs font-semibold">{account.label}</span>
                        <span className="block truncate text-[10px] text-muted-foreground">
                          {account.email}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Credentials form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                2 · Enter credentials
              </p>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@gmail.com"
                    className="pl-9"
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
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Lock className="h-3 w-3" /> same for all roles
                  </span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-9 pr-10"
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

              <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
                  </>
                ) : (
                  <>
                    Sign in as {selectedRole.label} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <Card className="border-dashed bg-muted/40">
              <CardContent className="p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Demo credentials</span>
                  <button
                    type="button"
                    onClick={() => copyEmail(selectedRole.email)}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {copiedEmail ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedEmail ? "Copied" : "Copy email"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="rounded-lg bg-background px-2 py-1.5 border truncate">
                    {selectedRole.email}
                  </div>
                  <div className="rounded-lg bg-background px-2 py-1.5 border">
                    {DEMO_PASSWORD_HINT}
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  All four staff logins share the password{" "}
                  <span className="font-mono font-semibold text-foreground">admin123</span>. Student
                  &amp; teacher portals are separate and coming later.
                </p>
              </CardContent>
            </Card>

            <p className="text-center text-[11px] text-muted-foreground">
              Protected demo build — credentials never leave your browser (localStorage only).
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: cover panel ──────────────────────────────────────────── */}
      <div className="relative hidden lg:block overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800">
        <img
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80"
          alt="University campus building"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <div className="mb-6 flex gap-2">
            {["6 Campuses", "12k Students", "99.2% Uptime"].map((stat) => (
              <Badge key={stat} className="bg-white/15 text-white border-white/20 backdrop-blur">
                {stat}
              </Badge>
            ))}
          </div>
          <h2 className="max-w-md text-3xl font-bold leading-tight tracking-tight">
            One login. Every campus, role-aware.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
            Super Admin sees everything. Principals get their campus, Accountants get finance, HR
            gets people — the sidebar reshapes itself the moment you sign in.
          </p>
          <div className="mt-6 flex items-center gap-3 text-xs text-white/70">
            <div className="flex -space-x-2">
              {DEMO_ACCOUNTS.map((a) => (
                <img
                  key={a.role}
                  src={a.session.avatar}
                  alt={a.label}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
                  loading="lazy"
                />
              ))}
            </div>
            <span>4 demo personas · password admin123 for all</span>
          </div>
        </div>
      </div>
    </div>
  );
}
