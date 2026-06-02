"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Exam } from "../../types/exam";
import { supabase } from "../../lib/supabase";
import { createExam, getExams } from "../../lib/exams";

export default function SchedulePage() {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examForm, setExamForm] = useState({
    name: "",
    applyStart: "",
    applyEnd: "",
    examDate: "",
    resultDate: "",
    memo: "",
  });

  const loadExams = async (userId: string) => {
    try {
      const data = await getExams(userId);
      setExams(data);
    } catch (error) {
      console.error("일정 불러오기 실패:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadExams(currentUser.id);
      }
    };

    init();
  }, []);

  const handleSaveExam = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!examForm.name) {
      alert("시험명을 입력해주세요.");
      return;
    }

    try {
      await createExam({
        userId: user.id,
        name: examForm.name,
        applyStart: examForm.applyStart,
        applyEnd: examForm.applyEnd,
        examDate: examForm.examDate,
        resultDate: examForm.resultDate,
        memo: examForm.memo,
      });

      alert("일정이 저장되었습니다.");

      setExamForm({
        name: "",
        applyStart: "",
        applyEnd: "",
        examDate: "",
        resultDate: "",
        memo: "",
      });

      await loadExams(user.id);
    } catch (error) {
      console.error(error);
      alert("일정 저장 실패");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 text-gray-900">
      <section className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-2xl font-bold">시험 일정 관리</h1>
          </div>

          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
          >
            홈으로
          </Link>
        </header>

        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <input
            value={examForm.name}
            onChange={(e) =>
              setExamForm({ ...examForm, name: e.target.value })
            }
            placeholder="시험명 예: SQLD"
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
          />

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">
              시험 신청 시작일
            </label>
            <input
              type="date"
              value={examForm.applyStart}
              onChange={(e) =>
                setExamForm({ ...examForm, applyStart: e.target.value })
              }
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">
              시험 신청 종료일
            </label>
            <input
              type="date"
              value={examForm.applyEnd}
              onChange={(e) =>
                setExamForm({ ...examForm, applyEnd: e.target.value })
              }
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">
              시험일
            </label>
            <input
              type="date"
              value={examForm.examDate}
              onChange={(e) =>
                setExamForm({ ...examForm, examDate: e.target.value })
              }
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-600">
              발표일
            </label>
            <input
              type="date"
              value={examForm.resultDate}
              onChange={(e) =>
                setExamForm({ ...examForm, resultDate: e.target.value })
              }
              className="w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <textarea
            value={examForm.memo}
            onChange={(e) =>
              setExamForm({ ...examForm, memo: e.target.value })
            }
            placeholder="메모"
            className="w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
          />

          <button
            onClick={handleSaveExam}
            className="w-full rounded-3xl bg-gray-900 py-4 text-base font-bold text-white"
          >
            일정 저장하기
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-bold">관심 시험</h2>

          {exams.length === 0 && (
            <div className="rounded-3xl bg-white p-5 text-center text-sm text-gray-500 shadow-sm">
              아직 등록된 시험 일정이 없습니다.
            </div>
          )}

          {exams.map((exam) => (
            <div key={exam.id} className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="font-bold">{exam.name}</p>
              <p className="mt-2 text-sm text-gray-500">
                접수: {exam.applyStart || "-"} ~ {exam.applyEnd || "-"}
              </p>
              <p className="text-sm text-gray-500">
                시험일: {exam.examDate || "-"}
              </p>
              <p className="text-sm text-gray-500">
                발표일: {exam.resultDate || "-"}
              </p>
              {exam.memo && (
                <p className="mt-2 text-sm text-gray-600">{exam.memo}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}