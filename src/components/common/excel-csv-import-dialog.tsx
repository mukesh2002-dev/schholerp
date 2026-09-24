"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

export interface ImportPreviewColumn {
  key: string;
  label: string;
}

export interface ExcelCsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  templateFileName: string;
  templateCsvContent: string;
  previewColumns?: ImportPreviewColumn[];
  onImport: (rows: any[]) => Promise<{
    success: boolean;
    total: number;
    imported: number;
    failed: number;
    errors?: { row: number; name: string; error: string }[];
  }>;
  onSuccess?: () => void;
}

export function ExcelCsvImportDialog({
  open,
  onOpenChange,
  title,
  description,
  templateFileName,
  templateCsvContent,
  previewColumns = [],
  onImport,
  onSuccess,
}: ExcelCsvImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    total: number;
    imported: number;
    failed: number;
    errors?: { row: number; name: string; error: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([templateCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", templateFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded template: ${templateFileName}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const processFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(ext || "")) {
      toast.error("Please upload a valid CSV or Excel (.xlsx, .xls) file");
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!json || json.length === 0) {
          toast.error("The selected file is empty or has no data rows");
          setParsedRows([]);
          return;
        }

        setParsedRows(json);
        toast.info(`Detected ${json.length} records ready for import`);
      } catch (err: any) {
        toast.error(`Failed to parse file: ${err.message || "Unknown error"}`);
        setParsedRows([]);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleSubmitImport = async () => {
    if (!parsedRows.length) {
      toast.error("Please select a file with valid records first");
      return;
    }

    setLoading(true);
    try {
      const res = await onImport(parsedRows);
      setResult({
        total: res.total,
        imported: res.imported,
        failed: res.failed,
        errors: res.errors,
      });

      if (res.imported > 0) {
        toast.success(`Successfully imported ${res.imported} records!`);
        onSuccess?.();
      } else {
        toast.error("No records could be imported. Please review the errors below.");
      }
    } catch (err: any) {
      toast.error(err.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Derive dynamic preview headers if not provided
  const displayColumns =
    previewColumns.length > 0
      ? previewColumns
      : parsedRows.length > 0
      ? Object.keys(parsedRows[0])
          .slice(0, 6)
          .map((k) => ({ key: k, label: k }))
      : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          {/* Step 1: Download Template */}
          <div className="p-3.5 rounded-lg border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <span>1. Download Standard Template</span>
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                  Recommended
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Use our pre-configured format with required headers and example rows.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-1.5 shrink-0 text-xs h-8 border-emerald-500/30 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <Download className="h-3.5 w-3.5" />
              Download Template (.csv)
            </Button>
          </div>

          {/* Step 2: Upload Zone */}
          <div>
            <div className="text-xs font-semibold mb-1.5">2. Upload Filled Excel or CSV</div>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="p-3 rounded-full bg-muted mb-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-xs font-medium">
                {file ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {file.name}
                  </span>
                ) : (
                  <span>Click to browse or drag and drop your file here</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv)
              </p>
              {file && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {(file.size / 1024).toFixed(1)} KB
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">
                    {parsedRows.length} rows detected
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          {parsedRows.length > 0 && !result && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span>File Preview</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Showing first 5 of {parsedRows.length} rows
                  </Badge>
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetState}
                  className="h-6 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              </div>

              <div className="rounded border overflow-x-auto max-h-44 text-[11px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="p-1.5 text-left font-medium text-muted-foreground w-8">#</th>
                      {displayColumns.map((col) => (
                        <th key={col.key} className="p-1.5 text-left font-medium whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-1.5 text-muted-foreground">{idx + 1}</td>
                        {displayColumns.map((col) => (
                          <td key={col.key} className="p-1.5 whitespace-nowrap">
                            {String(row[col.key] ?? "") || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result / Summary Section */}
          {result && (
            <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
              <div className="flex items-center gap-2">
                {result.failed === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <div className="text-xs font-semibold">Import Complete</div>
                  <div className="text-[11px] text-muted-foreground">
                    Imported <span className="font-semibold text-emerald-500">{result.imported}</span> of{" "}
                    {result.total} records.{" "}
                    {result.failed > 0 && (
                      <span className="text-rose-500 font-semibold">
                        ({result.failed} failed)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-rose-500">Failed Rows:</div>
                  <div className="max-h-32 overflow-y-auto rounded border bg-background p-2 space-y-1 text-[11px]">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                        <span className="font-mono text-rose-500 shrink-0">Row {err.row}:</span>
                        <span>{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 pt-3 border-t gap-2 sm:gap-0">
          <Button type="button" variant="outline" size="sm" onClick={handleClose}>
            {result ? "Close" : "Cancel"}
          </Button>
          {!result && (
            <Button
              type="button"
              size="sm"
              disabled={loading || parsedRows.length === 0}
              onClick={handleSubmitImport}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>
                {loading
                  ? "Importing..."
                  : parsedRows.length > 0
                  ? `Import ${parsedRows.length} Records`
                  : "Upload File to Import"}
              </span>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
