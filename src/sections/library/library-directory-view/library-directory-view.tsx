"use client";

import React, { useState, useMemo } from "react";
import { useERP } from "@/components/providers/erp-provider";
import { mockDb } from "@/lib/services/mock-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Search, Library, CheckCircle2, AlertTriangle } from "lucide-react";

export function LibraryDirectoryView() {
  const { activeBranchId } = useERP();
  const [books, setBooks] = useState(() => mockDb.getLibraryBooks(activeBranchId));
  const [issues, setIssues] = useState(() => mockDb.getBookIssues(activeBranchId));
  const [fines] = useState(() => mockDb.getLibraryFines(activeBranchId));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [issueStatus, setIssueStatus] = useState("ALL");

  const filteredBooks = useMemo(
    () =>
      books.filter((b) => {
        const matchSearch =
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.isbn.includes(search);
        const matchCat = category === "ALL" || b.category === category;
        const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
      }),
    [books, search, category, statusFilter]
  );

  const filteredIssues = useMemo(
    () =>
      issues.filter((i) => {
        const matchSearch =
          i.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
          i.studentName.toLowerCase().includes(search.toLowerCase());
        const matchStatus = issueStatus === "ALL" || i.status === issueStatus;
        return matchSearch && matchStatus;
      }),
    [issues, search, issueStatus]
  );

  const handleIssue = (bookId: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;
    if (book.availableCopies <= 0) {
      toast.error("No copies available");
      return;
    }
    const students = mockDb.getStudents(activeBranchId);
    const stu = students[0];
    if (!stu) {
      toast.error("No student found");
      return;
    }
    mockDb.issueBook({
      bookId: book.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentId: stu.id,
      studentName: stu.fullName,
      studentRoll: stu.rollNumber,
      className: stu.className,
      branchId: book.branchId,
      branchName: book.branchName,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "ISSUED",
      fineAmount: 0,
      finePaid: 0,
      issuedBy: "Librarian",
    });
    toast.success(`Issued "${book.title}" to ${stu.fullName}`);
    setBooks([...mockDb.getLibraryBooks(activeBranchId)]);
    setIssues([...mockDb.getBookIssues(activeBranchId)]);
  };

  const handleReturn = (issueId: string) => {
    mockDb.returnBook(issueId);
    toast.success("Book returned successfully");
    setBooks([...mockDb.getLibraryBooks(activeBranchId)]);
    setIssues([...mockDb.getBookIssues(activeBranchId)]);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" /> Catalog ({books.length})
          </TabsTrigger>
          <TabsTrigger value="issues" className="gap-1.5 text-xs">
            <Library className="h-3.5 w-3.5" /> Issue / Return ({issues.length})
          </TabsTrigger>
          <TabsTrigger value="fines" className="gap-1.5 text-xs">
            <AlertTriangle className="h-3.5 w-3.5" /> Fines ({fines.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Catalog */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm flex items-center gap-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, author, ISBN..."
                className="pl-9 h-9 text-xs flex-1"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                <SelectItem value="REFERENCE">Reference</SelectItem>
                <SelectItem value="FICTION">Fiction</SelectItem>
                <SelectItem value="NON_FICTION">Non-Fiction</SelectItem>
                <SelectItem value="JOURNAL">Journal</SelectItem>
                <SelectItem value="DIGITAL">Digital</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No books found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBooks.map((b) => (
                <Card
                  key={b.id}
                  className="border-border/80 hover:border-primary/30 transition-colors shadow-2xs"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{b.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {b.author} • {b.publisher}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">{b.isbn}</p>
                      </div>
                      <Badge
                        variant={
                          b.status === "AVAILABLE"
                            ? "success"
                            : b.status === "ISSUED"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {b.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px]">
                        {b.category}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {b.shelfLocation}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="p-2 rounded-lg bg-muted/40 border">
                        <span className="block font-bold">{b.totalCopies}</span>
                        <span className="text-muted-foreground text-[10px]">Total</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="block font-bold text-emerald-600">{b.availableCopies}</span>
                        <span className="text-muted-foreground text-[10px]">Avail</span>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <span className="block font-bold text-amber-600">{b.issuedCopies}</span>
                        <span className="text-muted-foreground text-[10px]">Issued</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{b.branchName}</span>
                      <span className="font-semibold">{formatCurrency(b.price)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-8 text-xs gap-1"
                      onClick={() => handleIssue(b.id)}
                      disabled={b.availableCopies === 0}
                    >
                      <Library className="h-3.5 w-3.5" /> Issue Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Issues */}
        <TabsContent value="issues" className="space-y-4">
          <div className="flex gap-2 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search book / student..."
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Select value={issueStatus} onValueChange={setIssueStatus}>
              <SelectTrigger className="w-[150px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Issues</SelectItem>
                <SelectItem value="ISSUED">Active Loan</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
                <SelectItem value="OVERDUE">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right tabular-nums">Fine</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((iss) => (
                  <TableRow key={iss.id} className="hover:bg-muted/40">
                    <TableCell>
                      <span className="font-semibold text-sm">{iss.bookTitle}</span>
                      <span className="block text-[11px] text-muted-foreground font-mono">
                        {iss.bookIsbn}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{iss.studentName}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {iss.studentRoll} • {iss.className}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(iss.issuedDate)}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatDate(iss.dueDate)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          iss.status === "ISSUED"
                            ? "info"
                            : iss.status === "OVERDUE"
                            ? "destructive"
                            : "success"
                        }
                        className="text-[10px]"
                      >
                        {iss.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-bold text-rose-600">
                      {iss.fineAmount ? formatCurrency(iss.fineAmount) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {iss.status === "ISSUED" || iss.status === "OVERDUE" ? (
                        <Button
                          size="sm"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => handleReturn(iss.id)}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Return
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          Done
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 3: Fines */}
        <TabsContent value="fines" className="space-y-4">
          <div className="grid gap-3">
            {fines.map((f) => (
              <Card key={f.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-sm">{f.bookTitle}</h4>
                    <p className="text-xs text-muted-foreground">
                      {f.studentName} • {f.reason} • Due {formatDate(f.dueDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        f.status === "PENDING"
                          ? "destructive"
                          : f.status === "PAID"
                          ? "success"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {f.status}
                    </Badge>
                    <span className="font-bold text-sm">{formatCurrency(f.amount)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                      onClick={() => toast.success(`Fine ${f.id} marked paid`)}
                      disabled={f.status === "PAID"}
                    >
                      Collect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {fines.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No fines.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
