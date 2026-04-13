"use client";

import { ExternalLink, Heart, Play, Headphones } from "lucide-react";

type SongCardProps = {
  id?: number;
  title: string;
  comment?: string;
  nickname: string;
  thumbnailUrl?: string;
  youtubeUrl: string;
  votes?: number;
  isHeard?: boolean;
  hasVoted?: boolean;
  onPlay?: () => void;
  onVote?: () => void;
  onClick?: () => void;
};

export default function SongCard({
  id,
  title,
  comment,
  nickname,
  thumbnailUrl,
  youtubeUrl,
  votes = 0,
  isHeard = false,
  hasVoted = false,
  onPlay,
  onVote,
  onClick,
}: SongCardProps) {
  function handlePlayClick(e: React.MouseEvent) {
    e.stopPropagation();
    onPlay?.();
  }

  function handleVoteClick(e: React.MouseEvent) {
    e.stopPropagation();
    onVote?.();
  }

  return (
    <div
      onClick={onClick}
      className="group relative min-h-[13rem] sm:min-h-0 overflow-hidden rounded-[28px] cursor-pointer transition-all duration-300 shadow-[0_18px_45px_rgba(15,23,42,0.12)] hover:shadow-[0_22px_55px_rgba(15,23,42,0.16)]"
      style={{ aspectRatio: "8 / 5" }}
    >
      {/* Full-cover blurred background image layer */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title || "YouTube Video"}
            className="h-full w-full object-cover scale-110 blur-lg"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-neutral-400 via-neutral-500 to-neutral-600 blur-lg" />
        )}
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Foreground content layer */}
      <div className="relative z-10 h-full w-full flex flex-col justify-between p-6">
        {/* Top section - badges */}
        <div className="w-full flex items-start justify-between gap-3">
          {/* Listened badge */}
          <div>
            {isHeard && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/25 backdrop-blur-md text-white px-2.5 py-1 text-[9px] font-semibold border border-white/30 whitespace-nowrap">
                <Headphones size={11} />
                들음
              </span>
            )}
          </div>

          {/* Username badge */}
          <div className="inline-flex rounded-full bg-white/25 backdrop-blur-md text-white px-3 py-1.5 text-[10px] font-semibold border border-white/30 max-w-[140px] truncate whitespace-nowrap">
            @{nickname}
          </div>
        </div>

        {/* Middle section - title and comment */}
        <div className="w-full min-w-0 flex flex-col gap-1.5">
          {/* Title */}
          <h3 className="font-bold text-lg text-white line-clamp-2 leading-snug drop-shadow-lg">
            {title || "YouTube Video"}
          </h3>

          {/* Comment */}
          {comment && (
            <p className="mb-1.5 text-xs text-white/85 line-clamp-3 italic font-light drop-shadow-md">
              "{comment}"
            </p>
          )}
        </div>

        {/* Bottom section - buttons and votes */}
        <div className="w-full flex items-end justify-between gap-3">
          {/* Action buttons - left */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handlePlayClick}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/30 border border-white/40 text-white transition hover:bg-white/50 backdrop-blur-md shadow-lg"
              aria-label="재생하기"
            >
              <Play size={14} fill="currentColor" />
            </button>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/30 border border-white/40 text-white transition hover:bg-white/50 backdrop-blur-md shadow-lg"
              aria-label="유튜브 열기"
            >
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Vote pill - right */}
          <button
            onClick={handleVoteClick}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition backdrop-blur-md border whitespace-nowrap ${
              hasVoted
                ? "bg-red-400/60 border-red-300/50 text-white shadow-lg"
                : "bg-white/30 border-white/40 text-white hover:bg-white/50 shadow-lg"
            }`}
            aria-label="투표하기"
          >
            <Heart
              size={14}
              className={hasVoted ? "fill-current" : ""}
            />
            {votes}
          </button>
        </div>
      </div>

      {/* Subtle border highlight */}
      <div className="absolute inset-0 rounded-[28px] border border-white/10 pointer-events-none" />
    </div>
  );
}
