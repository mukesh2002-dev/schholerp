"use client";

import React, { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Finish loading when route changes
    setProgress(100);
    const timer = setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept clicks on local links to show instant visual loading progress
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLAnchorElement;
      if (!target || !target.href) return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("http")) return;

      if (href !== window.location.pathname) {
        setIsLoading(true);
        setProgress(30);

        const timer1 = setTimeout(() => setProgress(60), 100);
        const timer2 = setTimeout(() => setProgress(85), 300);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    };

    const anchors = Array.from(document.querySelectorAll("a[href]"));
    anchors.forEach((a) => a.addEventListener("click", handleAnchorClick as EventListener));

    return () => {
      anchors.forEach((a) => a.removeEventListener("click", handleAnchorClick as EventListener));
    };
  }, [pathname]);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-0.5 pointer-events-none bg-primary/20"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 transition-all duration-200 ease-out shadow-xs shadow-primary"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressInner />
    </Suspense>
  );
}
