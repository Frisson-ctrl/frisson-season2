import Link from "next/link";

export default function SubmitPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e8f0eb,_#f7f8f6_35%,_#ede9e8)] px-5 py-10 text-neutral-900">
      <section className="w-full max-w-md rounded-[26px] border border-white/60 bg-white/78 p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
        <h1 className="m-0 text-2xl font-semibold tracking-tight">
          시즌2는 마감되었습니다
        </h1>
        <p className="m-0 mt-4 text-sm leading-6 text-neutral-600">
          이 페이지는 더 이상 곡 제출이나 수정을 받지 않습니다. 완성된 플레이리스트 아카이브에서 시즌2의 곡들을 감상해주세요.
        </p>
        <Link
          href="/songs"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          아카이브 보기
        </Link>
      </section>
    </main>
  );
}
