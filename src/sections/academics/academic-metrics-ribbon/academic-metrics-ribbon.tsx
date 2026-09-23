"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { fetchAcademicStats, AcademicStats } from "@/lib/api/classes";
import { Card } from "@/components/ui/card";
import { BookOpen, Layers, FileText, Hash, DoorClosed, Users } from "lucide-react";

export function AcademicMetricsRibbon() {
  const { activeBranchId } = useERP();
  const [stats, setStats] = useState<AcademicStats>({
    classes: 0,
    sections: 0,
    subjects: 0,
    chapters: 0,
    topics: 0,
    students: 0,
    classSubjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchAcademicStats(activeBranchId);
      if (data) setStats(data);
    } catch {
      // Fallback stays as default stats
    } finally {
      setLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    loadStats();

    const handleRefresh = () => {
      loadStats();
    };

    window.addEventListener("classes:refresh", handleRefresh);
    window.addEventListener("sections:refresh", handleRefresh);
    window.addEventListener("subjects:refresh", handleRefresh);
    window.addEventListener("class-subjects:refresh", handleRefresh);
    window.addEventListener("chapters:refresh", handleRefresh);
    window.addEventListener("topics:refresh", handleRefresh);

    return () => {
      window.removeEventListener("classes:refresh", handleRefresh);
      window.removeEventListener("sections:refresh", handleRefresh);
      window.removeEventListener("subjects:refresh", handleRefresh);
      window.removeEventListener("class-subjects:refresh", handleRefresh);
      window.removeEventListener("chapters:refresh", handleRefresh);
      window.removeEventListener("topics:refresh", handleRefresh);
    };
  }, [loadStats]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card className="p-4 border-border/70 shadow-2xs hover:border-blue-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Classes & Sections
          </span>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </div>
        <span className="text-2xl font-bold mt-1 block">
          {loading ? "..." : stats.classes}
        </span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
          <DoorClosed className="h-3 w-3 text-blue-400" />
          {loading ? "..." : stats.sections} active sections
        </span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Subject Master
          </span>
          <Layers className="h-4 w-4 text-purple-500" />
        </div>
        <span className="text-2xl font-bold mt-1 block">
          {loading ? "..." : stats.subjects}
        </span>
        <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 block">
          {loading ? "..." : stats.classSubjects} class mappings
        </span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Chapters
          </span>
          <FileText className="h-4 w-4 text-emerald-500" />
        </div>
        <span className="text-2xl font-bold mt-1 block">
          {loading ? "..." : stats.chapters}
        </span>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
          Curriculum units
        </span>
      </Card>

      <Card className="p-4 border-border/70 shadow-2xs hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Topics
          </span>
          <Hash className="h-4 w-4 text-amber-500" />
        </div>
        <span className="text-2xl font-bold mt-1 block">
          {loading ? "..." : stats.topics}
        </span>
        <span className="text-[11px] text-muted-foreground mt-0.5 block">
          Learning milestones
        </span>
      </Card>
    </div>
  );
}
