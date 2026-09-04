import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <FileQuestion className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Page not found</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The page you are looking for does not exist or was moved.
        </p>
      </div>
      <Button asChild variant="gradient">
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
