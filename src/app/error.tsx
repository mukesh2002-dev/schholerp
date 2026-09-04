"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          This section failed to load. Your data is safe — try again, or navigate back and return.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => reset()} variant="gradient">
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
