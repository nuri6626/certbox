"use client";

import { useState } from "react";
import { createPost } from "@/lib/community";

type CreatePostModalProps = {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreatePostModal({
  userId,
  onClose,
  onCreated,
}: CreatePostModalProps) {
  const [category, setCategory] = useState("합격후기");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [examName, setExamName] = useState("");
  const [studyPeriod, setStudyPeriod] = useState("");
  const [attemptCount, setAttemptCount] = useState("");
  const [studyMethod, setStudyMethod] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      await createPost({
        userId,
        category,
        title,
        content,
        examName,
        studyPeriod,
        attemptCount,
        studyMethod,
      });

      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      alert("글 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">글쓰기</h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            닫기
          </button>
        </div>

        <div className="space-y-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          >
            <option value="합격후기">합격후기</option>
            <option value="공부인증">공부인증</option>
            <option value="질문">질문</option>
            <option value="정보공유">정보공유</option>
          </select>

          <input
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="시험명 예: 컴활 1급, 토익, 정보처리기사"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />

          <input
            value={studyPeriod}
            onChange={(e) => setStudyPeriod(e.target.value)}
            placeholder="공부기간 예: 2주, 1개월, 3개월"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />

          <input
            value={attemptCount}
            onChange={(e) => setAttemptCount(e.target.value)}
            placeholder="응시횟수 예: 1"
            inputMode="numeric"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />

          <input
            value={studyMethod}
            onChange={(e) => setStudyMethod(e.target.value)}
            placeholder="학습방법 예: 인강, 독학, 학원, 문제집"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력해주세요."
            rows={6}
            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-purple-600 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "저장 중..." : "등록하기"}
        </button>
      </div>
    </div>
  );
}