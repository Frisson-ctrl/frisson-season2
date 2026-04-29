"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  CircleHelp,
} from "lucide-react";
import SongCard from "@/components/SongCard";
import FrissonPlayer from "@/components/FrissonPlayer";
import FrissonLetterModal from "@/components/FrissonLetterModal";
import { loadCsvSongs } from "@/lib/loadCsvSongs";
import type { Song } from "@/types/song";

type SortType = "latest" | "oldest" | "popular";

export default function SongsPage() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sortType, setSortType] = useState<SortType>("popular");
  const [heardSongs, setHeardSongs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isFrissonLetterOpen, setIsFrissonLetterOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [buttonPos, setButtonPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    async function fetchSongs() {
      try {
        setIsLoading(true);
        setLoadError("");
        setSongs(await loadCsvSongs());
      } catch (error) {
        console.error(error);
        setLoadError("곡 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
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
        !target.closest("[data-sort-dropdown-button]") &&
        !target.closest("[data-sort-dropdown-menu]")
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
    const songKey = `${song.nickname}-${song.youtube_url}`;

    if (heardSongs.includes(songKey)) return;

    const updatedHeardSongs = [...heardSongs, songKey];
    setHeardSongs(updatedHeardSongs);
    localStorage.setItem("heardSongs", JSON.stringify(updatedHeardSongs));
  }

  const sortedSongs = useMemo(() => {
    const copied = [...songs];

    if (sortType === "popular") {
      return copied.sort((a, b) => (b.votes ?? 0) - (a.votes ?? 0));
    }

    if (sortType === "latest") {
      return copied.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }

    return copied.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return aTime - bTime;
    });
  }, [songs, sortType]);

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
        <header className="mb-8 overflow-visible rounded-[28px] border border-white/50 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 overflow-visible p-4 sm:p-5 md:p-8">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white/80 transition hover:bg-white"
                aria-label="돌아가기"
                type="button"
              >
                <ArrowLeft size={18} />
              </button>

              <button
                onClick={() => setIsFrissonLetterOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white sm:h-11 sm:w-11"
                aria-label="Frisson Letter"
                title="Frisson Letter"
                type="button"
              >
                <CircleHelp size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="m-0 text-4xl font-semibold tracking-tight md:text-5xl">
                Songs
              </h1>
              <p className="m-0 text-sm text-neutral-500">총 {songs.length}곡</p>
              <p className="m-0 mt-2 text-base font-semibold tracking-tight text-neutral-800 md:text-lg">
                C2를 함께한, 나만의 능률 오르는 작업곡
              </p>
              <p className="m-0 mt-3 text-sm leading-7 text-neutral-600 md:text-base">
                시즌2는 마감되었고, 이 페이지는 완성된 플레이리스트 아카이브로 남아 있습니다.
                함께 남긴 frisson 곡들을 다시 재생하고, 그때의 코멘트를 천천히 둘러보세요.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 overflow-visible">
              <div className="relative inline-block">
                <button
                  ref={sortButtonRef}
                  data-sort-dropdown-button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-sm text-neutral-700 transition hover:bg-white"
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
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="rounded-[24px] border border-white/50 bg-white/60 p-6 text-neutral-600 shadow-sm backdrop-blur-xl">
            곡 목록을 불러오는 중...
          </div>
        )}

        {!isLoading && loadError && (
          <div className="rounded-[24px] border border-white/50 bg-white/60 p-6 text-neutral-600 shadow-sm backdrop-blur-xl">
            {loadError}
          </div>
        )}

        {isSortDropdownOpen && buttonPos && (
          <div
            data-sort-dropdown-menu
            className="fixed z-[9999] w-40 rounded-2xl border border-neutral-200 bg-white shadow-lg"
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
              className={`w-full rounded-t-2xl px-4 py-2 text-left text-sm transition ${
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
              className={`w-full rounded-b-2xl px-4 py-2 text-left text-sm transition ${
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

        {!isLoading && !loadError && songs.length > 0 && (
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-2">
            {sortedSongs.map((song, index) => {
              const isHeard = heardSongs.includes(
                `${song.nickname}-${song.youtube_url}`
              );

              return (
                <SongCard
                  key={`${song.id}-${index}`}
                  id={song.id}
                  title={song.title || "YouTube Video"}
                  comment={song.comment}
                  nickname={song.nickname}
                  thumbnailUrl={song.thumbnail_url}
                  youtubeUrl={song.youtube_url}
                  votes={song.votes ?? 0}
                  isHeard={isHeard}
                  onPlay={() => {
                    setSelectedSong(song);
                    markAsHeard(song);
                  }}
                  onClick={() => {
                    setSelectedSong(song);
                    markAsHeard(song);
                  }}
                />
              );
            })}
          </div>
        )}

        {!isLoading && !loadError && songs.length === 0 && (
          <div className="rounded-[24px] border border-white/50 bg-white/60 p-6 text-neutral-600 shadow-sm backdrop-blur-xl">
            아직 표시할 곡이 없습니다.
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
