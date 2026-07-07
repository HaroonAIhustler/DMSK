"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { PLAYING: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  playVideo: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};

type DmskCareerYouTubePlayerProps = {
  videoId: string;
  onBonusVisible?: () => void;
};

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

export function DmskCareerYouTubePlayer({ videoId, onBonusVisible }: DmskCareerYouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasTrackedPlayRef = useRef(false);
  const hasTrackedCompleteRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function getContact() {
    try {
      const ud = JSON.parse(localStorage.getItem("_ud") ?? "{}") as Record<string, string>;
      return { email: ud.email, phone: ud.phone, first_name: ud.first_name, last_name: ud.last_name };
    } catch { return {}; }
  }

  function trackVideoComplete() {
    if (hasTrackedCompleteRef.current) return;
    hasTrackedCompleteRef.current = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "dmsk_video_complete", video_name: "dmsk_career_bonus" });

    fetch("/api/video-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ ...getContact(), video_name: "dmsk_career_bonus" }),
    }).catch(() => {});
  }

  function trackVideoPlay() {
    if (hasTrackedPlayRef.current) return;
    hasTrackedPlayRef.current = true;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "dmsk_video_play",
      video_name: "dmsk_career_bonus",
      video_src: `https://www.youtube.com/watch?v=${videoId}`,
    });

    fetch("/api/video-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ ...getContact(), video_name: "dmsk_career_bonus" }),
    }).catch(() => {});
  }

  function startPolling() {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      const duration = player.getDuration();
      const currentTime = player.getCurrentTime();
      if (Number.isFinite(duration) && duration > 0 && duration - currentTime <= 15) {
        onBonusVisible?.();
        trackVideoComplete();
      }
    }, 1000);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          disablekb: 1,
        },
        events: {
          onStateChange: (event) => {
            if (!window.YT) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              trackVideoPlay();
              startPolling();
            } else if (event.data === window.YT.PlayerState.ENDED) {
              onBonusVisible?.();
              trackVideoComplete();
              stopPolling();
            } else {
              stopPolling();
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  function playVideo() {
    playerRef.current?.playVideo();
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#071638" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {!isPlaying ? (
        <button
          type="button"
          aria-label="Play AI digital marketing career video"
          onClick={playVideo}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: 2,
            display: "grid",
            width: 76,
            height: 76,
            placeItems: "center",
            border: "3px solid #56ab90",
            borderRadius: 999,
            background: "rgba(86, 171, 144, 0.18)",
            boxShadow: "0 0 0 6px rgba(86, 171, 144, 0.18), 0 16px 34px rgba(0, 0, 0, 0.32)",
            cursor: "pointer",
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 0,
              height: 0,
              marginLeft: 6,
              borderTop: "16px solid transparent",
              borderBottom: "16px solid transparent",
              borderLeft: "25px solid #56ab90",
            }}
          />
        </button>
      ) : null}
    </div>
  );
}
