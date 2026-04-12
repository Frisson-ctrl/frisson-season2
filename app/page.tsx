"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    const storedNickname = sessionStorage.getItem("nickname");
    if (storedNickname) {
      // Redirect directly to songs page if already logged in
      router.push("/songs");
    }
  }, [router]);

  function saveNickname() {
    if (!nickname.trim()) {
      alert("ADA 닉네임을 입력해주세요.");
      return;
    }

    const trimmedNickname = nickname.trim();
    sessionStorage.setItem("nickname", trimmedNickname);
    // Redirect to songs page after login
    router.push("/songs");
  }

  // Only show login form
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e8f0eb,_#f7f8f6_45%,_#ede9e8)] px-4 py-6 sm:px-5">
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
