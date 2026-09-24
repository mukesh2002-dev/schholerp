"use client";

import React from "react";
import Link from "next/link";
import { ClassRoom } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduationCap, DoorClosed, Layers, Users, Eye, Edit3, Trash2, Plus } from "lucide-react";

interface ClassesTabProps {
  classes: ClassRoom[];
  canEdit: boolean;
  onAddClass: () => void;
  onEditClass: (c: ClassRoom) => void;
  onDeleteClass: (c: ClassRoom) => void;
}

export function ClassesTab({
  classes,
  canEdit,
  onAddClass,
  onEditClass,
  onDeleteClass,
}: ClassesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground">Academic Classes & Grades</h3>
        {canEdit && (
          <Button
            size="sm"
            variant="gradient"
            className="h-8 text-xs gap-1.5"
            onClick={onAddClass}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Class</span>
          </Button>
        )}
      </div>

      {classes.length === 0 ? (
        <EmptyState
          title="No Classes Found"
          description="Create your first academic class. Each class supports multiple sections and curriculum subjects."
          actionLabel={canEdit ? "Add Class" : undefined}
          onAction={onAddClass}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((c) => {
            const sectionNames = c.sections.map((s) => s.name.replace(/^Section\s+/i, "")).join(", ");
            return (
              <Card
                key={c.id}
                className="border-border/80 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        {c.name}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-foreground/80">{c.branchName}</span>
                        <span>•</span>
                        <span>{c.category || "General"}</span>
                        {c.academicYear && (
                          <>
                            <span>•</span>
                            <span className="text-muted-foreground">{c.academicYear}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={c.status === "Active" ? "default" : "outline"}
                      className="text-[10px] shrink-0"
                    >
                      {c.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="p-2.5 rounded-lg bg-muted/40 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DoorClosed className="h-3 w-3 text-blue-500" />
                        Sections ({c.sections.length}):
                      </span>
                      <span className="font-semibold text-foreground">
                        {sectionNames ? `Sec ${sectionNames}` : "None"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-purple-500" />
                        Assigned Subjects:
                      </span>
                      <span className="font-semibold text-foreground">
                        {c.subjects.length} subjects
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-emerald-500" />
                        Students / Capacity:
                      </span>
                      <span className="font-semibold text-foreground">
                        {c.totalStudents} / {c.capacity || 40}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs gap-1.5">
                      <Link href={`/classes/${c.id}`}>
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </Link>
                    </Button>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onEditClass(c)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteClass(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
