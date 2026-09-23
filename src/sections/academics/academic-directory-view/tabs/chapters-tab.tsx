"use client";

import React from "react";
import { BackendChapter } from "@/lib/api/chapters";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Edit3, Trash2, FileText, Hash } from "lucide-react";

interface ChaptersTabProps {
  chapters: BackendChapter[];
  subjects: any[];
  subjectFilter: string;
  canEdit: boolean;
  onAddChapter: () => void;
  onEditChapter: (ch: BackendChapter) => void;
  onDeleteChapter: (uuid: string, title: string) => void;
  onViewTopics: (chapterUuid: string) => void;
}

export function ChaptersTab({
  chapters,
  subjects,
  subjectFilter,
  canEdit,
  onAddChapter,
  onEditChapter,
  onDeleteChapter,
  onViewTopics,
}: ChaptersTabProps) {
  const filteredSubjectName = subjects.find((s: any) => s.id === subjectFilter)?.name;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span>Chapters</span>
            {subjectFilter !== "ALL" && (
              <Badge variant="outline" className="text-xs">
                {filteredSubjectName || "Subject Filtered"}
              </Badge>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            Subject-specific curriculum units and chapters.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="gradient"
            className="h-8 text-xs gap-1.5"
            onClick={onAddChapter}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Chapter</span>
          </Button>
        )}
      </div>

      {chapters.length === 0 ? (
        <EmptyState
          title="No Chapters Found"
          description="Select a subject and add chapters (e.g. Real Numbers, Polynomials)."
          actionLabel={canEdit ? "Add Chapter" : undefined}
          onAction={onAddChapter}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {chapters.map((ch: any) => (
            <Card
              key={ch.uuid}
              className="border-border/80 hover:border-primary/30 shadow-2xs"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Ch.{ch.chapterNumber}: {ch.title}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {ch._count?.topics ?? 0} topics
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {ch.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-1.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs gap-1"
                  onClick={() => onViewTopics(ch.uuid)}
                >
                  <Hash className="h-3 w-3" />
                  <span>View Topics</span>
                </Button>
                {canEdit && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => onEditChapter(ch)}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => onDeleteChapter(ch.uuid, ch.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
