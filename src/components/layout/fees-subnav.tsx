"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/fees", label: "Overview" },
  { href: "/fees/collect", label: "Collect" },
  { href: "/fees/students", label: "Students" },
  { href: "/fees/structures", label: "Structures" },
  { href: "/fees/assignments", label: "Assignments" },
  { href: "/fees/invoices", label: "Invoices" },
  { href: "/fees/payments", label: "Payments" },
  { href: "/fees/heads", label: "Fee Heads" },
  { href: "/fees/defaulters", label: "Defaulters" },
  { href: "/fees/refunds", label: "Refunds" },
];

export function FeesSubnav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-card p-1.5">
      {ITEMS.map((it) => {
        const active = it.href === "/fees" ? pathname === "/fees" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FeesPageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <FeesSubnav />
      <div className="space-y-4">{children}</div>
    </div>
  );
}