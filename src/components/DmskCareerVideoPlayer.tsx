"use client";

import { useRef, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

type DmskCareerVideoPlayerProps = {
  onBonusVisible?: () => void;
};

export function DmskCareerVideoPlayer({ onBonusVisible }: DmskCareerVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
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
      video_src: "/assets/dmsk-career-bonus-video.mp4",
    });

    // Send video play event to GHL — backend adds "Video Played - DMSK Career" tag
    fetch("/api/video-play", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ ...getContact(), video_name: "dmsk_career_bonus" }),
    }).catch(() => {});
  }

  async function playVideo() {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setIsPlaying(true);
      trackVideoPlay();
    } catch {
      setIsPlaying(false);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    if (video.duration - video.currentTime <= 15) {
      onBonusVisible?.();
      trackVideoComplete();
    }
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        src="/assets/dmsk-career-bonus-video.mp4"
        poster="/assets/dmsk-career-poster.jpg"
        preload="none"
        playsInline
        onClick={() => {
          if (videoRef.current?.paused) void playVideo();
          else videoRef.current?.pause();
        }}
        onEnded={() => { onBonusVisible?.(); trackVideoComplete(); }}
        onPlay={() => {
          setIsPlaying(true);
          trackVideoPlay();
        }}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "center",
        }}
      />
      {!isPlaying ? (
        <>
          <style>{`
            @keyframes dmskPlayBounce {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              30% { transform: translate(-50%, calc(-50% - 12px)) scale(1.08); }
              55% { transform: translate(-50%, calc(-50% + 5px)) scale(0.96); }
              75% { transform: translate(-50%, calc(-50% - 4px)) scale(1.04); }
            }
            @keyframes dmskPlayGlow {
              0%, 100% { box-shadow: 0 0 0 8px rgba(86, 171, 144, 0.25), 0 18px 38px rgba(0, 0, 0, 0.36); }
              50% { box-shadow: 0 0 0 18px rgba(86, 171, 144, 0.12), 0 18px 38px rgba(0, 0, 0, 0.36); }
            }
          `}</style>
          <button
            type="button"
            aria-label="Play AI digital marketing career video"
            onClick={() => void playVideo()}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              zIndex: 2,
              display: "grid",
              width: 104,
              height: 104,
              placeItems: "center",
              border: "4px solid #56ab90",
              borderRadius: 999,
              background: "rgba(86, 171, 144, 0.22)",
              cursor: "pointer",
              transform: "translate(-50%, -50%)",
              animation: "dmskPlayBounce 1.6s ease-in-out infinite, dmskPlayGlow 1.6s ease-in-out infinite",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 0,
                height: 0,
                marginLeft: 8,
                borderTop: "21px solid transparent",
                borderBottom: "21px solid transparent",
                borderLeft: "33px solid #56ab90",
              }}
            />
          </button>
        </>
      ) : null}
    </div>
  );
}
