"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getCertificates } from "../../lib/certificates";
import { getExams } from "../../lib/exams";
import { getLevelTitle, getProfile, type Profile } from "../../lib/profiles";
import { supabase } from "../../lib/supabase";
import type { Certificate } from "../../types/certificate";
import type { Exam } from "../../types/exam";

const recommendations = [
  {
    title: "SQLD",
    category: "데이터 분석 입문",
    reason: "컴활·사무 자동화 계열과 함께 준비하기 좋아요.",
    difficulty: "초급",
    badge: "추천",
  },
  {
    title: "ADsP",
    category: "데이터 분석",
    reason: "데이터 직무나 기획 직무로 확장하기 좋아요.",
    difficulty: "중급",
    badge: "성장",
  },
  {
    title: "정보처리기사",
    category: "IT 기본 자격",
    reason: "IT·개발·기획 직무에서 활용도가 높아요.",
    difficulty: "중급",
    badge: "핵심",
  },
  {
    title: "GTQ 포토샵",
    category: "디자인 실무",
    reason: "마케팅·콘텐츠·디자인 업무에 도움이 돼요.",
    difficulty: "초급",
    badge: "실무",
  },
];

export default function AiPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    const loadAiPage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getProfile(currentUser.id, currentUser.email);
        setProfile(profileData);

        const certificateData = await getCertificates(currentUser.id);
        setCertificates(certificateData);

        const examData = await getExams(currentUser.id);
        setExams(examData);
      }
    };

    loadAiPage();
  }, []);

  const displayName =
    profile?.nickname || user?.email?.split("@")[0] || "커리어스 유저";

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">AI 추천</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            맞춤 자격증 추천
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {displayName}님의 커리어 활동을 바탕으로 추천해요.
          </p>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">현재 성장 상태</p>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                Lv.{profile?.level || 1} {getLevelTitle(profile?.level || 1)}
              </h2>
            </div>

            <div className="rounded-2xl bg-violet-50 px-4 py-2 text-sm font-bold text-violet-600">
              {profile?.xp || 0} XP
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">
                {certificates.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">
                보유 인증서
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">
                {exams.length}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">
                준비 시험
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3 text-center">
              <p className="text-lg font-extrabold text-gray-900">
                {profile?.point || 0}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-gray-400">
                포인트
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-violet-600 p-5 text-white shadow-sm">
          <p className="text-sm font-bold opacity-80">추천 방향</p>
          <h2 className="mt-2 text-xl font-extrabold">
            실무 활용도가 높은 자격증부터 시작해보세요
          </h2>
          <p className="mt-2 text-sm opacity-80">
            현재 단계에서는 기초 실무형 자격증과 데이터·IT 계열 자격증이 잘
            맞아요.
          </p>
        </section>

        <section className="space-y-3">
          {recommendations.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                  {item.badge}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {item.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-gray-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-gray-500">
                {item.category}
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {item.reason}
              </p>

              <button className="mt-4 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white">
                목표로 추가하기
              </button>
            </div>
          ))}
        </section>
      </section>

      <BottomTabBar activeTab="home" />
    </main>
  );
}
