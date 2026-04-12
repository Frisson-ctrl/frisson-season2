"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ExternalLink, Music4, Send } from "lucide-react";
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
  nickname: string;
  youtubeUrl: string;
  comment: string;
  thumbnailUrl: string;
  title: string;
};

export default function SubmitPage() {
  const [nickname, setNickname] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [comment, setComment] = useState("");
  const [submittedSong, setSubmittedSong] = useState<SubmittedSong | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedNickname = sessionStorage.getItem("nickname");

    if (!savedNickname) {
      alert("먼저 홈에서 닉네임을 입력해주세요.");
      window.location.href = "/";
      return;
    }

    setNickname(savedNickname);
  }, []);

  async function handleSubmit() {
    if (!nickname.trim() || !youtubeUrl.trim() || !comment.trim()) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    const thumbnailUrl = getYouTubeThumbnail(youtubeUrl);
    const title = await getYouTubeTitle(youtubeUrl);

    try {
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
    } catch (error) {
      console.error(error);
      alert("알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isSubmissionOpen) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ede9fe,_#f8fafc_35%,_#e2e8f0)] px-5 py-10">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ede9fe,_#f8fafc_35%,_#e2e8f0)] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[32px] border border-white/50 bg-white/65 p-7 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="space-y-6">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-neutral-200 bg-white/80 hover:bg-white"
                >
                  <ArrowLeft size={18} />
                </Link>

                <div>
                  <h1 className="m-0 text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                    곡 제출하기
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-neutral-600 md:text-base">
                    @{nickname} 님의 frisson 곡을 등록하세요.
                    <br />
                    한 사람당 한 곡만 제출할 수 있습니다!
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
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="이 곡이 왜 frisson인지 짧게 남겨주세요."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-neutral-200 bg-white/80 px-4 py-4 text-[15px] text-neutral-900 outline-none transition focus:border-neutral-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-medium transition ${isSubmitting
                    ? "cursor-not-allowed bg-neutral-300 text-white"
                    : "bg-neutral-900 text-white hover:scale-[1.01] hover:bg-neutral-800 active:scale-[0.99]"
                  }`}
              >
                <Send size={16} />
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/50 bg-white/65 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl md:p-7">
            <div className="mb-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-xs text-neutral-600">
                <Music4 size={14} />
                Preview
              </div>

              <h2 className="m-0 text-xl font-semibold text-neutral-900">
                제출 미리보기
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                등록이 완료되면 이런 느낌으로 보여집니다.
              </p>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/50 bg-neutral-900 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]">
              {submittedSong?.thumbnailUrl || youtubeUrl ? (
                <div className="relative min-h-[220px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{
                      backgroundImage: `url(${submittedSong?.thumbnailUrl || getYouTubeThumbnail(youtubeUrl)
                        })`,
                    }}
                  />
                  <div className="absolute inset-0 bg-black/45" />
                  <div className="absolute inset-0 backdrop-blur-md" />

                  <div className="relative z-10 flex min-h-[220px] flex-col justify-between p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-white/16 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">
                        @{submittedSong?.nickname || nickname || "nickname"}
                      </span>

                      {submittedSong && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-[11px] font-medium text-emerald-100 backdrop-blur-sm">
                          <Check size={12} />
                          등록 완료
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="line-clamp-2 text-2xl font-semibold leading-tight">
                        {submittedSong?.title ||
                          (youtubeUrl ? "유튜브 제목을 불러오면 여기에 표시됩니다." : "곡 제목 미리보기")}
                      </h3>

                      <p className="line-clamp-3 text-sm leading-6 text-white/85">
                        {submittedSong?.comment ||
                          comment ||
                          "이 곡이 왜 frisson인지 한 줄 코멘트를 남겨보세요."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[220px] items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-700 p-6 text-center text-sm leading-6 text-white/70">
                  유튜브 링크를 입력하면
                  <br />
                  썸네일 기반 카드 느낌을 미리 볼 수 있습니다.
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/70">
                  제출 후 곡 목록에서 카드 형태로 표시됩니다.
                </div>

                {submittedSong && (
                  <a
                    href={submittedSong.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="유튜브 링크 열기"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}