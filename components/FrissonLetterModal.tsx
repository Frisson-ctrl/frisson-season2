"use client";

import { X } from "lucide-react";

type FrissonLetterModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FrissonLetterModal({
  isOpen,
  onClose,
}: FrissonLetterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
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
            '프리송' 곡 1개를 등록하고, 들어보며 나만의 플리를 찾는 디깅 사이트예요!
          </p>

          <p>
            처음 만들어본 웹이라 여러분의 충고와 피드백이 너무 소중합니다..! 전공자, 비전공자 상관없이
            많은 피드백 주시면, 시즌2! 만들 때 참고할게요! 추가적인 아이디어? 너무 좋습니다!!
          </p>
        </div>
      </div>
    </div>
  );
}
