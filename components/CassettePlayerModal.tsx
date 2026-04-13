"use client";

import { useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent, YouTubeProps } from "react-youtube";
import { Pause, Play, X, ExternalLink } from "lucide-react";

type Song = {
  id?: number;
  nickname: string;
  youtubeUrl: string;
  comment: string;
  thumbnailUrl: string;
  title?: string;
  votes?: number;
  voters?: string[];
};

type CassettePlayerModalProps = {
  song: Song | null;
  onClose: () => void;
  onNext: () => void;
  hasNextSong: boolean;
};

function getYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1);
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v") || "";
    }

    return "";
  } catch {
    return "";
  }
}

export default function CassettePlayerModal({
  song,
  onClose,
  onNext,
  hasNextSong,
}: CassettePlayerModalProps) {
  const playerRef = useRef<any>(null);
  const isTransitioningRef = useRef(false);
  const isClosingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  const videoId = song ? getYouTubeVideoId(song.youtubeUrl) : "";

  // Trigger animation on mount
  useEffect(() => {
    setIsAnimatingIn(true);
  }, []);

  useEffect(() => {
    isTransitioningRef.current = false;
    isClosingRef.current = false;
    setIsPlaying(false);

    return () => {
      isClosingRef.current = true;

      if (playerRef.current?.stopVideo) {
        try {
          playerRef.current.stopVideo();
        } catch {
          // ignore
        }
      }
    };
  }, [videoId]);

  function handleReady(event: YouTubeEvent) {
    playerRef.current = event.target;
    isTransitioningRef.current = false;
    isClosingRef.current = false;
    setIsPlaying(true);
  }

  function handleEndedOnce() {
    if (isTransitioningRef.current || isClosingRef.current) return;

    isTransitioningRef.current = true;
    setIsPlaying(false);

    if (hasNextSong) {
      onNext();
      return;
    }

    if (playerRef.current?.stopVideo) {
      try {
        playerRef.current.stopVideo();
      } catch {
        // ignore
      }
    }

    handleClose();
  }

  function handleStateChange(event: { data: number }) {
    if (isClosingRef.current) return;

    if (event.data === 1) {
      setIsPlaying(true);
      return;
    }

    if (event.data === 2) {
      setIsPlaying(false);
      return;
    }

    if (event.data === 0) {
      handleEndedOnce();
    }
  }

  function handlePlayPause() {
    if (!playerRef.current || isTransitioningRef.current) return;

    const state = playerRef.current.getPlayerState?.();

    if (state === 1) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }

  function handleClose() {
    isClosingRef.current = true;
    isTransitioningRef.current = true;
    setIsAnimatingIn(false);

    if (playerRef.current?.stopVideo) {
      try {
        playerRef.current.stopVideo();
      } catch {
        // ignore
      }
    }

    setIsPlaying(false);

    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 350);
  }

  function handleOverlayClick() {
    handleClose();
  }

  const opts: YouTubeProps["opts"] = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 1,
      rel: 0,
      playsinline: 1,
    },
  };

  if (!song || !videoId) return null;

  return (
    <>
      {/* Dark overlay with blur - fades in */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-350`}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: isAnimatingIn ? "blur(8px)" : "blur(0px)",
          opacity: isAnimatingIn ? 1 : 0,
        }}
        onClick={handleOverlayClick}
      />

      {/* Cassette player - slides into center view */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none transition-all"
        style={{
          transitionDuration: "350ms",
          transitionTimingFunction: "ease-out",
        }}
      >
        <div
          className="w-full max-w-sm pointer-events-auto transition-all"
          style={{
            transform: isAnimatingIn
              ? "translateY(0) scale(1)"
              : "translateY(40px) scale(0.95)",
            opacity: isAnimatingIn ? 1 : 0,
            transitionDuration: "350ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Cassette card with animation */}
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-white p-4"
            style={{
              aspectRatio: "5 / 3.2",
            }}
          >
            {/* Background cassette image */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                backgroundImage: "url('/tape.png')",
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                zIndex: 0,
              }}
            />

            {/* Dark overlay tint for orange label */}
            {song.thumbnailUrl && (
              <div
                className="absolute transition-opacity"
                style={{
                  top: "63%",
                  left: "8%",
                  right: "8%",
                  bottom: "5%",
                  backgroundColor: "rgba(255, 140, 0, 0.12)",
                  mixBlendMode: "multiply",
                  zIndex: 5,
                }}
              />
            )}

            {/* White label text content */}
            <div
              className="absolute flex flex-col justify-start"
              style={{
                top: "14%",
                left: "9%",
                width: "70%",
                height: "13%",
                zIndex: 10,
              }}
            >
              {/* Title */}
              <h2 className="text-xs font-extrabold leading-tight line-clamp-2 text-black mb-1">
                {song.title || "YouTube Video"}
              </h2>

              {/* Divider */}
              <div className="h-px bg-black/40 mb-1" style={{ width: "65%" }} />

              {/* Comment */}
              {song.comment && (
                <p className="text-[9px] text-black/70 leading-snug font-light line-clamp-1">
                  {song.comment}
                </p>
              )}
            </div>

            {/* Username signature */}
            <div
              className="absolute text-[7px] font-semibold text-black/80 text-right"
              style={{
                top: "25%",
                right: "9%",
                zIndex: 10,
              }}
            >
              by @{song.nickname}
            </div>

            {/* Close button - top right corner */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
              aria-label="닫기"
              type="button"
            >
              <X size={16} />
            </button>

            {/* Player controls - bottom overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-center justify-between"
              style={{
                height: "20%",
              }}
            >
              {/* Play/Pause button */}
              <button
                onClick={handlePlayPause}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-100"
                aria-label={isPlaying ? "일시정지" : "재생"}
                type="button"
              >
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </button>

              {/* YouTube link */}
              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                aria-label="유튜브에서 열기"
              >
                <ExternalLink size={16} />
              </a>

              {/* Song info display */}
              <div className="flex-1 px-4 text-white">
                <p className="text-sm font-semibold truncate">
                  {song.title || "YouTube Video"}
                </p>
                <p className="text-xs text-white/80 truncate">@{song.nickname}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden YouTube player */}
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={handleReady}
        onStateChange={handleStateChange}
      />
    </>
  );
}
