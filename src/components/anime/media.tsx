import { useState } from "react";

import { cn } from "@/lib/utils";

const IMG = "https://image.tmdb.org/t/p/";

export function img(path: string | null | undefined, size = "w500") {
  return path ? `${IMG}${size}${path}` : null;
}

export function Img({
  src,
  alt,
  className,
  imgClassName,
  rounded = "rounded-xl",
}: {
  src: string | null;
  alt: string;
  className?: string | undefined;
  imgClassName?: string | undefined;
  rounded?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-surface-2", rounded, className)}>
      {!loaded && !failed && <div className={cn("absolute inset-0 shimmer", rounded)} />}
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover transition-all duration-700",
            loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm",
            imgClassName,
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface-2 to-surface text-center text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
          <span className="px-2 line-clamp-3">{alt}</span>
        </div>
      )}
    </div>
  );
}