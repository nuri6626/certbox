"use client";

import { getGoals, type Goal } from "../../lib/goals";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getProfile, spendPoint, type Profile } from "../../lib/profiles";
import { getRaffleEvents, type RaffleEvent } from "../../lib/raffle";
import { supabase } from "../../lib/supabase";

const learningAds = [
  {
    title: "SQLD 단기 합격반",
    brand: "추천 교육",
    desc: "데이터 직무를 준비한다면 SQLD부터 시작해보세요.",
    emoji: "📊",
  },
  {
    title: "정보처리기사 실기 특강",
    brand: "추천 교육",
    desc: "IT 직무 진입을 위한 대표 자격증 과정이에요.",
    emoji: "💻",
  },
  {
    title: "자소서 작성 가이드",
    brand: "커리어 준비",
    desc: "자격증을 자기소개서에 어떻게 녹일지 알려드려요.",
    emoji: "📝",
  },
];

export default function BenefitsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [raffleEvents, setRaffleEvents] = useState<RaffleEvent[]>([]);
  const [toastMessage, setToastMessage] = useState("");
  const [isEnteringId, setIsEnteringId] = useState<string | null>(null);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) =>
        prev === learningAds.length - 1 ? 0 : prev + 1,
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadPage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) return;

      const profileData = await getProfile(currentUser.id, currentUser.email);
      setProfile(profileData);

      const eventData = await getRaffleEvents();
      setRaffleEvents(eventData);
      const goalData = await getGoals(currentUser.id);
      setGoals(goalData);
    };

    loadPage();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 2200);
  };

  const reloadRaffles = async () => {
    const eventData = await getRaffleEvents();
    setRaffleEvents(eventData);
  };

  const handleEnterRaffle = async (event: RaffleEvent) => {
    if (!user || !profile) {
      showToast("로그인이 필요합니다.");
      return;
    }

    const currentPoint = profile.point || 0;

    if (currentPoint < event.entry_point) {
      showToast("응모 포인트가 부족합니다.");
      return;
    }

    const confirmed = confirm(
      `${event.title}에 ${event.entry_point}P를 사용해 응모할까요?`,
    );

    if (!confirmed) return;

    try {
      setIsEnteringId(event.id);

      const updatedProfile = await spendPoint(
        user.id,
        currentPoint,
        event.entry_point,
      );

      setProfile(updatedProfile);

      const { error: entryError } = await supabase
        .from("raffle_entries")
        .insert({
          event_id: event.id,
          user_id: user.id,
          used_point: event.entry_point,
        });

      if (entryError) throw entryError;

      const { error: eventError } = await supabase
        .from("raffle_events")
        .update({
          participant_count: event.participant_count + 1,
        })
        .eq("id", event.id);

      if (eventError) throw eventError;

      await reloadRaffles();

      showToast(`🎉 ${event.title} 응모 완료!`);
    } catch (error) {
      console.error(error);
      showToast("응모 처리 중 오류가 발생했습니다.");
    } finally {
      setIsEnteringId(null);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#F6F7F9] pb-32">
      {toastMessage && (
        <div className="fixed left-1/2 top-5 z-[200] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-4 text-center text-sm font-bold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">혜택</h1>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-violet-600 shadow-sm">
            {profile?.point ?? 0}P
          </div>
        </header>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              🎁
            </div>

            <div>
              <p className="text-sm font-bold text-violet-500">커리어 드로우</p>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                포인트로 응모하고 혜택을 받아보세요
              </h2>
            </div>
          </div>

          <p className="text-sm leading-6 text-gray-600">
            포인트는 바로 교환되지 않고, 이번 달 드로우 응모에 사용돼요. 목표
            인증으로 얻은 포인트일수록 더 가치 있게 활용할 수 있어요.
          </p>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">보유 포인트</p>
              <h2 className="mt-1 text-3xl font-extrabold text-gray-900">
                {profile?.point ?? 0}P
              </h2>
            </div>

            <div className="rounded-2xl bg-violet-50 px-4 py-3 text-center">
              <p className="text-xs font-bold text-violet-500">사용처</p>
              <p className="mt-1 text-sm font-extrabold text-violet-700">
                드로우 응모
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-bold text-gray-400">포인트 획득 기준</p>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              자격증 단순 등록보다 목표를 세우고 실제로 달성·인증했을 때 더 많은
              포인트를 받을 수 있어요.
            </p>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-violet-500">목표 인증</p>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                진행중인 목표
              </h2>
            </div>

            <button
              onClick={() => (window.location.href = "/goals")}
              className="rounded-full bg-gray-900 px-3 py-2 text-xs font-bold text-white"
            >
              전체 보기
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-sm font-semibold text-gray-500 shadow-sm">
              아직 진행중인 목표가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-violet-500">
                        인증 대기 목표
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-gray-900">
                        🎯 {goal.title}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                      +{goal.reward_xp}XP · +{goal.reward_point}P
                    </span>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400">
                      목표일: {goal.target_date || "미정"}
                    </p>

                    <p className="text-xs font-bold text-violet-500">
                      진행률 {goal.progress}%
                    </p>
                  </div>

                  <button
                    onClick={() => (window.location.href = "/goals")}
                    className="mt-4 w-full rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white"
                  >
                    자격증 등록 후 인증하기
                  </button>
                </div>
              ))}

              {goals.length > 3 && (
                <button
                  onClick={() => (window.location.href = "/goals")}
                  className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-gray-700 shadow-sm"
                >
                  목표 {goals.length - 3}개 더 보기
                </button>
              )}
            </div>
          )}
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-violet-500">
                이번 달 이벤트
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900">
                커리어 드로우
              </h2>
            </div>

            <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">
              {raffleEvents.length}개 진행중
            </span>
          </div>

          {raffleEvents.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-center text-sm font-semibold text-gray-500 shadow-sm">
              진행 중인 드로우가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {raffleEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-50 to-violet-100 text-2xl">
                        {event.image_emoji}
                      </div>

                      <div>
                        <p className="text-lg font-extrabold text-gray-900">
                          {event.title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                      {event.entry_point}P
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-gray-50 p-4 text-center">
                      <p className="text-xs font-bold text-gray-400">
                        현재 참여
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-gray-900">
                        {event.participant_count}명
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 p-4 text-center">
                      <p className="text-xs font-bold text-gray-400">
                        당첨 인원
                      </p>
                      <p className="mt-1 text-lg font-extrabold text-gray-900">
                        {event.winner_count}명
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnterRaffle(event)}
                    disabled={
                      isEnteringId === event.id ||
                      (profile?.point || 0) < event.entry_point
                    }
                    className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold ${
                      (profile?.point || 0) >= event.entry_point
                        ? "bg-gray-900 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {isEnteringId === event.id
                      ? "응모 중..."
                      : (profile?.point || 0) >= event.entry_point
                        ? "응모하기"
                        : "포인트 부족"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">추천 교육 광고</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                자격증 준비에 도움되는 콘텐츠
              </h2>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              AD
            </span>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                {learningAds[currentAdIndex].emoji}
              </div>

              <div>
                <p className="text-xs font-bold text-violet-500">
                  {learningAds[currentAdIndex].brand}
                </p>
                <h3 className="mt-1 text-base font-extrabold text-gray-900">
                  {learningAds[currentAdIndex].title}
                </h3>
                <p className="mt-1 text-sm leading-5 text-gray-600">
                  {learningAds[currentAdIndex].desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {learningAds.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setCurrentAdIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  currentAdIndex === index
                    ? "w-5 bg-gray-900"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </section>
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}
