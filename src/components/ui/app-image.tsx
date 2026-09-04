"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  sizes?: string;
  priority?: boolean;
}

const DEFAULT_FALLBACK = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100";

/**
 * Optimized avatar/image with lazy loading + graceful fallback.
 * Replaces raw <img> tags so images don't block LCP and broken URLs degrade cleanly.
 */
export function AppImage({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  sizes = "96px",
  priority = false,
}: AppImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  React.useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={96}
      height={96}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      onError={() => {
        if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
      }}
      className={cn("object-cover", className)}
    />
  );
}
