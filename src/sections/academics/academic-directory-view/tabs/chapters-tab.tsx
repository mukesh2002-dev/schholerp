"use client";

import React, { useState, useMemo } from "react";
import { BackendChapter } from "@/lib/api/chapters";
import { BackendTopic } from "@/lib/api/topics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Plus,
  Edit3,
  Trash2,
  FileText,
  Hash,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  LayoutGrid,
  ListTree,
  Clock,
  Sparkles,
} from "lucide-react";

interface ChaptersTabProps {
  chapters: BackendChapter[];
  subjects: any[];
  classes?: any[];
  classFilter?: string;
  subjectFilter: string;
  canEdit: boolean;
  onAddChapter: () => void;
  onEditChapter: (ch: BackendChapter) => void;
  onDeleteChapter: (uuid: string, title: string) => void;
  onViewTopics: (chapterUuid: string) => void;
  onAddTopic?: (chapterUuid: string) => void;
  onEditTopic?: (top: BackendTopic) => void;
  onDeleteTopic?: (uuid: string, title: string) => void;
}

export function ChaptersTab({
  chapters,
  subjects,
  classes = [],
  classFilter = "ALL",
  subjectFilter,
  canEdit,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onViewTopics,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: ChaptersTabProps) {
  const [viewMode, setViewMode] = useState<"hierarchy" | "cards">("hierarchy");
  const [localSearch, setLocalSearch] = useState("");
  // Track expanded chapters for inline topics view
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(new Set());
  // Track collapsed classes in hierarchy view
  const [collapsedClassKeys, setCollapsedClassKeys] = useState<Set<string>>(new Set());

  const toggleChapterExpand = (uuid: string) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  };

  const toggleClassCollapse = (key: string) => {
    setCollapsedClassKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedChapterIds(new Set(chapters.map((c) => c.uuid)));
    setCollapsedClassKeys(new Set());
  };

  const collapseAll = () => {
    setExpandedChapterIds(new Set());
  };

  // Helper to extract Class & Subject info from chapter
  const getChapterMetadata = (ch: any) => {
    const subjectObj = subjects.find((s: any) => s.id === ch.subjectId || s.uuid === ch.subjectId) || ch.subject;
    const className =
      ch.subject?.class?.name ||
      ch.subject?.classSubjects?.[0]?.class?.name ||
      subjectObj?.className ||
      subjectObj?.class?.name ||
      classes.find((c: any) => c.id === subjectObj?.classId)?.name ||
      "General / Core";

    const classId =
      ch.subject?.class?.uuid ||
      ch.subject?.classSubjects?.[0]?.class?.uuid ||
      subjectObj?.classId ||
      subjectObj?.class?.uuid ||
      classes.find((c: any) => c.name === className)?.id ||
      "common";

    const subjectName = ch.subject?.name || subjectObj?.name || "Subject";
    const subjectCode = ch.subject?.code || subjectObj?.code || "";

    return { className, classId, subjectName, subjectCode };
  };

  // Filter chapters locally by search
  const filteredChapters = useMemo(() => {
    return chapters.filter((ch: any) => {
      if (!localSearch.trim()) return true;
      const q = localSearch.toLowerCase();
      const meta = getChapterMetadata(ch);
      return (
        ch.title.toLowerCase().includes(q) ||
        (ch.description && ch.description.toLowerCase().includes(q)) ||
        meta.className.toLowerCase().includes(q) ||
        meta.subjectName.toLowerCase().includes(q) ||
        (Array.isArray(ch.topics) && ch.topics.some((t: any) => t.title.toLowerCase().includes(q)))
      );
    });
  }, [chapters, localSearch, subjects, classes]);

  // Group chapters hierarchically: Class -> Subject -> Chapters
  const groupedHierarchy = useMemo(() => {
    const classMap = new Map<string, { className: string; subjectMap: Map<string, { subjectName: string; code: string; chapters: any[]; totalTopics: number }> }>();

    for (const ch of filteredChapters) {
      const { className, subjectName, subjectCode } = getChapterMetadata(ch);
      const classKey = className || "Common";

      if (!classMap.has(classKey)) {
        classMap.set(classKey, { className: classKey, subjectMap: new Map() });
      }

      const classEntry = classMap.get(classKey)!;
      const subjectKey = subjectName || "General Subject";

      if (!classEntry.subjectMap.has(subjectKey)) {
        classEntry.subjectMap.set(subjectKey, {
          subjectName: subjectKey,
          code: subjectCode,
          chapters: [],
          totalTopics: 0,
        });
      }

      const subjectEntry = classEntry.subjectMap.get(subjectKey)!;
      subjectEntry.chapters.push(ch);
      const topicsCount = ch._count?.topics ?? (Array.isArray(ch.topics) ? ch.topics.length : 0);
      subjectEntry.totalTopics += topicsCount;
    }

    // Convert map to sorted array
    const result: Array<{
      classKey: string;
      className: string;
      totalChapters: number;
      totalTopics: number;
      subjects: Array<{
        subjectKey: string;
        subjectName: string;
        code: string;
        chapters: any[];
        totalTopics: number;
      }>;
    }> = [];

    for (const [classKey, entry] of classMap.entries()) {
      const subjectList = Array.from(entry.subjectMap.entries()).map(([subKey, subVal]) => ({
        subjectKey: subKey,
        subjectName: subVal.subjectName,
        code: subVal.code,
        chapters: subVal.chapters.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0)),
        totalTopics: subVal.totalTopics,
      }));

      const totalChapters = subjectList.reduce((acc, s) => acc + s.chapters.length, 0);
      const totalTopics = subjectList.reduce((acc, s) => acc + s.totalTopics, 0);

      result.push({
        classKey,
        className: entry.className,
        totalChapters,
        totalTopics,
        subjects: subjectList.sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
      });
    }

    return result.sort((a, b) => a.className.localeCompare(b.className));
  }, [filteredChapters, subjects, classes]);

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-1 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Curriculum & Syllabus</span>
                <Badge variant="outline" className="text-xs bg-muted/40 font-mono">
                  {chapters.length} Chapters
                </Badge>
              </h3>
              <p className="text-xs text-muted-foreground">
                Structured hierarchy of Classes → Subjects → Chapters → Learning Topics.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher & Action buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search chapters or topics..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-card"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border/80 p-0.5 bg-muted/40">
            <button
              onClick={() => setViewMode("hierarchy")}
              title="Hierarchy View (Class → Subject → Chapter → Topic)"
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "hierarchy"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTree className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Hierarchy</span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              title="Card Grid View"
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>

          {viewMode === "hierarchy" && chapters.length > 0 && (
            <div className="hidden lg:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={collapseAll}>
                Collapse
              </Button>
            </div>
          )}

          {canEdit && (
            <Button size="sm" variant="gradient" className="h-8 text-xs gap-1.5" onClick={onAddChapter}>
              <Plus className="h-3.5 w-3.5" />
              <span>Add Chapter</span>
            </Button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredChapters.length === 0 ? (
        <EmptyState
          title="No Chapters Found"
          description={
            localSearch
              ? `No curriculum chapters matched "${localSearch}". Try clearing the search.`
              : "No chapters found for the selected filter. Create curriculum chapters for your classes and subjects."
          }
          actionLabel={canEdit ? "Add First Chapter" : undefined}
          onAction={onAddChapter}
        />
      ) : viewMode === "hierarchy" ? (
        /* ── VIEW 1: HIERARCHICAL TREE VIEW (Class -> Subject -> Chapter -> Topic) ── */
        <div className="space-y-6">
          {groupedHierarchy.map((classGroup) => {
            const isClassCollapsed = collapsedClassKeys.has(classGroup.classKey);

            return (
              <div
                key={classGroup.classKey}
                className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs shadow-xs overflow-hidden"
              >
                {/* Class Header Banner */}
                <div
                  onClick={() => toggleClassCollapse(classGroup.classKey)}
                  className="px-5 py-3.5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/60 flex items-center justify-between cursor-pointer select-none hover:bg-primary/15 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span>{classGroup.className}</span>
                        <Badge variant="outline" className="text-[11px] bg-background/80 font-normal">
                          {classGroup.subjects.length} Subjects
                        </Badge>
                        <Badge variant="outline" className="text-[11px] bg-background/80 font-normal">
                          {classGroup.totalChapters} Chapters
                        </Badge>
                        <Badge variant="outline" className="text-[11px] bg-background/80 font-normal">
                          {classGroup.totalTopics} Topics
                        </Badge>
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Curriculum structure and learning objectives for {classGroup.className}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                      {isClassCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Class Subjects Content */}
                {!isClassCollapsed && (
                  <div className="p-4 sm:p-5 space-y-6">
                    {classGroup.subjects.map((sub) => (
                      <div
                        key={sub.subjectKey}
                        className="rounded-xl border border-border/60 bg-background/50 p-4 space-y-3.5"
                      >
                        {/* Subject Header */}
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/40">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                              <BookOpen className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-bold text-sm text-foreground flex items-center gap-2">
                                <span>{sub.subjectName}</span>
                                {sub.code && (
                                  <Badge variant="secondary" className="text-[10px] font-mono">
                                    {sub.code}
                                  </Badge>
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {sub.chapters.length} chapter(s) • {sub.totalTopics} learning topic(s)
                              </span>
                            </div>
                          </div>

                          {canEdit && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1"
                              onClick={onAddChapter}
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Chapter</span>
                            </Button>
                          )}
                        </div>

                        {/* Chapters under this Subject */}
                        <div className="grid grid-cols-1 gap-2.5">
                          {sub.chapters.map((ch: any) => {
                            const isExpanded = expandedChapterIds.has(ch.uuid);
                            const topicCount = ch._count?.topics ?? (Array.isArray(ch.topics) ? ch.topics.length : 0);
                            const topicsList: BackendTopic[] = Array.isArray(ch.topics) ? ch.topics : [];

                            return (
                              <div
                                key={ch.uuid}
                                className={`rounded-xl border transition-all ${
                                  isExpanded
                                    ? "border-primary/40 bg-card shadow-xs"
                                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                                }`}
                              >
                                {/* Chapter Main Row */}
                                <div className="p-3 sm:p-3.5 flex items-start sm:items-center justify-between gap-3">
                                  <div
                                    className="flex items-start sm:items-center gap-3 flex-1 cursor-pointer select-none"
                                    onClick={() => toggleChapterExpand(ch.uuid)}
                                  >
                                    <button className="mt-0.5 sm:mt-0 text-muted-foreground hover:text-foreground">
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-primary" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </button>

                                    <div className="h-7 w-7 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold flex items-center justify-center shrink-0">
                                      {ch.chapterNumber}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm text-foreground">
                                          {ch.title}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] ${
                                            topicCount > 0
                                              ? "bg-primary/5 text-primary border-primary/20"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          <Hash className="h-2.5 w-2.5 mr-0.5 inline" />
                                          {topicCount} topics
                                        </Badge>
                                        <Badge
                                          variant="outline"
                                          className="text-[10px] font-normal text-muted-foreground"
                                        >
                                          {ch.status || "ACTIVE"}
                                        </Badge>
                                      </div>
                                      {ch.description && (
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                          {ch.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Chapter action buttons */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      variant={isExpanded ? "secondary" : "ghost"}
                                      size="sm"
                                      className="h-7 text-xs gap-1 px-2.5"
                                      onClick={() => toggleChapterExpand(ch.uuid)}
                                    >
                                      <Hash className="h-3 w-3" />
                                      <span className="hidden sm:inline">
                                        {isExpanded ? "Hide Topics" : "Topics"}
                                      </span>
                                    </Button>

                                    {canEdit && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => onEditChapter(ch)}
                                          title="Edit chapter"
                                        >
                                          <Edit3 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                                          onClick={() => onDeleteChapter(ch.uuid, ch.title)}
                                          title="Delete chapter"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Topics List right inside Chapter */}
                                {isExpanded && (
                                  <div className="px-4 pb-4 pt-1 border-t border-border/50 bg-muted/20 space-y-2.5 animate-in fade-in duration-200">
                                    <div className="flex items-center justify-between pt-1">
                                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        <span>Learning Topics for Ch.{ch.chapterNumber}: {ch.title}</span>
                                      </span>
                                      {canEdit && onAddTopic && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-6 text-[11px] gap-1 px-2"
                                          onClick={() => onAddTopic(ch.uuid)}
                                        >
                                          <Plus className="h-3 w-3" />
                                          <span>Add Topic</span>
                                        </Button>
                                      )}
                                    </div>

                                    {topicsList.length === 0 ? (
                                      <div className="py-4 text-center border border-dashed border-border/60 rounded-lg bg-background/50">
                                        <p className="text-xs text-muted-foreground mb-1.5">
                                          No topics added for this chapter yet.
                                        </p>
                                        {canEdit && onAddTopic && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-xs text-primary"
                                            onClick={() => onAddTopic(ch.uuid)}
                                          >
                                            <Plus className="h-3 w-3 mr-1" /> Add first topic
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {topicsList.map((top: any, idx: number) => (
                                          <div
                                            key={top.uuid || idx}
                                            className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/60 hover:border-primary/20 text-xs"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <span className="h-5 w-5 rounded font-mono font-bold bg-muted flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
                                                #{top.topicOrder ?? idx + 1}
                                              </span>
                                              <div className="min-w-0">
                                                <span className="font-medium text-foreground block truncate">
                                                  {top.title}
                                                </span>
                                                {top.description && (
                                                  <span className="text-[11px] text-muted-foreground block truncate">
                                                    {top.description}
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                              {top.estimatedClasses && (
                                                <Badge variant="secondary" className="text-[10px] gap-1">
                                                  <Clock className="h-2.5 w-2.5" />
                                                  {top.estimatedClasses} class{top.estimatedClasses > 1 ? "es" : ""}
                                                </Badge>
                                              )}
                                              <Badge variant="outline" className="text-[10px]">
                                                {top.status || "ACTIVE"}
                                              </Badge>

                                              {canEdit && (
                                                <div className="flex items-center">
                                                  {onEditTopic && (
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0"
                                                      onClick={() => onEditTopic(top)}
                                                    >
                                                      <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                  {onDeleteTopic && (
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                                      onClick={() => onDeleteTopic(top.uuid, top.title)}
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── VIEW 2: CARD GRID VIEW (with clear Class & Subject badges) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredChapters.map((ch: any) => {
            const { className, subjectName } = getChapterMetadata(ch);
            const isExpanded = expandedChapterIds.has(ch.uuid);
            const topicCount = ch._count?.topics ?? (Array.isArray(ch.topics) ? ch.topics.length : 0);
            const topicsList: BackendTopic[] = Array.isArray(ch.topics) ? ch.topics : [];

            return (
              <Card
                key={ch.uuid}
                className="border-border/80 hover:border-primary/40 shadow-2xs flex flex-col justify-between transition-all"
              >
                <CardHeader className="pb-2 space-y-2">
                  {/* Prominent Class and Subject Header Badges */}
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1">
                        <GraduationCap className="h-3 w-3" />
                        <span>{className}</span>
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-medium gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{subjectName}</span>
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {ch.status || "ACTIVE"}
                    </Badge>
                  </div>

                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                      <span>Ch.{ch.chapterNumber}: {ch.title}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {topicCount} topics
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {ch.description || "No description provided"}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="pt-2 border-t border-border/40 mt-2 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant={isExpanded ? "secondary" : "outline"}
                      size="sm"
                      className="flex-1 h-7 text-xs gap-1"
                      onClick={() => toggleChapterExpand(ch.uuid)}
                    >
                      <Hash className="h-3 w-3" />
                      <span>{isExpanded ? "Hide Topics" : `View Topics (${topicCount})`}</span>
                    </Button>

                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => onEditChapter(ch)}
                          title="Edit"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteChapter(ch.uuid, ch.title)}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Inline Expanded Topics */}
                  {isExpanded && (
                    <div className="pt-2 space-y-1.5 border-t border-border/40 text-xs">
                      {topicsList.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">No topics yet.</p>
                      ) : (
                        topicsList.map((t: any, idx: number) => (
                          <div key={t.uuid || idx} className="p-1.5 rounded bg-muted/30 flex items-center justify-between">
                            <span className="font-medium truncate">#{t.topicOrder || idx + 1} {t.title}</span>
                            {t.estimatedClasses && (
                              <span className="text-[10px] text-muted-foreground">{t.estimatedClasses}c</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
