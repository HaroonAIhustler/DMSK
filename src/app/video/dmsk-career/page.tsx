"use client";

import { useRef, useState } from "react";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export default function DmskCareerVideoPage() {
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

  function unlockBonus() {
    window.parent.postMessage({ type: "dmsk-video-bonus-visible" }, window.location.origin);
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

    const payload = {
      event: "dmsk_video_play",
      video_name: "dmsk_career_bonus",
      video_src: "/assets/dmsk-career-bonus-video.mp4",
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    window.parent.postMessage({ type: "dmsk-video-play", ...payload }, window.location.origin);

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
      unlockBonus();
      trackVideoComplete();
    }
  }

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <style>{`
        @keyframes playBounce {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          30% { transform: translate(-50%, calc(-50% - 10px)) scale(1.04); }
          55% { transform: translate(-50%, calc(-50% + 4px)) scale(0.98); }
          75% { transform: translate(-50%, calc(-50% - 3px)) scale(1.02); }
        }
      `}</style>
      <video
        ref={videoRef}
        src="/assets/dmsk-career-bonus-video.mp4"
        preload="metadata"
        playsInline
        onClick={() => {
          if (videoRef.current?.paused) void playVideo();
          else videoRef.current?.pause();
        }}
        onEnded={() => { unlockBonus(); trackVideoComplete(); }}
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
            width: 96,
            height: 96,
            placeItems: "center",
            border: "3px solid #ef4444",
            borderRadius: 999,
            background: "rgba(239, 68, 68, 0.18)",
            boxShadow: "0 0 0 6px rgba(239, 68, 68, 0.18), 0 16px 34px rgba(0, 0, 0, 0.32)",
            cursor: "pointer",
            transform: "translate(-50%, -50%)",
            animation: "playBounce 1.7s ease-in-out infinite",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 0,
              height: 0,
              marginLeft: 7,
              borderTop: "20px solid transparent",
              borderBottom: "20px solid transparent",
              borderLeft: "31px solid #ef4444",
            }}
          />
        </button>
      ) : null}
    </main>
  );
}
