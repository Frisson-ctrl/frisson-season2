"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Music4, AtSign, Plus, ListMusic, CircleHelp, X } from "lucide-react";
import { isSubmissionOpen } from "@/config";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [savedNickname, setSavedNickname] = useState("");
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const storedNickname = sessionStorage.getItem("nickname");
    if (storedNickname) {
      setSavedNickname(storedNickname);
    }
  }, []);

  function saveNickname() {
    if (!nickname.trim()) {
      alert("ADA 닉네임을 입력해주세요.");
      return;
    }

    const trimmedNickname = nickname.trim();
    sessionStorage.setItem("nickname", trimmedNickname);
    setSavedNickname(trimmedNickname);
  }

  function logout() {
    sessionStorage.removeItem("nickname");
    setSavedNickname("");
    setNickname("");
    setIsGuideOpen(false);
  }

  if (!savedNickname) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f3ff,_#f8fafc_45%,_#eef2f7)] px-4 py-6 sm:px-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveNickname();
          }}
          className="w-full max-w-md rounded-[26px] border border-white/60 bg-white/78 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="m-0 text-[2rem] font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                Frisson
              </h1>
              <p className="m-0 mt-1 text-sm text-neutral-500">
                당신의 전율을 공유하는 플레이리스트
              </p>
            </div>

            <p className="m-0 text-sm leading-6 text-neutral-600">
              한 사람당 한 곡. 지금 떠오르는 가장 강한 한 곡을 남겨주세요.
            </p>

            <input
              placeholder="닉네임 입력(한글)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="h-12 rounded-2xl border border-neutral-200 bg-white/85 px-4 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />

            <button
              type="submit"
              className="h-12 rounded-2xl bg-neutral-900 text-[15px] font-medium text-white transition hover:bg-neutral-800 active:scale-[0.99]"
            >
              시작하기
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ede9fe,_#f8fafc_38%,_#eef2f7)] px-4 py-6 sm:px-5 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-4xl items-center justify-center sm:min-h-[calc(100vh-64px)]">
          <div className="w-full rounded-[28px] border border-white/60 bg-white/72 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[32px] sm:p-8 md:p-10">
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-neutral-400 sm:text-xs">
                    <Music4 size={15} />
                    <span>Frisson Season 1</span>
                  </div>

                  <h1 className="m-0 mt-3 text-5xl font-semibold tracking-tight text-neutral-900 sm:mt-4 sm:text-6xl">
                    Frisson
                  </h1>

                  <p className="m-0 mt-5 text-[15px] text-neutral-500 sm:text-base">
                    안녕하세요,{" "}
                    <span className="font-bold text-neutral-800">
                      @{savedNickname}
                    </span>
                  </p>

                  <p className="m-0 mt-3 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                    한 사람당 한 곡. 전율이 오는 노래를 남기고, 다른 사람들의 곡도 둘러보세요.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setIsGuideOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white sm:h-11 sm:w-11"
                    aria-label="프리송 설명"
                    title="프리송 설명"
                    type="button"
                  >
                    <CircleHelp size={18} />
                  </button>

                  <button
                    onClick={logout}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition hover:bg-white sm:h-11 sm:w-11"
                    aria-label="닉네임 변경"
                    title="닉네임 변경"
                    type="button"
                  >
                    <AtSign size={18} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {isSubmissionOpen && (
                  <Link
                    href="/submit"
                    className="group rounded-[24px] border border-neutral-200 bg-white/88 p-5 transition hover:-translate-y-1 hover:shadow-md sm:rounded-[28px]"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                      <Plus size={20} />
                    </div>
                    <h2 className="m-0 text-lg font-semibold text-neutral-900">
                      곡 제출하기
                    </h2>
                    <p className="mb-0 mt-2 text-sm leading-6 text-neutral-500">
                      이번 시즌에 당신의 곡을 남겨보세요.
                    </p>
                  </Link>
                )}

                <Link
                  href="/songs"
                  className="group rounded-[24px] border border-neutral-200 bg-white/88 p-5 transition hover:-translate-y-1 hover:shadow-md sm:rounded-[28px]"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
                    <ListMusic size={20} />
                  </div>
                  <h2 className="m-0 text-lg font-semibold text-neutral-900">
                    {isSubmissionOpen ? "곡 목록 보기" : "시즌1 랭킹 보기"}
                  </h2>
                  <p className="mb-0 mt-2 text-sm leading-6 text-neutral-500">
                    다른 사람들이 남긴 곡과 현재 시즌의 분위기를 확인하세요.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
            <button
              onClick={() => setIsGuideOpen(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700"
              aria-label="닫기"
              type="button"
            >
              <X size={16} />
            </button>

            <div className="pr-10">
              <p className="m-0 text-sm font-medium text-neutral-400">
                Frisson Letter
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
                프리송의 편지
              </h2>
            </div>

            <div className="space-y-4 text-sm leading-7 text-neutral-700">
              <p>
                안녕하세요! 저는 ADA 5기 오후반 프리송(Frisson)입니다!
              </p>

              <p>
                프리송(Frisson)은 프랑스어로 <strong>&apos;전율&apos;이나 &apos;소름&apos;</strong>을 뜻하며,
                음악, 영화, 예술 등 감정적으로 강한 자극을 받을 때 온몸에 소름이 돋거나 짜릿한 느낌을 받는
                생리적 현상을 말해요!
              </p>

              <p>
                이건 제 닉값하는 웹입니다! 저는 노래 추천받는 걸 좋아하는데, 180명의 러너들이 각자 자신의
                ‘프리송’ 곡 1개를 등록하고, 들어보며 나만의 플리를 찾는 디깅 사이트예요!
              </p>

              <p>
                처음 만들어본 웹이라 여러분의 충고와 피드백이 너무 소중합니다..! 전공자, 비전공자 상관없이
                많은 피드백 주시면, 시즌2! 만들 때 참고할게요! 추가적인 아이디어? 너무 좋습니다!!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}