"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Heart,
  Play,
  Clock3,
  Flame,
  Headphones,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import FrissonPlayer from "@/components/FrissonPlayer";
import { isSubmissionOpen } from "@/config";
import { supabase } from "@/lib/supabase";

type Song = {
  id: number;
  nickname: string;
  youtubeUrl: string;
  comment: string;
  thumbnailUrl: string;
  title: string;
  votes?: number;
  voters?: string[];
  createdAt?: string;
};

type SortType = "latest" | "oldest" | "popular";

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sortType, setSortType] = useState<SortType>(
    isSubmissionOpen ? "latest" : "popular"
  );
  const [heardSongs, setHeardSongs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);

  useEffect(() => {
    async function fetchSongs() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error(error);
        alert("곡 목록을 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
        return;
      }

      const formattedSongs: Song[] = (data ?? []).map((song) => ({
        id: song.id,
        nickname: song.nickname,
        youtubeUrl: song.youtube_url,
        comment: song.comment,
        thumbnailUrl: song.thumbnail_url ?? "",
        title: song.title ?? "",
        votes: song.votes ?? 0,
        voters: song.voters ?? [],
        createdAt: song.created_at,
      }));

      setSongs(formattedSongs);
      setIsLoading(false);
    }

    fetchSongs();

    const storedHeardSongs = localStorage.getItem("heardSongs");
    if (storedHeardSongs) {
      setHeardSongs(JSON.parse(storedHeardSongs));
    }
  }, []);

  function markAsHeard(song: Song) {
    const songKey = `${song.nickname}-${song.youtubeUrl}`;

    if (heardSongs.includes(songKey)) return;

    const updatedHeardSongs = [...heardSongs, songKey];
    setHeardSongs(updatedHeardSongs);
    localStorage.setItem("heardSongs", JSON.stringify(updatedHeardSongs));
  }

  function toggleComment(songId: number) {
    setExpandedComments((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  }

  async function handleVote(song: Song) {
    const nickname = sessionStorage.getItem("nickname");

    if (!nickname) {
      alert("먼저 닉네임을 입력하세요!");
      return;
    }

    if (song.nickname === nickname) {
      alert("자기 곡에는 투표할 수 없습니다.");
      return;
    }

    const voters = song.voters ?? [];
    const hasVoted = voters.includes(nickname);

    let updatedVoters: string[];
    let updatedVotes: number;

    if (hasVoted) {
      updatedVoters = voters.filter((voter) => voter !== nickname);
      updatedVotes = Math.max((song.votes ?? 0) - 1, 0);
    } else {
      updatedVoters = [...voters, nickname];
      updatedVotes = (song.votes ?? 0) + 1;
    }

    const { error } = await supabase
      .from("songs")
      .update({
        votes: updatedVotes,
        voters: updatedVoters,
      })
      .eq("id", song.id);

    if (error) {
      console.error(error);
      alert("투표 중 오류가 발생했습니다.");
      return;
    }

    const updatedSongs = songs.map((currentSong) =>
      currentSong.id === song.id
        ? {
            ...currentSong,
            votes: updatedVotes,
            voters: updatedVoters,
          }
        : currentSong
    );

    setSongs(updatedSongs);

    if (selectedSong && selectedSong.id === song.id) {
      const updatedSelectedSong = updatedSongs.find(
        (updatedSong) => updatedSong.id === song.id
      );

      if (updatedSelectedSong) {
        setSelectedSong(updatedSelectedSong);
      }
    }
  }

  const nickname =
    typeof window !== "undefined" ? sessionStorage.getItem("nickname") : null;

  const filteredSongs = useMemo(() => {
    return showLikedOnly
      ? songs.filter((song) => nickname && (song.voters ?? []).includes(nickname))
      : songs;
  }, [songs, showLikedOnly, nickname]);

  const sortedSongs = useMemo(() => {
    const copied = [...filteredSongs];

    if (sortType === "popular") {
      return copied.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    }

    if (sortType === "latest") {
      return copied.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    return copied.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return aTime - bTime;
    });
  }, [filteredSongs, sortType]);

  const currentSongIndex = selectedSong
    ? sortedSongs.findIndex((song) => song.id === selectedSong.id)
    : -1;

  const hasNextSong =
    currentSongIndex !== -1 && currentSongIndex < sortedSongs.length - 1;

  function handleNextSong() {
    if (!selectedSong) {
      setSelectedSong(null);
      return;
    }

    const currentIndex = sortedSongs.findIndex(
      (song) => song.id === selectedSong.id
    );

    if (currentIndex === -1) {
      setSelectedSong(null);
      return;
    }

    const nextSong = sortedSongs[currentIndex + 1];

    if (!nextSong) {
      setSelectedSong(null);
      return;
    }

    setSelectedSong(nextSong);
    markAsHeard(nextSong);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ede9fe,_#f8fafc_35%,_#e2e8f0)] text-neutral-900">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 pb-[140px] md:px-6 md:py-10">
        <header className="mb-8 rounded-[28px] border border-white/50 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-6">
                <Link
                  href="/"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white/80 hover:bg-white"
                >
                  <ArrowLeft size={18} />
                </Link>

                <div>
                  <h1 className="m-0 text-4xl font-semibold tracking-tight md:text-5xl">
                    Songs
                  </h1>
                  <p className="mt-2 text-sm text-neutral-500">총 {songs.length}곡</p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 md:text-base">
                    {isSubmissionOpen
                      ? "이번 시즌에 등록된 frisson 곡들입니다. 마음에 드는 곡을 재생하고, 전율이 오는 곡에 투표해보세요."
                      : "이번 시즌 투표가 종료되었습니다. 가장 많은 frisson을 받은 곡들을 확인해보세요."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSortType("latest")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  sortType === "latest"
                    ? "bg-neutral-900 text-white"
                    : "border border-neutral-200 bg-white/80 text-neutral-700 hover:bg-white"
                }`}
              >
                <Clock3 size={16} />
                최신순
              </button>

              <button
                onClick={() => setSortType("oldest")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  sortType === "oldest"
                    ? "bg-neutral-900 text-white"
                    : "border border-neutral-200 bg-white/80 text-neutral-700 hover:bg-white"
                }`}
              >
                <Clock3 size={16} />
                등록순
              </button>

              <button
                onClick={() => setSortType("popular")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                  sortType === "popular"
                    ? "bg-neutral-900 text-white"
                    : "border border-neutral-200 bg-white/80 text-neutral-700 hover:bg-white"
                }`}
              >
                <Flame size={16} />
                인기순
              </button>

              <label className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white/80 px-3 py-2 text-sm text-neutral-700">
                <span className="select-none">내 Frisson만</span>

                <button
                  type="button"
                  onClick={() => setShowLikedOnly((prev) => !prev)}
                  aria-pressed={showLikedOnly}
                  className={`relative h-7 w-12 rounded-full transition ${
                    showLikedOnly ? "bg-neutral-900" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                      showLikedOnly ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="rounded-[24px] border border-white/50 bg-white/60 p-6 text-neutral-600 shadow-sm backdrop-blur-xl">
            곡 목록을 불러오는 중...
          </div>
        )}

        {!isLoading && sortedSongs.length === 0 && (
          <p>
            {showLikedOnly
              ? "아직 Frisson한 곡이 없습니다."
              : "아직 등록된 곡이 없습니다."}
          </p>
        )}

        {!isLoading && songs.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedSongs.map((song, index) => {
              const isSelected =
                selectedSong?.youtubeUrl === song.youtubeUrl &&
                selectedSong?.nickname === song.nickname;

              const isHeard = heardSongs.includes(
                `${song.nickname}-${song.youtubeUrl}`
              );

              const nickname =
                typeof window !== "undefined"
                  ? sessionStorage.getItem("nickname")
                  : null;

              const hasVoted =
                !!nickname && (song.voters ?? []).includes(nickname);

              const isExpanded = expandedComments.includes(song.id);
              const isLongComment = (song.comment ?? "").length > 70;

              return (
                <article
                  key={`${song.id}-${index}`}
                  onClick={() => {
                    setSelectedSong(song);
                    markAsHeard(song);
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-[28px] border transition-all duration-300 ${
                    isSelected
                      ? "border-white/70 ring-2 ring-violet-300 shadow-[0_20px_50px_rgba(109,40,217,0.18)]"
                      : "border-white/50 shadow-[0_18px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(15,23,42,0.12)]"
                  }`}
                >
                  {song.thumbnailUrl ? (
                    <>
                      <div
                        className="absolute inset-0 scale-[2] bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${song.thumbnailUrl})`,
                        }}
                      />
                      <div className="absolute inset-0 bg-black/45" />
                      <div className="absolute inset-0 backdrop-blur-md" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-600" />
                  )}

                  <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-5 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {isHeard && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/16 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                            <Headphones size={12} />
                            이미 들음
                          </span>
                        )}

                        {isSelected && (
                          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                            지금 재생 중
                          </span>
                        )}
                      </div>

                      <div className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                        @{song.nickname}
                      </div>
                    </div>

                    <div className="mt-10 space-y-3">
                      <h2 className="line-clamp-2 text-2xl font-semibold leading-tight drop-shadow">
                        {song.title || "YouTube Video"}
                      </h2>

                      {song.comment && (
                        <div>
                          <p
                            className={`italic text-white/90 ${
                              isExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            “{song.comment}”
                          </p>

                          {isLongComment && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleComment(song.id);
                              }}
                              className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 transition hover:text-white"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp size={14} />
                                  접기
                                </>
                              ) : (
                                <>
                                  <ChevronDown size={14} />
                                  더보기
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSong(song);
                            markAsHeard(song);
                          }}
                          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                            isSelected
                              ? "border-white/30 bg-white/25 text-white"
                              : "border-white/20 bg-white/12 text-white hover:bg-white/20"
                          }`}
                          aria-label={isSelected ? "재생 중" : "재생하기"}
                        >
                          <Play size={18} fill="currentColor" />
                        </button>

                        <a
                          href={song.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-white transition hover:bg-white/20"
                          aria-label="유튜브 열기"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(song);
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium backdrop-blur-sm transition ${
                          hasVoted
                            ? "bg-white text-neutral-900"
                            : "bg-white/16 text-white hover:bg-white/24"
                        }`}
                      >
                        <Heart size={16} className={hasVoted ? "fill-current" : ""} />
                        {song.votes ?? 0}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {selectedSong && (
          <div className="fixed bottom-5 left-5 right-5 z-[1000] mx-auto max-w-3xl">
            <FrissonPlayer
              key={selectedSong.id}
              song={selectedSong}
              onClose={() => {
                setSelectedSong(null);
              }}
              onNext={handleNextSong}
              hasNextSong={hasNextSong}
            />
          </div>
        )}
      </div>
    </main>
  );
}
