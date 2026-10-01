"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useERP } from "@/components/providers/erp-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AppImage } from "@/components/ui/app-image";
import { ListPagination } from "@/components/ui/list-pagination";
import { useCampusData } from "@/lib/hooks/use-campus-data";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatCurrency } from "@/lib/utils";
import { Search, X, CreditCard } from "lucide-react";
import { fetchStudents } from "@/lib/api/students";
import { fetchAssignments } from "@/lib/api/fees";
import { detectFeeSearchKind } from "@/lib/fees/fee-utils";

function statusVariant(status: string) {
  if (status === "PAID") return "success" as const;
  if (status === "PARTIAL" || status === "PARTIALLY_PAID") return "warning" as const;
  if (status === "OVERDUE") return "destructive" as const;
  return "secondary" as const;
}

export function StudentsTab() {
  const { activeBranchId } = useERP();
  const { data: students } = useCampusData({
    fetcher: (cid) => fetchStudents({ campusId: cid }).then((r) => r.data),
    campusId: activeBranchId,
    fallback: [],
    queryKeyPrefix: "students",
  });

  const { data: assignments, isLoading } = useCampusData({
    fetcher: (cid) => fetchAssignments({ campusId: cid }),
    campusId: activeBranchId,
    fallback: [] as Awaited<ReturnType<typeof fetchAssignments>>,
    queryKeyPrefix: "fee-assignments",
  });

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const assignmentByStudentUuid = useMemo(() => {
    const m = new Map<string, any>();
    for (const a of assignments) {
      if (a.student?.uuid) m.set(a.student.uuid, a);
    }
    return m;
  }, [assignments]);

  const filteredStudents = useMemo(() => {
    const q = debouncedSearch.trim();
    if (q.length < 2) return students;
    const kind = detectFeeSearchKind(q);
    const lower = q.toLowerCase();
    return (students as any[]).filter((s) => {
      const adm = (s.admissionNumber ?? "").toLowerCase();
      const roll = (s.rollNumber ?? "").toLowerCase();
      const name = (s.fullName ?? "").toLowerCase();
      const className = (s.className ?? "").toLowerCase();
      const sectionName = (s.sectionName ?? "").toLowerCase();
      const classSection = `${className} ${sectionName}`.trim();
      if (kind === "ADMISSION_NUMBER") {
        const digits = lower.replace(/\D/g, "");
        return adm.includes(lower) || roll.includes(lower) || (digits.length > 0 && (adm.includes(digits) || roll.includes(digits)));
      }
      if (kind === "CLASS_SECTION") {
        const normSpace = lower.replace(/-/g, " ").replace(/\s+/g, " ").trim();
        return classSection.includes(normSpace) || normSpace.split(" ").every((part) => classSection.includes(part));
      }
      return name.includes(lower);
    });
  }, [students, debouncedSearch]);

  const { page, totalPages, totalItems, pageItems, setPage } = usePagination(filteredStudents, 9);

  const dueOf = (a: any) => (a ? Number(a.totalAssigned ?? 0) - Number(a.discount ?? 0) - Number(a.totalPaid ?? 0) : 0);

  return (
    <div className="space-y-4">
      <Card className="p-3 border-border/80">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search — numbers → admission no, e.g. 10-A → class+section, else name…"
              className="pl-9 h-9 text-xs"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Badge variant="outline" className="text-[10px] hidden sm:flex">
            {filteredStudents.length} students
          </Badge>
        </div>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card className="border-dashed p-10 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">No results</h3>
            <p className="text-xs text-muted-foreground mt-1">Try admission number, class-section (10-A), or partial name.</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSearch("")}>Clear search</Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pageItems.map((stu: any) => {
              const a = assignmentByStudentUuid.get(stu.uuid ?? stu.id);
              const due = dueOf(a);
              const status = a?.discontinuedAt ? "DISCONTINUED" : a?.status ?? "NO PLAN";
              return (
                <Card key={stu.id ?? stu.uuid} className="border-border/70 hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <AppImage src={stu.avatar} alt={stu.fullName} className="h-11 w-11 rounded-xl ring-1 ring-border" />
                      <div className="flex-1 min-w-0">
                        <Link href={`/fees/${stu.uuid ?? stu.id}`} className="font-bold text-sm hover:text-primary transition-colors line-clamp-1">
                          {stu.fullName}
                        </Link>
                        <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-2">
                          <span className="font-mono">{stu.rollNumber}</span>
                          <span>• {stu.className}</span>
                          {stu.sectionName && <span>— {stu.sectionName}</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">Adm {stu.admissionNumber}</div>
                      </div>
                      <Badge variant={statusVariant(status)} className="text-[10px] shrink-0">{status}</Badge>
                    </div>

                    {a ? (
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-muted/40 border">
                          <div className="text-[10px] text-muted-foreground">Assigned</div>
                          <div className="font-bold font-mono text-xs">{formatCurrency(a.totalAssigned)}</div>
                          {Number(a.discount ?? 0) > 0 && <div className="text-[10px] text-emerald-600">−{formatCurrency(a.discount)} disc</div>}
                        </div>
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <div className="text-[10px] text-muted-foreground">Paid</div>
                          <div className="font-bold font-mono text-xs text-emerald-600">{formatCurrency(a.totalPaid ?? 0)}</div>
                        </div>
                        <div className={`p-2 rounded-lg border ${due > 0 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
                          <div className="text-[10px] text-muted-foreground">Due</div>
                          <div className={`font-bold font-mono text-xs ${due > 0 ? "text-amber-600" : "text-emerald-600"}`}>{formatCurrency(due)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-muted-foreground p-2 rounded-lg bg-muted/40 border text-center">
                        {isLoading ? "Loading fee plan…" : "No fee plan assigned yet — assign a structure first."}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 h-7 text-[11px]">
                        <Link href={`/fees/${stu.uuid ?? stu.id}`}>View Detail</Link>
                      </Button>
                      <Button asChild size="sm" className="flex-1 h-7 text-[11px] gap-1" disabled={a ? due <= 0 : true}>
                        <Link href={`/fees/${stu.uuid ?? stu.id}`}><CreditCard className="h-3 w-3" /> Pay</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ListPagination page={page} totalPages={totalPages} totalItems={totalItems} pageSize={9} onPageChange={setPage} label="students" />
        </>
      )}

    </div>
  );
}
