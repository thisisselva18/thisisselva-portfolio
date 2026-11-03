"use client";

// A YouTube video that shows its thumbnail first and loads the real player only on
// click (lite-youtube-embed). The play button is labelled with the embed's title.

import { useEffect } from "react";
import "lite-youtube-embed/src/lite-yt-embed.css";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "lite-youtube": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        videoid: string;
        playlabel?: string;
        params?: string;
      };
    }
  }
}

export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  useEffect(() => {
    import("lite-youtube-embed");
  }, []);
  return <lite-youtube videoid={id} playlabel={title || undefined} params="rel=0" />;
}
