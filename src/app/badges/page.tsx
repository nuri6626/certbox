"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getCertificates } from "../../lib/certificates";
import { getCompletedGoals, getGoals, type Goal } from "../../lib/goals";
import { getBadges } from "../../lib/badges";
import { supabase } from "../../lib/supabase";
import type { Certificate } from "../../types/certificate";

export default function BadgesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

  useEffect(() => {
    const loadBadges = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) return;

      const certificateData = await getCertificates(currentUser.id);
      const activeGoalData = await getGoals(currentUser.id);
      const completedGoalData = await getCompletedGoals(currentUser.id);

      setCertificates(certificateData);
      setActiveGoals(activeGoalData);
      setCompletedGoals(completedGoalData);
    };

    loadBadges();
  }, []);

  const badges = useMemo(() => {
    return getBadges({
      certificates,
      activeGoals,
      completedGoals,
    });
  }, [certificates, activeGoals, completedGoals]);

  const unlockedBadges = badges.filter((badge) => badge.isUnlocked);
  const lockedBadges = badges.filter((badge) => !badge.isUnlocked);

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">커리어 뱃지</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            나의 성장 뱃지
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            자격증 등록, 목표 달성, 커리어 활동을 통해 뱃지를 모아보세요.
          </p>
        </header>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              🏆
            </div>

            <div>
              <p className="text-sm font-bold text-violet-500">획득 현황</p>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                {unlockedBadges.length} / {badges.length}개
              </h2>
            </div>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
              style={{
                width: `${Math.round(
                  (unlockedBadges.length / badges.length) * 100,
                )}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            목표를 달성하고 자격증을 인증할수록 더 많은 뱃지가 열려요.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-extrabold text-gray-900">
            획득한 뱃지
          </h2>

          {unlockedBadges.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-center text-sm font-semibold text-gray-500 shadow-sm">
              아직 획득한 뱃지가 없어요.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {unlockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="rounded-3xl bg-white p-4 text-center shadow-sm"
                >
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-50 to-violet-100 text-3xl">
                    {badge.emoji}
                  </div>

                  <p className="mt-3 text-xs font-extrabold text-gray-900">
                    {badge.title}
                  </p>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-400">
                    {badge.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-extrabold text-gray-900">
            잠긴 뱃지
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="rounded-3xl bg-white/70 p-4 text-center shadow-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-3xl grayscale">
                  {badge.emoji}
                </div>

                <p className="mt-3 text-xs font-extrabold text-gray-400">
                  {badge.title}
                </p>

                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-400">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <BottomTabBar activeTab="home" />
    </main>
  );
}
