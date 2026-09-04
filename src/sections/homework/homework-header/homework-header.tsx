"use client";

import React, { useState } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomeworkStatus } from "@/types";

export function HomeworkHeader({ onHomeworkAdded }: { onHomeworkAdded?: () => void }) {
  const { activeBranchId } = useERP();
  const homeworkList = mockDb.getHomeworkList(activeBranchId);
  const classes = mockDb.getClasses(activeBranchId);
  const teachers = mockDb.getTeachers(activeBranchId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newTeacherId, setNewTeacherId] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState("100");

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClassId || !newTeacherId || !newDueDate) return;

    const selectedClass = classes.find((c) => c.id === newClassId);
    const selectedTeacher = teachers.find((t) => t.id === newTeacherId);

    mockDb.addHomework({
      title: newTitle,
      description: newDescription,
      classId: newClassId,
      className: selectedClass?.name || "",
      sectionId: selectedClass?.sections[0]?.id || "sec-1",
      sectionName: selectedClass?.sections[0]?.name || "A",
      subjectId: selectedClass?.subjects[0]?.id || "sub-1",
      subjectName: selectedClass?.subjects[0]?.name || "General",
      teacherId: newTeacherId,
      teacherName: selectedTeacher?.fullName || "",
      branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId,
      branchName: selectedClass?.branchName || "Main Campus",
      assignedDate: new Date().toISOString(),
      dueDate: new Date(newDueDate).toISOString(),
      maxMarks: Number(newMaxMarks) || 100,
      status: "ACTIVE" as HomeworkStatus,
      attachments: [],
      submissions: [],
    });

    setDialogOpen(false);
    setNewTitle("");
    setNewDescription("");
    if (onHomeworkAdded) onHomeworkAdded();
  };

  return (
    <>
      <div className="space-y-4">
        <Breadcrumbs />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Homework &amp; Assignments
              </h1>
              <Badge variant="outline" className="text-xs">
                {homeworkList.length} Tasks
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Class homework tasks, student submissions, teacher grading, and due date tracking.
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)} variant="gradient" className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span>Create Homework</span>
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Assign New Homework</DialogTitle>
            <DialogDescription>
              Create an assignment task for a specific grade level and section cohort.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateHomework} className="space-y-3.5 mt-2">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Task Title</label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Trigonometry Problem Set"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Class Cohort</label>
                <Select value={newClassId} onValueChange={setNewClassId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Instructor</label>
                <Select value={newTeacherId} onValueChange={setNewTeacherId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Max Marks</label>
                <Input
                  type="number"
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Instructions</label>
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Detail the instructions or problem numbers..."
                rows={3}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="gradient">
                Publish Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
