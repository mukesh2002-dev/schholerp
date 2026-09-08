"use client";

import React, { useState } from "react";
import { mockDb } from "@/lib/services/mock-db";
import { Subject } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit3, GripVertical, CheckCircle2, Clock, BookMarked } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  classId: string;
  className: string;
  subject: Subject;
  onSuccess?: () => void;
}

export function TopicManagerDialog({ open, onOpenChange, classId, className, subject, onSuccess }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"PLANNED" | "IN_PROGRESS" | "COMPLETED">("PLANNED");
  const [editingId, setEditingId] = useState<string | null>(null);

  const topics = subject.topics || [];

  const resetForm = () => { setTitle(""); setDescription(""); setStatus("PLANNED"); setEditingId(null); };

  const handleAddOrUpdate = () => {
    if (!title.trim()) { toast.error("Topic title required"); return; }
    if (editingId) {
      const res = mockDb.saveTopic(classId, subject.id, { id: editingId, title: title.trim(), description: description.trim(), order: topics.find((t) => t.id === editingId)?.order || topics.length + 1, status });
      if (res) toast.success(`Topic "${title}" updated`);
    } else {
      const res = mockDb.saveTopic(classId, subject.id, { title: title.trim(), description: description.trim(), order: topics.length + 1, status });
      if (res) toast.success(`Topic "${title}" added to ${subject.name}`);
    }
    resetForm();
    onSuccess?.();
    window.dispatchEvent(new Event("subjects:refresh"));
    window.dispatchEvent(new Event("classes:refresh"));
  };

  const handleEdit = (t: any) => {
    setEditingId(t.id);
    setTitle(t.title);
    setDescription(t.description || "");
    setStatus(t.status || "PLANNED");
  };

  const handleDelete = (topicId: string) => {
    if (!confirm("Delete this topic?")) return;
    const ok = mockDb.deleteTopic(classId, subject.id, topicId);
    if (ok) {
      toast.success("Topic deleted");
      onSuccess?.();
      window.dispatchEvent(new Event("subjects:refresh"));
      window.dispatchEvent(new Event("classes:refresh"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-violet-600" /> Topics — {subject.name} <span className="text-xs font-mono text-muted-foreground">({subject.code})</span>
            </DialogTitle>
            <DialogDescription className="text-xs">{className} • {subject.teacherName} • {topics.length} topics — editable add / delete. Drag order not needed — order auto.</DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
          <Card className="p-3 bg-muted/30 border-dashed">
            <div className="text-xs font-semibold mb-2 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> {editingId ? "Edit Topic" : "Add New Topic"}</div>
            <div className="grid gap-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 1 — Real Numbers / Algebra — Linear Equations" className="h-9 text-sm" />
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description / learning outcomes" rows={2} />
              <div className="flex gap-2 items-center flex-wrap">
                <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                  <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNED">Planned</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddOrUpdate} variant="gradient" size="sm" className="h-8 gap-1">{editingId ? <><Edit3 className="h-3.5 w-3.5" /> Update</> : <><Plus className="h-3.5 w-3.5" /> Add Topic</>}</Button>
                {editingId && <Button variant="outline" size="sm" className="h-8" onClick={resetForm}>Cancel</Button>}
                <span className="text-[11px] text-muted-foreground">{topics.length} total</span>
              </div>
            </div>
          </Card>

          {topics.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground border rounded-xl bg-card">No topics yet — add chapter-wise topics for lesson planning.</div>
          ) : (
            <div className="space-y-2">
              {topics.sort((a, b) => a.order - b.order).map((t, idx) => (
                <div key={t.id} className="flex gap-3 p-3 rounded-xl border bg-card hover:border-primary/30 transition-colors group">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded">#{idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate flex items-center gap-2">
                      {t.title}
                      <Badge variant={t.status === "COMPLETED" ? "success" : t.status === "IN_PROGRESS" ? "warning" : "outline"} className="text-[10px] px-1 py-0 h-4">
                        {t.status === "COMPLETED" ? <><CheckCircle2 className="h-3 w-3" /> Done</> : t.status === "IN_PROGRESS" ? <><Clock className="h-3 w-3" /> Doing</> : "Planned"}
                      </Badge>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">{new Date(t.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(t)} title="Edit"><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(t.id)} title="Delete"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
