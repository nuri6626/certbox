"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getCertificates } from "../../lib/certificates";
import { getBadges } from "../../lib/badges";
import { getCompletedGoals, getGoals, type Goal } from "../../lib/goals";
import { getMyRaffleEntries, type RaffleEntry } from "../../lib/raffle";
import { getLevelTitle, getProfile, type Profile } from "../../lib/profiles";
import { supabase } from "../../lib/supabase";
import type { Certificate } from "../../types/certificate";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [raffleEntries, setRaffleEntries] = useState<RaffleEntry[]>([]);

  useEffect(() => {
    const loadProfilePage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) return;

      const profileData = await getProfile(currentUser.id, currentUser.email);
      setProfile(profileData);

      const certificateData = await getCertificates(currentUser.id);
      setCertificates(certificateData);

      const activeGoalData = await getGoals(currentUser.id);
      setActiveGoals(activeGoalData);

      const completedGoalData = await getCompletedGoals(currentUser.id);
      setCompletedGoals(completedGoalData);

      const raffleEntryData = await getMyRaffleEntries(currentUser.id);
      setRaffleEntries(raffleEntryData);
    };

    loadProfilePage();
  }, []);

  const displayName =
    profile?.nickname || user?.email?.split("@")[0] || "커리어스 유저";

  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const point = profile?.point || 0;
  const currentLevelXp = xp % 100;

  const badges = useMemo(() => {
    return getBadges({
      certificates,
      activeGoals,
      completedGoals,
    });
  }, [certificates, activeGoals, completedGoals]);

  const unlockedBadges = badges.filter((badge) => badge.isUnlocked);
  const previewBadges = unlockedBadges.slice(0, 3);

  const totalRaffleUsedPoint = raffleEntries.reduce(
    (sum, entry) => sum + entry.used_point,
    0,
  );

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">프로필</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            나의 커리어 대시보드
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            자격증, 목표, 뱃지, 드로우 활동을 한눈에 확인해요.
          </p>
        </header>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-sm">
              🙂
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xl font-extrabold text-gray-900">
                {displayName}
              </p>
              <p className="mt-1 text-sm font-bold text-violet-500">
                Lv.{level} {getLevelTitle(level)}
              </p>
              <p className="mt-1 truncate text-xs text-gray-500">
                {user?.email || "로그인이 필요합니다"}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500">레벨 진행률</p>
              <p className="text-xs font-bold text-gray-900">
                {currentLevelXp}/100 XP
              </p>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                style={{ width: `${currentLevelXp}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-bold text-gray-400">XP</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">{xp}</p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-bold text-gray-400">포인트</p>
            <p className="mt-1 text-lg font-extrabold text-violet-600">
              {point}P
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-bold text-gray-400">뱃지</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">
              {unlockedBadges.length}
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">대표 뱃지</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                {unlockedBadges.length > 0
                  ? `${unlockedBadges.length}개의 뱃지를 획득했어요`
                  : "아직 획득한 뱃지가 없어요"}
              </h2>
            </div>

            <button
              onClick={() => (window.location.href = "/badges")}
              className="rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600"
            >
              전체 보기
            </button>
          </div>

          {previewBadges.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center">
              <div className="text-3xl">🔒</div>
              <p className="mt-2 text-sm font-bold text-gray-500">
                자격증을 등록하거나 목표를 달성하면 뱃지가 열려요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {previewBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-3xl bg-gradient-to-r from-cyan-50 to-violet-100 p-4 text-center"
                >
                  <div className="text-3xl">{badge.emoji}</div>
                  <p className="mt-2 line-clamp-2 text-xs font-extrabold text-gray-900">
                    {badge.title}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => (window.location.href = "/goals")}
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <div className="mb-3 text-2xl">🎯</div>
            <p className="text-xs font-bold text-gray-400">목표</p>
            <h2 className="mt-1 text-base font-extrabold text-gray-900">
              진행 {activeGoals.length}개
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              완료 {completedGoals.length}개
            </p>
          </button>

          <button
            onClick={() => (window.location.href = "/raffles")}
            className="rounded-3xl bg-white p-5 text-left shadow-sm"
          >
            <div className="mb-3 text-2xl">🎟️</div>
            <p className="text-xs font-bold text-gray-400">드로우</p>
            <h2 className="mt-1 text-base font-extrabold text-gray-900">
              {raffleEntries.length}회 응모
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              {totalRaffleUsedPoint}P 사용
            </p>
          </button>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">보유 자격증</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                {certificates.length}개 등록됨
              </h2>
            </div>

            <button
              onClick={() => (window.location.href = "/certificates")}
              className="rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600"
            >
              보기
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center text-sm font-semibold text-gray-500">
              아직 등록한 자격증이 없어요.
            </div>
          ) : (
            <div className="space-y-2">
              {certificates.slice(0, 3).map((certificate) => (
                <div
                  key={certificate.id}
                  className="rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <p className="text-sm font-bold text-gray-900">
                    {certificate.title}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {certificate.issuer || "발급기관 미입력"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-400">AI 커리어 분석</p>
          <h2 className="mt-1 text-lg font-extrabold text-gray-900">
            나에게 맞는 다음 자격증을 확인해보세요
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            보유 자격증을 기반으로 추천 자격증, 관련 직무, 연봉 범위, 채용공고
            검색까지 연결돼요.
          </p>

          <button
            onClick={() => (window.location.href = "/ai")}
            className="mt-4 w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
          >
            AI 추천 보러가기
          </button>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-400">계정</p>
          <h2 className="mt-1 text-lg font-extrabold text-gray-900">
            프로필 설정
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            닉네임, 이모지, 활동 정보를 관리할 수 있어요.
          </p>

          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 w-full rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
          >
            홈으로 이동
          </button>
        </section>
      </section>

      <BottomTabBar activeTab="mypage" />
    </main>
  );
}
