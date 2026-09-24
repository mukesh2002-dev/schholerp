"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Edit3, Trash2, FileText } from "lucide-react";

interface SubjectsTabProps {
  subjects: any[];
  canEdit: boolean;
  onAddSubject: () => void;
  onEditSubject: (s: any) => void;
  onDeleteSubject: (s: any) => void;
  onViewChapters: (subjectId: string) => void;
}

export function SubjectsTab({
  subjects,
  canEdit,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onViewChapters,
}: SubjectsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-foreground">Master Subjects</h3>
          <p className="text-xs text-muted-foreground">
            Central subject master definitions reusable across classes and sections.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="gradient"
            className="h-8 text-xs gap-1.5"
            onClick={onAddSubject}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Subject</span>
          </Button>
        )}
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="No Subjects Found"
          description="Define master subjects like Mathematics, Physics, Chemistry to assign across classes."
          actionLabel={canEdit ? "Add Subject" : undefined}
          onAction={onAddSubject}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Max Marks</TableHead>
                  <TableHead>Pass Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-semibold text-sm text-foreground">
                      {s.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {s.code || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {s.subjectType || s.type || "THEORY"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{s.maxMarks ?? 100}</TableCell>
                    <TableCell className="text-xs">{s.passingMarks ?? 33}</TableCell>
                    <TableCell>
                      <Badge
                        variant={s.isActive !== false ? "secondary" : "outline"}
                        className="text-[10px]"
                      >
                        {s.isActive !== false ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => onViewChapters(s.id)}
                        >
                          <FileText className="h-3 w-3" />
                          <span>Chapters</span>
                        </Button>
                        {canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => onEditSubject(s)}
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => onDeleteSubject(s)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
