"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
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
  Plus,
  Edit2,
  CircleHelp,
} from "lucide-react";
import SongCard from "@/components/SongCard";
import FrissonPlayer from "@/components/FrissonPlayer";
import FrissonLetterModal from "@/components/FrissonLetterModal";
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
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sortType, setSortType] = useState<SortType>(
    isSubmissionOpen ? "latest" : "popular"
  );
  const [heardSongs, setHeardSongs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLikedOnly, setShowLikedOnly] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number[]>([]);
  const [isFrissonLetterOpen, setIsFrissonLetterOpen] = useState(false);
  const [userSong, setUserSong] = useState<Song | null>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonPos, setButtonPos] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    async function fetchSongs() {
      setIsLoading(true);
      const currentNickname = sessionStorage.getItem("nickname");

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

      // Check if current user has submitted a song
      const currentUserSong = formattedSongs.find(
        (song) => song.nickname === currentNickname
      );
      if (currentUserSong) {
        setUserSong(currentUserSong);
      }

      setIsLoading(false);
    }

    fetchSongs();

    const storedHeardSongs = localStorage.getItem("heardSongs");
    if (storedHeardSongs) {
      setHeardSongs(JSON.parse(storedHeardSongs));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[data-sort-dropdown-button]') &&
        !target.closest('[data-sort-dropdown-menu]')
      ) {
        setIsSortDropdownOpen(false);
      }
    }

    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSortDropdownOpen]);

  useEffect(() => {
    if (isSortDropdownOpen && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setButtonPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isSortDropdownOpen]);

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0eb,_#f7f8f6_35%,_#ede9e8)] text-neutral-900">
      <div className="mx-auto w-full max-w-7xl px-5 py-8 pb-[140px] md:px-6 md:py-10">
        <header className="mb-8 rounded-[28px] border border-white/50 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl overflow-visible">
          <div className="flex flex-col gap-6 p-6 md:p-8 overflow-visible">
            <div className="flex items-start justify-between gap-4 overflow-visible">
              <div className="space-y-6">
                <button
                  onClick={() => {
                    sessionStorage.removeItem("nickname");
                    router.push("/");
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white/80 hover:bg-white transition"
                  aria-label="돌아가기"
                  type="button"
                >
                  <ArrowLeft size={18} />
                </button>

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

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setIsFrissonLetterOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white sm:h-11 sm:w-11"
                  aria-label="Frisson Letter"
                  title="Frisson Letter"
                  type="button"
                >
                  <CircleHelp size={18} />
                </button>

                {isSubmissionOpen &&
                  (userSong ? (
                    <button
                      onClick={() => router.push(`/submit?edit=${userSong.id}`)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white sm:h-11 sm:w-11"
                      aria-label="곡 수정하기"
                      title="곡 수정하기"
                      type="button"
                    >
                      <Edit2 size={18} />
                    </button>
                  ) : (
                    <Link
                      href="/submit"
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white sm:h-11 sm:w-11"
                      aria-label="곡 제출하기"
                      title="곡 제출하기"
                    >
                      <Plus size={18} />
                    </Link>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 items-center overflow-visible">
              <div className="relative inline-block">
                <button
                  ref={sortButtonRef}
                  data-sort-dropdown-button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-sm text-neutral-700 hover:bg-white transition"
                  type="button"
                >
                  {sortType === "latest"
                    ? "최신순"
                    : sortType === "oldest"
                    ? "등록순"
                    : "인기순"}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isSortDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              <label className="inline-flex items-center gap-3 rounded-full border border-neutral-200 bg-white/80 px-3 py-2 text-sm text-neutral-700">
                <span className="select-none">내 Frisson만</span>

                <button
                  type="button"
                  onClick={() => setShowLikedOnly((prev) => !prev)}
                  aria-pressed={showLikedOnly}
                  className={`relative h-7 w-12 rounded-full transition ${
                    showLikedOnly ? "bg-emerald-600" : "bg-neutral-300"
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

        {isSortDropdownOpen && buttonPos && (
          <div
            data-sort-dropdown-menu
            className="fixed w-40 rounded-2xl border border-neutral-200 bg-white shadow-lg z-[9999]"
            style={{
              top: `${buttonPos.top + 8}px`,
              left: `${buttonPos.left}px`,
            }}
          >
            <button
              onClick={() => {
                setSortType("latest");
                setIsSortDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm rounded-t-2xl transition ${
                sortType === "latest"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
              type="button"
            >
              최신순
            </button>
            <button
              onClick={() => {
                setSortType("oldest");
                setIsSortDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition ${
                sortType === "oldest"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
              type="button"
            >
              등록순
            </button>
            <button
              onClick={() => {
                setSortType("popular");
                setIsSortDropdownOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm rounded-b-2xl transition ${
                sortType === "popular"
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
              type="button"
            >
              인기순
            </button>
          </div>
        )}

        {!isLoading && songs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 w-full max-w-6xl mx-auto lg:grid-cols-2">
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

              return (
                <SongCard
                  key={`${song.id}-${index}`}
                  id={song.id}
                  title={song.title || "YouTube Video"}
                  comment={song.comment}
                  nickname={song.nickname}
                  thumbnailUrl={song.thumbnailUrl}
                  youtubeUrl={song.youtubeUrl}
                  votes={song.votes ?? 0}
                  isHeard={isHeard}
                  hasVoted={hasVoted}
                  onPlay={() => {
                    setSelectedSong(song);
                    markAsHeard(song);
                  }}
                  onVote={() => handleVote(song)}
                  onClick={() => {
                    setSelectedSong(song);
                    markAsHeard(song);
                  }}
                />
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

      <FrissonLetterModal
        isOpen={isFrissonLetterOpen}
        onClose={() => setIsFrissonLetterOpen(false)}
      />
    </main>
  );
}
