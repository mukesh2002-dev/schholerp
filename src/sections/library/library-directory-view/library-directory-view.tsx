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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { BookOpen, Search, Library, CheckCircle2, AlertTriangle, Plus, Edit3, Trash2, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LibraryBook, BookCategory } from "@/types";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

const bookSchema = z.object({
  title: z.string().min(1, "Title required"),
  author: z.string().min(1, "Author required"),
  isbn: z.string().min(5, "ISBN required"),
  publisher: z.string().min(1, "Publisher required"),
  category: z.string().min(1, "Category required"),
  shelfLocation: z.string().min(1, "Shelf required"),
  totalCopies: z.string().min(1, "Copies required"),
  price: z.string().optional(),
  publishedYear: z.string().optional(),
  language: z.string().optional(),
  accessionNumber: z.string().optional(),
  edition: z.string().optional(),
  rackNumber: z.string().optional(),
  description: z.string().optional(),
});

type BookFormValues = z.infer<typeof bookSchema>;

export function LibraryDirectoryView() {
  const { activeBranchId } = useERP();
  const [books, setBooks] = useState(() => mockDb.getLibraryBooks(activeBranchId));
  const [issues, setIssues] = useState(() => mockDb.getBookIssues(activeBranchId));
  const [fines] = useState(() => mockDb.getLibraryFines(activeBranchId));
  const [students] = useState(() => mockDb.getStudents(activeBranchId));
  const [classes] = useState(() => mockDb.getClasses(activeBranchId));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [issueStatus, setIssueStatus] = useState("ALL");

  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [issueBook, setIssueBook] = useState<LibraryBook | null>(null);

  // Enhanced issue search: Roll No + Class + Section
  const [issueSearch, setIssueSearch] = useState("");
  const [issueClass, setIssueClass] = useState<string>("ALL");
  const [issueSection, setIssueSection] = useState<string>("ALL");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const debouncedIssueSearch = useDebouncedValue(issueSearch, 300);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: { title: "", author: "", isbn: "", publisher: "", category: "TEXTBOOK", shelfLocation: "", totalCopies: "10", price: "500", publishedYear: "2024", language: "English", accessionNumber: "", edition: "", rackNumber: "", description: "" },
  });

  const watchedCategory = watch("category");

  const filteredBooks = useMemo(
    () =>
      books.filter((b) => {
        const matchSearch =
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.author.toLowerCase().includes(search.toLowerCase()) ||
          b.isbn.includes(search) ||
          (b.accessionNumber || "").toLowerCase().includes(search.toLowerCase());
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
          i.studentName.toLowerCase().includes(search.toLowerCase()) ||
          i.studentRoll.toLowerCase().includes(search.toLowerCase());
        const matchStatus = issueStatus === "ALL" || i.status === issueStatus;
        return matchSearch && matchStatus;
      }),
    [issues, search, issueStatus]
  );

  // Filtered students for Issue dialog - supports Roll No search + Class/Section
  const filteredStudentsForIssue = useMemo(() => {
    const q = debouncedIssueSearch.trim().toLowerCase();
    return students.filter((s) => {
      const matchSearch = q === "" ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.fullName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchClass = issueClass === "ALL" || s.classId === issueClass || s.className === issueClass;
      const matchSection = issueSection === "ALL" || s.sectionId === issueSection || s.sectionName.toLowerCase().includes(issueSection.toLowerCase());
      return matchSearch && matchClass && matchSection;
    }).slice(0, 10);
  }, [students, debouncedIssueSearch, issueClass, issueSection]);

  // Derive section options for selected class
  const sectionOptions = useMemo(() => {
    if (issueClass === "ALL") return [];
    const cls = classes.find((c) => c.id === issueClass);
    return cls?.sections ?? [];
  }, [classes, issueClass]);

  const refresh = () => {
    setBooks([...mockDb.getLibraryBooks(activeBranchId)]);
    setIssues([...mockDb.getBookIssues(activeBranchId)]);
  };

  const openAddBook = () => {
    setEditingBook(null);
    reset({ title: "", author: "", isbn: "", publisher: "", category: "TEXTBOOK", shelfLocation: "A-Block / Shelf 01", totalCopies: "10", price: "500", publishedYear: "2024", language: "English", accessionNumber: `ACC-${Date.now().toString().slice(-6)}`, edition: "1st", rackNumber: "R01", description: "" });
    setBookDialogOpen(true);
  };

  const openEditBook = (b: LibraryBook) => {
    setEditingBook(b);
    reset({
      title: b.title, author: b.author, isbn: b.isbn, publisher: b.publisher, category: b.category,
      shelfLocation: b.shelfLocation, totalCopies: String(b.totalCopies), price: String(b.price), publishedYear: String(b.publishedYear), language: b.language,
      accessionNumber: b.accessionNumber || "", edition: b.edition || "", rackNumber: b.rackNumber || "", description: b.description,
    });
    setBookDialogOpen(true);
  };

  const onSubmitBook = (data: BookFormValues) => {
    const total = Number(data.totalCopies) || 0;
    const price = Number(data.price) || 0;
    const existing = editingBook;
    const payload = {
      id: existing?.id,
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      publisher: data.publisher,
      category: data.category as BookCategory,
      branchId: activeBranchId === "all" ? "br-apex-01" : activeBranchId,
      branchName: existing?.branchName || "Apex Global Campus",
      shelfLocation: data.shelfLocation,
      totalCopies: total,
      availableCopies: existing ? Math.max(0, total - existing.issuedCopies) : total,
      issuedCopies: existing?.issuedCopies ?? 0,
      price, publishedYear: Number(data.publishedYear) || 2024, language: data.language || "English",
      status: (total > 0 ? "AVAILABLE" : "ISSUED") as any,
      description: data.description || "",
      accessionNumber: data.accessionNumber,
      edition: data.edition,
      rackNumber: data.rackNumber,
      addedDate: existing?.addedDate || new Date().toISOString().split("T")[0],
    } as any;
    mockDb.saveLibraryBook(payload);
    toast.success(editingBook ? "Book updated" : "Book added to catalog");
    setBookDialogOpen(false);
    refresh();
  };

  const handleDeleteBook = (id: string) => {
    mockDb.deleteLibraryBook(id);
    toast.success("Book removed from catalog");
    refresh();
  };

  const openIssueDialog = (b: LibraryBook) => {
    if (b.availableCopies <= 0) { toast.error("No copies available — add to reservation"); return; }
    setIssueBook(b);
    setIssueSearch("");
    setIssueClass("ALL");
    setIssueSection("ALL");
    setSelectedStudentId(students[0]?.id || "");
    setIssueDialogOpen(true);
  };

  const handleIssueConfirm = () => {
    if (!issueBook) return;
    const stu = students.find((s) => s.id === selectedStudentId) || filteredStudentsForIssue[0];
    if (!stu) { toast.error("Please select a student — search by Roll No / Name"); return; }
    mockDb.issueBook({
      bookId: issueBook.id,
      bookTitle: issueBook.title,
      bookIsbn: issueBook.isbn,
      studentId: stu.id,
      studentName: stu.fullName,
      studentRoll: stu.rollNumber,
      className: stu.className,
      branchId: issueBook.branchId,
      branchName: issueBook.branchName,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "ISSUED",
      fineAmount: 0,
      finePaid: 0,
      issuedBy: "Librarian",
    });
    toast.success(`Issued "${issueBook.title}" to ${stu.fullName} (${stu.rollNumber} - ${stu.className})`);
    setIssueDialogOpen(false);
    refresh();
  };

  const handleReturn = (issueId: string) => {
    mockDb.returnBook(issueId);
    toast.success("Book returned successfully");
    refresh();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="catalog" className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-3">
          <TabsList>
            <TabsTrigger value="catalog" className="gap-1.5 text-xs"><BookOpen className="h-3.5 w-3.5" /> Catalog ({books.length}) College Pattern</TabsTrigger>
            <TabsTrigger value="issues" className="gap-1.5 text-xs"><Library className="h-3.5 w-3.5" /> Issue / Return ({issues.length})</TabsTrigger>
            <TabsTrigger value="fines" className="gap-1.5 text-xs"><AlertTriangle className="h-3.5 w-3.5" /> Fines ({fines.length})</TabsTrigger>
          </TabsList>
          <Button onClick={openAddBook} size="sm" variant="gradient" className="gap-1.5 self-start md:self-auto"><Plus className="h-3.5 w-3.5" /> Add Book (College)</Button>
        </div>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm flex items-center gap-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, author, ISBN, Accession..." className="pl-9 h-9 text-xs flex-1" />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
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
              <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="ISSUED">Issued</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No books found. Add college library books with accession & Dewey.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBooks.map((b) => (
                <Card key={b.id} className="border-border/80 hover:border-primary/30 transition-colors shadow-2xs group">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm truncate">{b.title}</h3>
                        <p className="text-xs text-muted-foreground">{b.author} • {b.publisher}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-1">{b.isbn} {b.accessionNumber ? `• ${b.accessionNumber}` : ""}</p>
                        {b.rackNumber && <p className="text-[11px] text-muted-foreground">Rack {b.rackNumber} • {b.shelfLocation}</p>}
                      </div>
                      <Badge variant={b.status === "AVAILABLE" ? "success" : b.status === "ISSUED" ? "warning" : "secondary"} className="text-[10px] shrink-0">{b.status}</Badge>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{b.category}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{b.shelfLocation}</Badge>
                      {b.edition && <Badge variant="outline" className="text-[10px]">{b.edition} Ed.</Badge>}
                      {b.isDigital && <Badge variant="info" className="text-[10px] gap-1"><Globe className="h-3 w-3" /> Digital</Badge>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="p-2 rounded-lg bg-muted/40 border"><span className="block font-bold">{b.totalCopies}</span><span className="text-muted-foreground text-[10px]">Total</span></div>
                      <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20"><span className="block font-bold text-emerald-600">{b.availableCopies}</span><span className="text-muted-foreground text-[10px]">Avail</span></div>
                      <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20"><span className="block font-bold text-amber-600">{b.issuedCopies}</span><span className="text-muted-foreground text-[10px]">Issued</span></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{b.branchName}</span>
                      <span className="font-semibold">{formatCurrency(b.price)}</span>
                    </div>
                    {b.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{b.description}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1" onClick={() => openIssueDialog(b)} disabled={b.availableCopies === 0}><Library className="h-3.5 w-3.5" /> Issue Book</Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEditBook(b)}><Edit3 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteBook(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">College reference: Accession no., Rack/Dewey, Edition, Shelf, Digital link, reservation queue — like university library ERP.</p>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex gap-2 p-3 rounded-xl bg-card border border-border/70">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search book / student..." className="pl-9 h-9 text-xs" />
            </div>
            <Select value={issueStatus} onValueChange={setIssueStatus}>
              <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
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
                    <TableCell><span className="font-semibold text-sm">{iss.bookTitle}</span><span className="block text-[11px] text-muted-foreground font-mono">{iss.bookIsbn}</span></TableCell>
                    <TableCell><span className="font-medium text-sm">{iss.studentName}</span><span className="block text-[11px] text-muted-foreground">{iss.studentRoll} • {iss.className}</span></TableCell>
                    <TableCell className="text-xs">{formatDate(iss.issuedDate)}</TableCell>
                    <TableCell className="text-xs font-semibold">{formatDate(iss.dueDate)}</TableCell>
                    <TableCell><Badge variant={iss.status === "ISSUED" ? "info" : iss.status === "OVERDUE" ? "destructive" : "success"} className="text-[10px]">{iss.status}</Badge></TableCell>
                    <TableCell className="text-right tabular-nums text-xs font-bold text-rose-600">{iss.fineAmount ? formatCurrency(iss.fineAmount) : "—"}</TableCell>
                    <TableCell className="text-right">
                      {iss.status === "ISSUED" || iss.status === "OVERDUE" ? (
                        <Button size="sm" className="h-7 text-[11px] gap-1" onClick={() => handleReturn(iss.id)}><CheckCircle2 className="h-3 w-3" /> Return</Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Done</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="fines" className="space-y-4">
          <div className="grid gap-3">
            {fines.map((f) => (
              <Card key={f.id} className="border-border/80 shadow-2xs">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-sm">{f.bookTitle}</h4>
                    <p className="text-xs text-muted-foreground">{f.studentName} • {f.reason} • Due {formatDate(f.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={f.status === "PENDING" ? "destructive" : f.status === "PAID" ? "success" : "secondary"} className="text-[10px]">{f.status}</Badge>
                    <span className="font-bold text-sm">{formatCurrency(f.amount)}</span>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.success(`Fine ${f.id} marked paid`)} disabled={f.status === "PAID"}>Collect</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {fines.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No fines.</div>}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={bookDialogOpen} onOpenChange={setBookDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Book — College Catalog" : "Add Book — College Library"}</DialogTitle>
            <DialogDescription>College pattern: Accession no., Dewey/Rack, Edition, Shelf — like university library ERP.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitBook)} className="space-y-3 mt-2">
            <div>
              <label className="text-xs font-medium block mb-1">Title *</label>
              <Input {...register("title")} placeholder="e.g. Data Structures using C" className={errors.title ? "border-rose-500" : ""} />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Author *</label>
                <Input {...register("author")} placeholder="Author name" className={errors.author ? "border-rose-500" : ""} />
                {errors.author && <p className="text-[11px] text-rose-500 mt-1">{errors.author.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Publisher *</label>
                <Input {...register("publisher")} placeholder="Publisher" className={errors.publisher ? "border-rose-500" : ""} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">ISBN *</label>
                <Input {...register("isbn")} placeholder="978-93-..." className={errors.isbn ? "border-rose-500" : ""} />
                {errors.isbn && <p className="text-[11px] text-rose-500 mt-1">{errors.isbn.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Accession No.</label>
                <Input {...register("accessionNumber")} placeholder="ACC-001234" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Category</label>
                <Select value={watchedCategory} onValueChange={(v) => setValue("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TEXTBOOK">Textbook</SelectItem>
                    <SelectItem value="REFERENCE">Reference</SelectItem>
                    <SelectItem value="FICTION">Fiction</SelectItem>
                    <SelectItem value="NON_FICTION">Non-Fiction</SelectItem>
                    <SelectItem value="JOURNAL">Journal</SelectItem>
                    <SelectItem value="DIGITAL">Digital</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Edition</label>
                <Input {...register("edition")} placeholder="3rd" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Year</label>
                <Input {...register("publishedYear")} placeholder="2024" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Shelf</label>
                <Input {...register("shelfLocation")} placeholder="A-Block / Shelf 12" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Rack No.</label>
                <Input {...register("rackNumber")} placeholder="R01" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Copies *</label>
                <Input {...register("totalCopies")} type="number" />
                {errors.totalCopies && <p className="text-[11px] text-rose-500 mt-1">{errors.totalCopies.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium block mb-1">Price (₹)</label>
                <Input {...register("price")} type="number" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">Language</label>
                <Input {...register("language")} placeholder="English" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Description</label>
              <Textarea {...register("description")} rows={2} placeholder="Brief description for catalog" />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setBookDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="gradient">{editingBook ? "Update Book" : "Add to Catalog"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Book — Student Search</DialogTitle>
            <DialogDescription>Search by Roll No / Name / Admission No + filter by Class/Section — college library pattern. 14-day loan.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="p-3 rounded-lg bg-muted/40 border text-sm">
              <div className="font-bold">{issueBook?.title}</div>
              <div className="text-xs text-muted-foreground">{issueBook?.author} • {issueBook?.isbn} {issueBook?.accessionNumber ? `• ${issueBook.accessionNumber}` : ""}</div>
              <div className="text-xs">Available: <strong className="text-emerald-600">{issueBook?.availableCopies} copies</strong> | Shelf: {issueBook?.shelfLocation} {issueBook?.rackNumber ? `• Rack ${issueBook.rackNumber}` : ""}</div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={issueSearch} onChange={(e) => setIssueSearch(e.target.value)} placeholder="Search Roll No e.g. STU-1042, Name, Admission No..." className="pl-9 h-9 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Select value={issueClass} onValueChange={(v) => { setIssueClass(v); setIssueSection("ALL"); }}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={issueSection} onValueChange={setIssueSection} disabled={sectionOptions.length === 0}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={sectionOptions.length ? "Section" : "All Sections"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Sections</SelectItem>
                  {sectionOptions.map((sec) => <SelectItem key={sec.id} value={sec.id}>{sec.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border border-border/80 max-h-[260px] overflow-y-auto divide-y divide-border/60">
              {filteredStudentsForIssue.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">No student found. Try Roll No / Name or clear Class filter.</div>
              ) : (
                filteredStudentsForIssue.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`w-full text-left p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${selectedStudentId === s.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}
                  >
                    <img src={s.avatar} alt={s.fullName} className="h-8 w-8 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {s.fullName} <Badge variant="outline" className="text-[10px] font-mono px-1 py-0">{s.rollNumber}</Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{s.className} • {s.sectionName} • {s.admissionNumber}</div>
                    </div>
                    {selectedStudentId === s.id && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Showing {filteredStudentsForIssue.length} of {students.length} students. Tip: type `STU-` to filter by roll, or select Class/Section.</p>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleIssueConfirm} variant="gradient" disabled={!selectedStudentId}>Confirm Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
