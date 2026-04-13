import { Suspense } from "react";
import SubmitClient from "./SubmitClient";

function SubmitLoadingFallback() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e8f0eb,_#f7f8f6_35%,_#ede9e8)] px-5 py-10 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block rounded-full bg-white/20 p-4 mb-4">
          <div className="animate-spin">
            <div className="h-8 w-8 border-3 border-neutral-400 border-t-neutral-900 rounded-full" />
          </div>
        </div>
        <p className="text-neutral-600">페이지를 불러오는 중...</p>
      </div>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<SubmitLoadingFallback />}>
      <SubmitClient />
    </Suspense>
  );
}