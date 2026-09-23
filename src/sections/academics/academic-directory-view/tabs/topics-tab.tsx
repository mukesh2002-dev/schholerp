"use client";

import React from "react";
import { BackendTopic } from "@/lib/api/topics";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Edit3, Trash2, Hash } from "lucide-react";

interface TopicsTabProps {
  topics: BackendTopic[];
  chapterFilter: string;
  canEdit: boolean;
  onAddTopic: () => void;
  onEditTopic: (top: BackendTopic) => void;
  onDeleteTopic: (uuid: string, title: string) => void;
}

export function TopicsTab({
  topics,
  chapterFilter,
  canEdit,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: TopicsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Hash className="h-4 w-4 text-primary" />
            <span>Learning Topics</span>
            {chapterFilter !== "ALL" && (
              <Badge variant="outline" className="text-xs">
                Chapter Filtered
              </Badge>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            Specific learning milestones and class lecture concepts.
          </p>
        </div>
        {canEdit && (
          <Button
            size="sm"
            variant="gradient"
            className="h-8 text-xs gap-1.5"
            onClick={onAddTopic}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Topic</span>
          </Button>
        )}
      </div>

      {topics.length === 0 ? (
        <EmptyState
          title="No Topics Found"
          description="Define topics under curriculum chapters (e.g. Euclid's Division Lemma)."
          actionLabel={canEdit ? "Add Topic" : undefined}
          onAction={onAddTopic}
        />
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Topic Title</TableHead>
                  <TableHead>Est. Classes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((top: any) => (
                  <TableRow key={top.uuid}>
                    <TableCell className="font-mono text-xs font-semibold">
                      #{top.topicOrder}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold text-sm text-foreground block">
                          {top.title}
                        </span>
                        {top.description && (
                          <span className="text-xs text-muted-foreground">
                            {top.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {top.estimatedClasses || 1} classes
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {top.status}
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
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteTopic(top.uuid, top.title)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
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
