"use client";

// An Instagram reel that shows its cover first and loads Instagram's player only when
// tapped, so a row of reels costs almost nothing until someone wants one. Covers are 3:5
// (the user's reel screenshots, minus the mute icon), and the player keeps that shape.
// Instagram's own embed script isn't used: the player is a plain iframe of the embed page.

import { useState } from "react";
import { MediaImage } from "./MediaImage";

type Props = {
  id: string;
  poster?: string;
  label: string; // names the play button and the player for screen readers: the embed's title, or its link
};

export function InstagramEmbed({ id, poster, label }: Props) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.instagram.com/p/${id}/embed`}
        title={label}
        className="block aspect-[3/5] w-full border-0 bg-white"
        allow="autoplay; encrypted-media; picture-in-picture"
        loading="lazy"
      />
    );
  }

  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={label} className="group relative block w-full">
      {poster ? (
        <MediaImage src={poster} alt="" sizes="(max-width: 640px) 60vw, 240px" className="aspect-[3/5] object-cover" />
      ) : (
        <span className="block aspect-[3/5] w-full bg-ink" />
      )}
      {/* A round play mark, like a sticker on the cover. */}
      <span
        aria-hidden
        className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white bg-ink/80 shadow-lift transition-transform group-hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="ml-1 size-6" aria-hidden>
          <path d="M6 4l14 8-14 8z" fill="var(--white)" />
        </svg>
      </span>
    </button>
  );
}
