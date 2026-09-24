"use client";

import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Trash2 } from "lucide-react";

interface MappingsTabProps {
  classSubjects: any[];
  canEdit: boolean;
  onAssign: () => void;
  onDeleteMapping: (uuid: string) => void;
}

export function MappingsTab({
  classSubjects,
  canEdit,
  onAssign,
  onDeleteMapping,
}: MappingsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-foreground">Class-Subject Mappings</h3>
          <p className="text-xs text-muted-foreground">
            Connect master subjects to academic classes with subject teachers.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={onAssign}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Assign Subject</span>
          </Button>
        )}
      </div>

      {classSubjects.length === 0 ? (
        <EmptyState
          title="No Class Mappings"
          description="Same Mathematics subject can be assigned to Class 10 Section A/B/C via mapping."
          actionLabel={canEdit ? "Assign Subject" : undefined}
          onAction={onAssign}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Subject Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classSubjects.map((cs: any) => (
                  <TableRow key={cs.uuid}>
                    <TableCell className="text-sm font-semibold">
                      {cs.class?.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {cs.subject?.name}{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        {cs.subject?.code ? `(${cs.subject.code})` : ""}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {cs.academicYear?.name || "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {cs.teacher?.name || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {cs.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:bg-destructive/10"
                          onClick={() => onDeleteMapping(cs.uuid)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
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
