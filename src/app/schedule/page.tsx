"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import type { Exam } from "../../types/exam";
import { supabase } from "../../lib/supabase";
import { createExam, getExams } from "../../lib/exams";
import BottomTabBar from "../../components/home/BottomTabBar";

export default function SchedulePage() {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(
    null
  );

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

  const getDdayText = (date: string) => {
    if (!date) return "";

    const today = new Date();
    const target = new Date(date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "D-DAY";
    if (diffDays > 0) return `D-${diffDays}`;
    return "지난 일정";
  };

  const getApplyStatus = (applyStart: string, applyEnd: string) => {
    if (!applyStart || !applyEnd) return "";

    const today = new Date();
    const start = new Date(applyStart);
    const end = new Date(applyEnd);

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const daysUntilEnd = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (today < start) return `접수 예정 ${getDdayText(applyStart)}`;
    if (today >= start && today <= end && daysUntilEnd <= 3)
      return `마감 임박 D-${daysUntilEnd}`;
    if (today >= start && today <= end) return "접수중";

    return "접수 종료";
  };

  const getApplyStatusColor = (applyStart: string, applyEnd: string) => {
    if (!applyStart || !applyEnd) return "bg-gray-50 text-gray-500";

    const today = new Date();
    const start = new Date(applyStart);
    const end = new Date(applyEnd);

    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const daysUntilEnd = Math.ceil(
      (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (today < start) return "bg-gray-100 text-gray-600";
    if (today >= start && today <= end && daysUntilEnd <= 3)
      return "bg-orange-50 text-orange-700";
    if (today >= start && today <= end) return "bg-blue-50 text-blue-700";

    return "bg-gray-100 text-gray-500";
  };

  const getDdayColor = (date: string) => {
    if (!date) return "bg-gray-50 text-gray-500";

    const today = new Date();
    const target = new Date(date);

    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "bg-gray-100 text-gray-500";
    if (diffDays === 0) return "bg-red-600 text-white";
    if (diffDays <= 7) return "bg-red-50 text-red-700";
    if (diffDays <= 30) return "bg-orange-50 text-orange-700";

    return "bg-blue-50 text-blue-700";
  };

  const getCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startWeekDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: Array<number | null> = [];

    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return {
      year,
      month,
      days,
    };
  };

  const getEventsByDay = (day: number | null) => {
  if (!day) return [];

  const { year, month } = getCalendarDays();

  const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;

  return exams.flatMap((exam) => {
    const events = [];
    const shortName = exam.name.slice(0, 3);

    if (exam.applyStart === dateString) {
      events.push({
        label: `${shortName} 접`,
        title: exam.name,
        type: "접수시작",
        date: exam.applyStart,
        color: "bg-blue-500",
      });
    }

    if (exam.applyEnd === dateString) {
      events.push({
        label: `${shortName} 마`,
        title: exam.name,
        type: "접수마감",
        date: exam.applyEnd,
        color: "bg-orange-500",
      });
    }

    if (exam.examDate === dateString) {
      events.push({
        label: `${shortName} 시`,
        title: exam.name,
        type: "시험일",
        date: exam.examDate,
        color: "bg-red-500",
      });
    }

    if (exam.resultDate === dateString) {
      events.push({
        label: `${shortName} 발`,
        title: exam.name,
        type: "발표일",
        date: exam.resultDate,
        color: "bg-purple-500",
      });
    }

    return events;
  });
};

  const getSelectedDayEvents = () => {
    if (!selectedCalendarDay) return [];
    return getEventsByDay(selectedCalendarDay);
  };

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

  const calendar = getCalendarDays();

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

        <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              {calendar.year}년 {calendar.month + 1}월
            </h2>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-xs font-bold text-gray-400">
            <div>일</div>
            <div>월</div>
            <div>화</div>
            <div>수</div>
            <div>목</div>
            <div>금</div>
            <div>토</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendar.days.map((day, index) => {
              const events = getEventsByDay(day);

              return (
                <div
                  key={`${day}-${index}`}
                  onClick={() => {
                    if (day) {
                      setSelectedCalendarDay(day);
                    }
                  }}
                  className={`min-h-16 cursor-pointer rounded-2xl p-2 text-xs ${
                    selectedCalendarDay === day
                      ? "bg-gray-900 text-white"
                      : "bg-gray-50 text-gray-900"
                  }`}
                >
                  <p
                    className={`font-bold ${
                      selectedCalendarDay === day
                        ? "text-white"
                        : "text-gray-700"
                    }`}
                  >
                    {day || ""}
                  </p>

                  <div className="mt-1 space-y-1">
                    {events.slice(0, 2).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`rounded px-1 py-0.5 text-[9px] font-medium text-white ${event.color}`}
                        title={event.label}
                      >
                        {event.label}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-blue-500" />
              <span>접수시작</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-orange-500" />
              <span>접수마감</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span>시험일</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-full bg-purple-500" />
              <span>발표일</span>
            </div>
          </div>

          {selectedCalendarDay && (
            <div className="mt-4 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-bold text-gray-800">
                {selectedCalendarDay}일 일정
              </p>

              {getSelectedDayEvents().length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  등록된 일정이 없습니다.
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {getSelectedDayEvents().map((event, index) => (
  <div
    key={index}
    className="rounded-xl bg-white p-3 shadow-sm"
  >
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-full ${event.color}`} />
      <p className="text-sm font-bold text-gray-900">
        {event.title}
      </p>
    </div>

    <p className="mt-2 text-xs font-semibold text-gray-600">
      {event.type} · {event.date}
    </p>
  </div>
))}
                </div>
              )}
            </div>
          )}
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{exam.name}</p>

                  {getApplyStatus(exam.applyStart, exam.applyEnd) && (
                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${getApplyStatusColor(
                        exam.applyStart,
                        exam.applyEnd
                      )}`}
                    >
                      {getApplyStatus(exam.applyStart, exam.applyEnd)}
                    </span>
                  )}
                </div>

                {exam.examDate && (
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${getDdayColor(
                      exam.examDate
                    )}`}
                  >
                    {getDdayText(exam.examDate)}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500">
                  접수기간: {exam.applyStart || "-"} ~ {exam.applyEnd || "-"}
                </p>

                <p className="text-sm text-gray-500">
                  시험일: {exam.examDate || "-"}
                  {exam.examDate && (
                    <span className="ml-2 font-bold text-gray-800">
                      {getDdayText(exam.examDate)}
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-500">
                  발표일: {exam.resultDate || "-"}
                  {exam.resultDate && (
                    <span className="ml-2 font-bold text-gray-800">
                      {getDdayText(exam.resultDate)}
                    </span>
                  )}
                </p>

                {exam.memo && (
                  <p className="text-sm text-gray-600">메모: {exam.memo}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        
            </section>

      <BottomTabBar activeTab="calendar" />

      <div className="h-24" />
    </main>
  );
}