"use client";

import React, { useState, useEffect } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { SearchResultItem } from "@/types";
import {
  Building2,
  GraduationCap,
  Users,
  Briefcase,
  CreditCard,
  Bell,
  LayoutDashboard,
  Search,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="h-4 w-4" />,
  GraduationCap: <GraduationCap className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Fingerprint: <Fingerprint className="h-4 w-4" />,
};

export function GlobalSearchDialog() {
  const { searchOpen, setSearchOpen } = useERP();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) {
      // populate default recent navigation items if query is empty
      const res = mockDb.searchEntities(query.trim() || "campus");
      setResults(res.length > 0 ? res : mockDb.searchEntities("overview"));
    }
  }, [searchOpen, query]);

  const handleSelect = (item: SearchResultItem) => {
    setSearchOpen(false);
    setQuery("");
    if (item.href && item.href !== "#") {
      router.push(item.href);
    }
  };

  return (
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="p-0 w-[calc(100vw-2rem)] sm:max-w-2xl overflow-hidden border-border/80 shadow-2xl rounded-2xl bg-card">
        <div className="flex items-center px-4 border-b border-border bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campuses, student records, staff, fee invoices, notices..."
            className="h-14 w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No matching records or modules found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Search Results ({results.length})
              </div>
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-accent cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {iconMap[item.icon] || <Building2 className="h-4 w-4" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                        {item.badge && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/30 text-xs text-muted-foreground">
          <span>Navigate with ⌘K / Ctrl+K</span>
          <span>Press Enter to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
