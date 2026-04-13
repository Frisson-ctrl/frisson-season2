"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ExternalLink, Music4, Send } from "lucide-react";
import SongCard from "@/components/SongCard";
import { isSubmissionOpen } from "@/config";
import { supabase } from "@/lib/supabase";

function getYouTubeThumbnail(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.slice(1);
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }

    return "";
  } catch {
    return "";
  }
}

async function getYouTubeTitle(url: string) {
  try {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      return "YouTube Video";
    }

    const data = await response.json();
    return data.title ?? "YouTube Video";
  } catch {
    return "YouTube Video";
  }
}

type SubmittedSong = {
  id?: number;
  nickname: string;
  youtubeUrl: string;
  comment: string;
  thumbnailUrl: string;
  title: string;
};

export default function SubmitClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nickname, setNickname] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [comment, setComment] = useState("");
  const [submittedSong, setSubmittedSong] = useState<SubmittedSong | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSongId, setEditSongId] = useState<number | null>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [originalComment, setOriginalComment] = useState("");

  useEffect(() => {
    async function initialize() {
      const savedNickname = sessionStorage.getItem("nickname");

      if (!savedNickname) {
        alert("먼저 홈에서 닉네임을 입력해주세요.");
        window.location.href = "/";
        return;
      }

      setNickname(savedNickname);

      // Check if in edit mode
      const editParam = searchParams.get("edit");
      if (editParam) {
        setIsEditMode(true);
        const songId = parseInt(editParam, 10);
        setEditSongId(songId);

        // Fetch existing song data
        const { data: existingSong, error } = await supabase
          .from("songs")
          .select("*")
          .eq("id", songId)
          .maybeSingle();

        if (error || !existingSong) {
          alert("곡을 불러오는 중 오류가 발생했습니다.");
          router.push("/songs");
          return;
        }

        // Load existing song data
        setYoutubeUrl(existingSong.youtube_url);
        setComment(existingSong.comment);
        setOriginalComment(existingSong.comment);
        setSubmittedSong({
          id: existingSong.id,
          nickname: existingSong.nickname,
          youtubeUrl: existingSong.youtube_url,
          comment: existingSong.comment,
          thumbnailUrl: existingSong.thumbnail_url ?? "",
          title: existingSong.title ?? "",
        });
      }

      setIsPageLoading(false);
    }

    initialize();
  }, [searchParams, router]);

  async function handleSubmit() {
    if (!nickname.trim() || !youtubeUrl.trim() || !comment.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (comment.trim().length > 130) {
      alert("코멘트는 130자 이하여야 합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && editSongId) {
        // Edit mode: Update only the URL
        const thumbnailUrl = getYouTubeThumbnail(youtubeUrl);
        const title = await getYouTubeTitle(youtubeUrl);

        const { error: updateError } = await supabase
          .from("songs")
          .update({
            youtube_url: youtubeUrl,
            thumbnail_url: thumbnailUrl,
            title,
          })
          .eq("id", editSongId);

        if (updateError) {
          console.error(updateError);
          alert("곡 수정 중 오류가 발생했습니다.");
          setIsSubmitting(false);
          return;
        }

        alert("곡이 성공적으로 수정되었습니다.");
        router.push("/songs");
      } else {
        // Create mode: Insert new song
        const thumbnailUrl = getYouTubeThumbnail(youtubeUrl);
        const title = await getYouTubeTitle(youtubeUrl);

        const { data: existingSong, error: checkError } = await supabase
          .from("songs")
          .select("id")
          .eq("nickname", nickname)
          .maybeSingle();

        if (checkError) {
          console.error(checkError);
          alert("기존 제출 여부를 확인하는 중 오류가 발생했습니다.");
          setIsSubmitting(false);
          return;
        }

        if (existingSong) {
          alert("이미 곡을 제출했습니다. 한 사람당 한 곡만 가능합니다.");
          setIsSubmitting(false);
          return;
        }

        const { error: insertError } = await supabase.from("songs").insert([
          {
            nickname,
            youtube_url: youtubeUrl,
            comment,
            thumbnail_url: thumbnailUrl,
            title,
          },
        ]);

        if (insertError) {
          console.error(insertError);
          alert("곡 저장 중 오류가 발생했습니다.");
          setIsSubmitting(false);
          return;
        }

        setSubmittedSong({
          nickname,
          youtubeUrl,
          comment,
          thumbnailUrl,
          title,
        });

        setYoutubeUrl("");
        setComment("");
        alert("곡이 성공적으로 등록되었습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSubmissionOpen && !isEditMode) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0eb,_#f7f8f6_35%,_#ede9e8)] px-5 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-white/50 bg-white/65 p-8 text-center shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-10">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white">
              <Music4 size={24} />
            </div>

            <h1 className="m-0 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
              이번 시즌 제출이 마감되었습니다
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-600 md:text-base">
              현재는 새로운 곡을 제출할 수 없습니다.
              <br />
              곡 목록에서 이번 시즌의 frisson 곡들을 감상해보세요.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-5 py-3 text-sm text-neutral-700 transition hover:bg-white"
              >
                <ArrowLeft size={16} />
                홈으로
              </Link>

              <Link
                href="/songs"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm text-white transition hover:bg-neutral-800"
              >
                <Music4 size={16} />
                곡 목록 보기
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0eb,_#f7f8f6_35%,_#ede9e8)] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/50 bg-white/65 p-7 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="space-y-6">
                <button
                  onClick={() => router.push("/songs")}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-neutral-200 bg-white/80 hover:bg-white transition"
                  type="button"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="m-0 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                    {isEditMode ? "곡 수정하기" : "곡 제출하기"}
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-neutral-600 md:text-base">
                    @{nickname} 님
                    {isEditMode ? "의 곡을 수정하세요." : "의 frisson 곡을 등록하세요."}
                    {!isEditMode && (
                      <>
                        <br />
                        한 사람당 한 곡만 제출할 수 있습니다!
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  닉네임
                </label>
                <input
                  value={nickname}
                  disabled
                  placeholder="닉네임"
                  className="h-14 w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-4 text-[15px] text-neutral-500 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  유튜브 링크
                </label>
                <input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="h-14 w-full rounded-2xl border border-neutral-200 bg-white/80 px-4 text-[15px] text-neutral-900 outline-none transition focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  한 줄 코멘트
                  {isEditMode && (
                    <span className="ml-2 text-xs text-neutral-500">(수정 불가)</span>
                  )}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => !isEditMode && setComment(e.target.value)}
                  disabled={isEditMode}
                  maxLength={130}
                  placeholder="이 곡이 왜 frisson인지 짧게 남겨주세요."
                  rows={4}
                  className={`w-full resize-none rounded-2xl border border-neutral-200 px-4 py-4 text-[15px] outline-none transition ${
                    isEditMode
                      ? "bg-neutral-100 text-neutral-500"
                      : "bg-white/80 text-neutral-900 focus:border-neutral-400"
                  }`}
                />
                <div className="mt-1.5 flex justify-end text-xs text-neutral-500">
                  {comment.length} / 130
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isPageLoading}
                className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-medium transition ${
                  isSubmitting || isPageLoading
                    ? "cursor-not-allowed bg-neutral-300 text-white"
                    : "bg-neutral-900 text-white hover:scale-[1.01] hover:bg-neutral-800 active:scale-[0.99]"
                }`}
              >
                <Send size={16} />
                {isPageLoading
                  ? "로딩 중..."
                  : isSubmitting
                  ? isEditMode
                    ? "수정 중..."
                    : "등록 중..."
                  : isEditMode
                  ? "수정하기"
                  : "등록하기"}
              </button>
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/50 bg-white/65 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-7">
            <div className="mb-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-xs text-neutral-600">
                <Music4 size={14} />
                {isEditMode ? "현재 곡" : "미리보기"}
              </div>

              <h2 className="m-0 text-xl font-semibold text-neutral-900">
                {isEditMode ? "현재 등록된 곡" : "제출 미리보기"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {isEditMode
                  ? "수정 중인 곡의 현재 정보입니다."
                  : "등록이 완료되면 이런 느낌으로 보여집니다."}
              </p>
            </div>

            {youtubeUrl || submittedSong?.thumbnailUrl ? (
              <div className="mb-4 flex flex-col gap-4">
                <SongCard
                  title={submittedSong?.title || "유튜브 제목을 불러오면 여기에 표시됩니다."}
                  comment={submittedSong?.comment || comment}
                  nickname={submittedSong?.nickname || nickname || "nickname"}
                  thumbnailUrl={submittedSong?.thumbnailUrl}
                  youtubeUrl={submittedSong?.youtubeUrl || youtubeUrl}
                  votes={0}
                  isHeard={false}
                  hasVoted={false}
                />
                {submittedSong && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/30 p-3 backdrop-blur-md">
                    <div className="text-xs text-neutral-600">
                      제출 후 곡 목록에서 카드 형태로 표시됩니다.
                    </div>
                    <a
                      href={submittedSong.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/30 bg-white/40 text-neutral-700 transition hover:bg-white/60"
                      aria-label="유튜브 링크 열기"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-[28px] bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 text-center text-sm leading-6 text-white/70" style={{ aspectRatio: "8 / 5" }}>
                <div className="flex h-full items-center justify-center">
                  유튜브 링크를 입력하면
                  <br />
                  썸네일 기반 카드 느낌을 미리 볼 수 있습니다.
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
