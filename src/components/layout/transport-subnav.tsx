"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/transport", label: "Overview" },
  { href: "/transport/fleet", label: "Fleet (Vehicles)" },
  { href: "/transport/drivers", label: "Drivers" },
  { href: "/transport/routes", label: "Routes & Stops" },
];

export function TransportSubnav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-1.5 rounded-xl border border-border/70 bg-card p-1.5">
      {ITEMS.map((it) => {
        const active = it.href === "/transport" ? pathname === "/transport" : pathname.startsWith(it.href);
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

export function TransportPageShell({
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
      <TransportSubnav />
      <div className="space-y-4">{children}</div>
    </div>
  );
}