"use client";

// A muted, looping, inline video that plays only while it's on screen.
// With prefers-reduced-motion it never starts by itself: it shows its poster and
// the browser's own controls, so the visitor can play it if they want.

import { useEffect, useRef, useState } from "react";

type Props = { src: string; poster: string; label?: string; className?: string };

export function InViewVideo({ src, poster, label, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.35 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      className={`block w-full ${className?.includes("grow") ? "" : "h-auto"} ${className ?? ""}`}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
      aria-label={label}
    />
  );
}
