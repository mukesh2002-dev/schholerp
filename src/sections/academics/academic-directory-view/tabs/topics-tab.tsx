"use client";

import React, { useState, useMemo } from "react";
import { BackendTopic } from "@/lib/api/topics";
import { BackendChapter } from "@/lib/api/chapters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Edit3,
  Trash2,
  FileText,
  Clock,
  Hash,
  GraduationCap,
  BookOpen,
  Search,
  ListTree,
  TableProperties,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";

interface TopicsTabProps {
  topics: BackendTopic[];
  chapters?: BackendChapter[];
  subjects?: any[];
  classes?: any[];
  chapterFilter?: string;
  classFilter?: string;
  subjectFilter?: string;
  onChapterFilterChange?: (val: string) => void;
  onClassFilterChange?: (val: string) => void;
  onSubjectFilterChange?: (val: string) => void;
  canEdit: boolean;
  onAddTopic: (chapterUuid?: string) => void;
  onEditTopic: (top: BackendTopic) => void;
  onDeleteTopic: (uuid: string, title: string) => void;
}

export function TopicsTab({
  topics,
  chapters = [],
  subjects = [],
  classes = [],
  chapterFilter = "ALL",
  classFilter = "ALL",
  subjectFilter = "ALL",
  onChapterFilterChange,
  onClassFilterChange,
  onSubjectFilterChange,
  canEdit,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: TopicsTabProps) {
  const [viewMode, setViewMode] = useState<"hierarchy" | "table">("hierarchy");
  const [search, setSearch] = useState("");
  const [collapsedClassKeys, setCollapsedClassKeys] = useState<Set<string>>(new Set());
  const [collapsedSubjectKeys, setCollapsedSubjectKeys] = useState<Set<string>>(new Set());

  const toggleClassCollapse = (key: string) => {
    setCollapsedClassKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSubjectCollapse = (key: string) => {
    setCollapsedSubjectKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setCollapsedClassKeys(new Set());
    setCollapsedSubjectKeys(new Set());
  };

  const collapseAll = () => {
    const allClassKeys = new Set<string>();
    const allSubKeys = new Set<string>();
    groupedHierarchy.forEach((group) => {
      allClassKeys.add(group.className);
      group.subjects.forEach((sub) => {
        allSubKeys.add(`${group.className}:::${sub.subjectName}`);
      });
    });
    setCollapsedClassKeys(allClassKeys);
    setCollapsedSubjectKeys(allSubKeys);
  };

  // Helper to extract metadata for a topic
  const getTopicMetadata = (top: any) => {
    const chapter = top.chapter;
    const subject = chapter?.subject;
    const directClass = subject?.class;
    const mappedClass = subject?.classSubjects?.[0]?.class;

    const matchedClass =
      directClass ||
      mappedClass ||
      classes.find((c: any) => c.id === subject?.classId || c.uuid === subject?.classId);

    const className = matchedClass?.name || "General / Core Curriculum";
    const classId = matchedClass?.uuid || matchedClass?.id || "common";

    const subjectName = subject?.name || "General Subject";
    const subjectCode = subject?.code || "";
    const subjectUuid = subject?.uuid || "";

    const chapterNumber = chapter?.chapterNumber || 1;
    const chapterTitle = chapter?.title
      ? `Ch.${chapterNumber}: ${chapter.title}`
      : "Chapter Overview";
    const chapterUuid = chapter?.uuid || top.chapterId || "";

    return {
      className,
      classId,
      subjectName,
      subjectCode,
      subjectUuid,
      chapterTitle,
      chapterUuid,
      chapterNumber,
    };
  };

  // Filter topics by local search, classFilter, subjectFilter, chapterFilter
  const filteredTopics = useMemo(() => {
    return topics.filter((t: any) => {
      const meta = getTopicMetadata(t);

      // Class filter
      if (classFilter !== "ALL" && meta.classId !== classFilter && meta.className !== classFilter) {
        return false;
      }
      // Subject filter
      if (subjectFilter !== "ALL" && meta.subjectUuid !== subjectFilter && meta.subjectName !== subjectFilter) {
        return false;
      }
      // Chapter filter
      if (chapterFilter !== "ALL" && meta.chapterUuid !== chapterFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = t.title && t.title.toLowerCase().includes(q);
        const descMatch = t.description && t.description.toLowerCase().includes(q);
        const chapMatch = meta.chapterTitle.toLowerCase().includes(q);
        const subMatch = meta.subjectName.toLowerCase().includes(q);
        const classMatch = meta.className.toLowerCase().includes(q);
        return titleMatch || descMatch || chapMatch || subMatch || classMatch;
      }

      return true;
    });
  }, [topics, search, classFilter, subjectFilter, chapterFilter, classes]);

  // Group topics hierarchically: Class ➔ Subject ➔ Chapter ➔ Topics
  const groupedHierarchy = useMemo(() => {
    interface SubjectGroup {
      subjectName: string;
      code: string;
      subjectUuid: string;
      chapters: Array<{
        chapterTitle: string;
        chapterUuid: string;
        chapterNumber: number;
        topics: BackendTopic[];
      }>;
      totalTopics: number;
    }

    interface ClassGroup {
      className: string;
      classId: string;
      subjects: SubjectGroup[];
      totalTopics: number;
      totalChapters: number;
    }

    const classMap = new Map<string, {
      className: string;
      classId: string;
      subjectMap: Map<string, {
        subjectName: string;
        code: string;
        subjectUuid: string;
        chapterMap: Map<string, {
          chapterTitle: string;
          chapterUuid: string;
          chapterNumber: number;
          topics: BackendTopic[];
        }>;
      }>;
    }>();

    for (const top of filteredTopics) {
      const {
        className,
        classId,
        subjectName,
        subjectCode,
        subjectUuid,
        chapterTitle,
        chapterUuid,
        chapterNumber,
      } = getTopicMetadata(top);

      if (!classMap.has(className)) {
        classMap.set(className, {
          className,
          classId,
          subjectMap: new Map(),
        });
      }

      const classEntry = classMap.get(className)!;
      if (!classEntry.subjectMap.has(subjectName)) {
        classEntry.subjectMap.set(subjectName, {
          subjectName,
          code: subjectCode,
          subjectUuid,
          chapterMap: new Map(),
        });
      }

      const subjectEntry = classEntry.subjectMap.get(subjectName)!;
      if (!subjectEntry.chapterMap.has(chapterTitle)) {
        subjectEntry.chapterMap.set(chapterTitle, {
          chapterTitle,
          chapterUuid,
          chapterNumber,
          topics: [],
        });
      }

      const chapterEntry = subjectEntry.chapterMap.get(chapterTitle)!;
      chapterEntry.topics.push(top);
    }

    // Convert map to clean array
    const result: ClassGroup[] = [];
    classMap.forEach((cVal) => {
      const subjectsArr: SubjectGroup[] = [];
      let classTopicCount = 0;
      let classChapterCount = 0;

      cVal.subjectMap.forEach((sVal) => {
        const chaptersArr: Array<{
          chapterTitle: string;
          chapterUuid: string;
          chapterNumber: number;
          topics: BackendTopic[];
        }> = [];
        let subTopicCount = 0;

        sVal.chapterMap.forEach((chVal) => {
          // Sort topics by topicOrder
          chVal.topics.sort((a, b) => (a.topicOrder || 0) - (b.topicOrder || 0));
          chaptersArr.push(chVal);
          subTopicCount += chVal.topics.length;
        });

        // Sort chapters by chapterNumber
        chaptersArr.sort((a, b) => a.chapterNumber - b.chapterNumber);

        subjectsArr.push({
          subjectName: sVal.subjectName,
          code: sVal.code,
          subjectUuid: sVal.subjectUuid,
          chapters: chaptersArr,
          totalTopics: subTopicCount,
        });

        classTopicCount += subTopicCount;
        classChapterCount += chaptersArr.length;
      });

      result.push({
        className: cVal.className,
        classId: cVal.classId,
        subjects: subjectsArr,
        totalTopics: classTopicCount,
        totalChapters: classChapterCount,
      });
    });

    return result;
  }, [filteredTopics, classes]);

  return (
    <div className="space-y-4">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col gap-3 pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Hash className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>Learning Topics</span>
                <Badge variant="outline" className="text-xs bg-muted/40 font-mono">
                  {topics.length} Total Topics
                </Badge>
                {classFilter !== "ALL" && (
                  <Badge variant="secondary" className="text-xs">
                    Class Filtered
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-muted-foreground">
                Class ➔ Subject ➔ Chapter ➔ Learning Topics breakdown.
              </p>
            </div>
          </div>

          {/* Action buttons & View Switcher */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/30">
              <Button
                variant={viewMode === "hierarchy" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5 font-medium"
                onClick={() => setViewMode("hierarchy")}
              >
                <ListTree className="h-3.5 w-3.5 text-primary" />
                <span>Hierarchy View</span>
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs px-2.5 gap-1.5 font-medium"
                onClick={() => setViewMode("table")}
              >
                <TableProperties className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Table View</span>
              </Button>
            </div>

            {canEdit && (
              <Button
                size="sm"
                variant="gradient"
                className="h-8 text-xs gap-1.5"
                onClick={() => onAddTopic()}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Topic</span>
              </Button>
            )}
          </div>
        </div>

        {/* Search & Quick Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search topics, concepts, chapters, subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs bg-card"
            />
          </div>

          {/* Class Filter */}
          {onClassFilterChange && classes.length > 0 && (
            <div className="w-36">
              <Select value={classFilter} onValueChange={onClassFilterChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      🎓 {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject Filter */}
          {onSubjectFilterChange && subjects.length > 0 && (
            <div className="w-36">
              <Select value={subjectFilter} onValueChange={onSubjectFilterChange}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Subjects</SelectItem>
                  {subjects.map((sub: any) => (
                    <SelectItem key={sub.id || sub.uuid} value={sub.id || sub.uuid}>
                      📖 {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {viewMode === "hierarchy" && groupedHierarchy.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
              <button
                type="button"
                onClick={expandAll}
                className="hover:text-foreground hover:underline transition-colors px-1"
              >
                Expand All
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={collapseAll}
                className="hover:text-foreground hover:underline transition-colors px-1"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <EmptyState
          title="No Learning Topics Found"
          description={
            search
              ? `No learning topics matched "${search}".`
              : "No topics found under this selection. Create topics under chapters to build lecture milestones."
          }
          actionLabel={canEdit ? "Add First Topic" : undefined}
          onAction={() => onAddTopic()}
        />
      ) : viewMode === "hierarchy" ? (
        /* ========================================================================= */
        /* HIERARCHICAL VIEW: CLASS ➔ SUBJECT ➔ CHAPTER ➔ TOPICS                     */
        /* ========================================================================= */
        <div className="space-y-5">
          {groupedHierarchy.map((classGroup) => {
            const isClassCollapsed = collapsedClassKeys.has(classGroup.className);

            return (
              <div
                key={classGroup.className}
                className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs transition-all"
              >
                {/* 1. Class Header Level */}
                <div
                  className="flex items-center justify-between p-3.5 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors border-b border-border/60"
                  onClick={() => toggleClassCollapse(classGroup.className)}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    >
                      {isClassCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground">
                        {classGroup.className}
                      </h4>
                      <Badge variant="outline" className="text-[11px] font-mono bg-background">
                        {classGroup.subjects.length} Subject{classGroup.subjects.length > 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="secondary" className="text-[11px] font-mono">
                        {classGroup.totalTopics} Topic{classGroup.totalTopics > 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>

                  <span className="text-xs text-muted-foreground font-medium">
                    {isClassCollapsed ? "Click to Expand" : "Click to Collapse"}
                  </span>
                </div>

                {/* 2. Subjects Under Class Level */}
                {!isClassCollapsed && (
                  <div className="p-4 space-y-4 bg-card">
                    {classGroup.subjects.map((sub) => {
                      const subKey = `${classGroup.className}:::${sub.subjectName}`;
                      const isSubCollapsed = collapsedSubjectKeys.has(subKey);

                      return (
                        <div
                          key={sub.subjectName}
                          className="rounded-lg border border-border/70 bg-muted/10 overflow-hidden shadow-2xs"
                        >
                          {/* Subject Header */}
                          <div
                            className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50"
                            onClick={() => toggleSubjectCollapse(subKey)}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                className="p-0.5 rounded text-muted-foreground hover:text-foreground"
                              >
                                {isSubCollapsed ? (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <BookOpen className="h-4 w-4 text-purple-500" />
                              <span className="text-xs font-bold text-foreground">
                                {sub.subjectName}
                              </span>
                              {sub.code && (
                                <Badge variant="outline" className="text-[10px] font-mono">
                                  {sub.code}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-[10px]">
                                {sub.totalTopics} Topic{sub.totalTopics > 1 ? "s" : ""}
                              </Badge>
                            </div>

                            <span className="text-[11px] text-muted-foreground">
                              {sub.chapters.length} Chapter{sub.chapters.length > 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* 3. Chapters & Topics under Subject */}
                          {!isSubCollapsed && (
                            <div className="p-3 space-y-3">
                              {sub.chapters.map((chap) => (
                                <div
                                  key={chap.chapterTitle}
                                  className="rounded-md border border-border/60 bg-card p-3 space-y-2.5"
                                >
                                  {/* Chapter Title Bar */}
                                  <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                                    <div className="flex items-center gap-1.5">
                                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                                      <span className="text-xs font-semibold text-foreground">
                                        {chap.chapterTitle}
                                      </span>
                                      <Badge variant="outline" className="text-[10px] bg-muted/30">
                                        {chap.topics.length} Topics
                                      </Badge>
                                    </div>

                                    {canEdit && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-[11px] px-2 gap-1 text-primary hover:bg-primary/10"
                                        onClick={() => onAddTopic(chap.chapterUuid)}
                                      >
                                        <Plus className="h-3 w-3" />
                                        <span>Add Topic</span>
                                      </Button>
                                    )}
                                  </div>

                                  {/* Topics Under Chapter */}
                                  <div className="space-y-1.5 pt-1">
                                    {chap.topics.map((t: any) => (
                                      <div
                                        key={t.uuid}
                                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                                      >
                                        <div className="flex items-start gap-2.5 min-w-0">
                                          <span className="h-6 w-6 rounded bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                            #{t.topicOrder}
                                          </span>
                                          <div className="min-w-0">
                                            <h5 className="text-xs font-semibold text-foreground truncate">
                                              {t.title}
                                            </h5>
                                            {t.description && (
                                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                                {t.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                            <Clock className="h-3 w-3" />
                                            {t.estimatedClasses || 1} lecture{t.estimatedClasses > 1 ? "s" : ""}
                                          </span>
                                          <Badge
                                            variant={t.status === "ACTIVE" ? "default" : "outline"}
                                            className="text-[10px] py-0 px-1.5"
                                          >
                                            {t.status || "ACTIVE"}
                                          </Badge>

                                          {canEdit && (
                                            <div className="flex items-center gap-0.5 pl-1 border-l border-border/40">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 hover:bg-muted"
                                                onClick={() => onEditTopic(t)}
                                                title="Edit topic"
                                              >
                                                <Edit3 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                                onClick={() => onDeleteTopic(t.uuid, t.title)}
                                                title="Delete topic"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ========================================================================= */
        /* TABLE VIEW (ALTERNATIVE QUICK SCAN)                                       */
        /* ========================================================================= */
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Order</TableHead>
                  <TableHead>Topic Title & Concept</TableHead>
                  <TableHead>Class & Subject</TableHead>
                  <TableHead>Chapter</TableHead>
                  <TableHead>Est. Classes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopics.map((top: any) => {
                  const meta = getTopicMetadata(top);

                  return (
                    <TableRow key={top.uuid}>
                      <TableCell className="font-mono text-xs font-semibold">
                        <span className="h-6 w-6 rounded bg-muted/60 flex items-center justify-center text-xs">
                          #{top.topicOrder}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-semibold text-sm text-foreground block">
                            {top.title}
                          </span>
                          {top.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {top.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="outline"
                            className="text-[11px] gap-1 font-medium bg-primary/5 text-primary border-primary/20"
                          >
                            <GraduationCap className="h-3 w-3" />
                            <span>{meta.className}</span>
                          </Badge>
                          <Badge variant="secondary" className="text-[11px] gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{meta.subjectName}</span>
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{meta.chapterTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground font-medium">
                          <Clock className="h-3 w-3" />
                          {top.estimatedClasses || 1} lecture{top.estimatedClasses > 1 ? "s" : ""}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {top.status || "ACTIVE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canEdit && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => onEditTopic(top)}
                              title="Edit topic"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => onDeleteTopic(top.uuid, top.title)}
                              title="Delete topic"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
