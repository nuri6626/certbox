"use client";
import {
  createRewardExchange,
  getMyRewardExchanges,
  type RewardExchange,
} from "../../lib/rewardExchanges";

import {
  getProfile,
  addXpAndPoint,
  spendPoint,
  type Profile,
} from "../../lib/profiles";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { supabase } from "../../lib/supabase";
import {
  createGoal,
  getGoals,
  getCompletedGoals,
  updateGoalProgress,
  completeGoal,
  type Goal,
} from "../../lib/goals";

const challenges = [
  {
    title: "SQLD 챌린지",
    desc: "시험일까지 공부 루틴을 완주해보세요",
    reward: "+10 XP · +50P",
    progress: 68,
  },
  {
    title: "토익 800 챌린지",
    desc: "목표 점수 달성 시 리워드 지급",
    reward: "+150 XP · +3,000P",
    progress: 42,
  },
];

const rankings = [
  "SQLD",
  "ADsP",
  "정보처리기사",
  "컴활 1급",
  "빅데이터분석기사",
];

const ads = [
  {
    title: "SQLD 단기 합격 과정",
    brand: "패스트캠퍼스",
    desc: "데이터 자격증 준비생에게 추천해요",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "토익 목표 점수 패키지",
    brand: "야나두",
    desc: "어학 성적 목표 달성에 도움돼요",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "암기 과목 루틴 학습",
    brand: "뇌새김",
    desc: "반복 학습이 필요한 시험에 추천해요",
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
  },
];

const getDdayText = (date: string | null) => {
  if (!date) return "목표일 미정";

  const today = new Date();
  const target = new Date(date);

  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "D-DAY";
  if (diffDays > 0) return `D-${diffDays}`;

  return "지난 목표";
};

export default function BenefitsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rewardExchanges, setRewardExchanges] = useState<RewardExchange[]>([]);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);

  const [goalTitle, setGoalTitle] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadGoals = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) return;

      const goalData = await getGoals(currentUser.id);
      setGoals(goalData);

      const completedGoalData = await getCompletedGoals(currentUser.id);
      setCompletedGoals(completedGoalData);
      const profileData = await getProfile(currentUser.id, currentUser.email);
      setProfile(profileData);

      const exchangeData = await getMyRewardExchanges(currentUser.id);
      setRewardExchanges(exchangeData);
    };

    loadGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!user) return;

    if (!goalTitle.trim()) {
      alert("목표명을 입력해주세요.");
      return;
    }

    try {
      const newGoal = await createGoal({
        userId: user.id,
        title: goalTitle,
        targetDate: goalDate,
      });

      setGoals((prev) => [newGoal, ...prev]);
      setGoalTitle("");
      setGoalDate("");
      setIsGoalFormOpen(false);

      alert("목표가 생성되었습니다.");
    } catch (error: any) {
      console.error("목표 생성 실패:", error);
      alert(`목표 생성 실패: ${error.message || JSON.stringify(error)}`);
    }
  };

  const handleIncreaseProgress = async (goal: Goal) => {
    const nextProgress = Math.min(goal.progress + 10, 100);

    try {
      const updatedGoal = await updateGoalProgress(goal.id, nextProgress);

      setGoals((prev) =>
        prev.map((item) => (item.id === goal.id ? updatedGoal : item)),
      );
    } catch (error) {
      console.error(error);
      alert("진행률 업데이트 실패");
    }
  };

  const handleCompleteGoal = async (goal: Goal) => {
    if (!user || !profile) return;

    try {
      await completeGoal(goal.id);

      const updatedProfile = await addXpAndPoint(
        user.id,
        profile.xp,
        profile.point,
        goal.reward_xp,
        goal.reward_point,
      );

      setProfile(updatedProfile);

      const goalData = await getGoals(user.id);
      setGoals(goalData);

      const completedGoalData = await getCompletedGoals(user.id);
      setCompletedGoals(completedGoalData);

      alert(`🎉 목표 달성!\n+${goal.reward_xp} XP\n+${goal.reward_point} P`);
    } catch (error) {
      console.error(error);
      alert("목표 완료 실패");
    }
  };

  const handleExchangeReward = async (
    rewardTitle: string,
    pointAmount: number,
  ) => {
    if (!user || !profile) {
      alert("로그인이 필요합니다.");
      return;
    }

    if ((profile.point || 0) < pointAmount) {
      alert("포인트가 부족합니다.");
      return;
    }

    const confirmed = confirm(
      `${rewardTitle}을(를) ${pointAmount}P로 교환할까요?`,
    );

    if (!confirmed) return;

    try {
      const updatedProfile = await spendPoint(
        user.id,
        profile.point,
        pointAmount,
      );
      setProfile(updatedProfile);

      await createRewardExchange({
        userId: user.id,
        rewardTitle,
        pointAmount,
      });

      const updatedExchanges = await getMyRewardExchanges(user.id);
      setRewardExchanges(updatedExchanges);

      alert("교환 신청이 완료되었습니다.");
    } catch (error) {
      console.error(error);
      alert("교환 처리 실패");
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">혜택</h1>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-500 shadow-sm">
            {profile?.point ?? 0}P
          </div>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">
            시험 응시료 혜택
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-900">
            목표 달성하면 응시료 리워드
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            합격 인증과 목표 달성 시 포인트를 지급해요.
          </p>

          <button className="mt-4 rounded-full bg-gray-900 px-5 py-3 text-sm font-bold text-white">
            리워드 보기
          </button>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">진행중인 목표</h2>

            <button
              onClick={() => setIsGoalFormOpen(!isGoalFormOpen)}
              className="rounded-full bg-gray-900 px-4 py-2 text-xs font-bold text-white"
            >
              + 목표 추가
            </button>
          </div>

          {isGoalFormOpen && (
            <div className="mb-3 rounded-3xl bg-white p-5 shadow-sm">
              <input
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="목표 자격증명 예: SQLD"
                className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              />

              <input
                type="date"
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              />

              <button
                onClick={handleCreateGoal}
                className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white"
              >
                목표 저장하기
              </button>
            </div>
          )}

          {goals.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm">
              아직 진행중인 목표가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-violet-500">
                        현재 목표
                      </p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        🎯 {goal.title}
                      </p>
                    </div>

                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                      +{goal.reward_xp}XP · +{goal.reward_point}P
                    </span>
                  </div>

                  <div className="mt-4 h-3 rounded-full bg-gray-100">
                    <div
                      className="h-3 rounded-full bg-violet-500"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-500">
                      {getDdayText(goal.target_date)}
                    </span>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                      진행률 {goal.progress}%
                    </span>
                  </div>

                  {goal.progress >= 100 ? (
                    <button
                      onClick={() => handleCompleteGoal(goal)}
                      className="mt-4 w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white"
                    >
                      🎉 목표 완료하기
                    </button>
                  ) : (
                    <button
                      onClick={() => handleIncreaseProgress(goal)}
                      className="mt-4 w-full rounded-2xl bg-gray-900 py-3 text-sm font-bold text-white"
                    >
                      +10% 진행하기
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            자격증 챌린지
          </h2>
          <div className="space-y-3">
            {challenges.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                  </div>

                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                    {item.reward}
                  </span>
                </div>

                <div className="mt-4 h-3 rounded-full bg-gray-100">
                  <div
                    className="h-3 rounded-full bg-violet-500"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  진행률 {item.progress}%
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            🏆 완료한 목표
          </h2>

          {completedGoals.length === 0 ? (
            <div className="rounded-3xl bg-white p-5 text-sm text-gray-500 shadow-sm">
              아직 완료한 목표가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-3xl border border-green-100 bg-green-50 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-green-600">
                        목표 달성 완료
                      </p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ✅ {goal.title}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-green-600">
                      +{goal.reward_xp}XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            요즘 인기 자격증
          </h2>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="space-y-4">
              {rankings.map((name, index) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold text-gray-900">
                      {index + 1}
                    </span>
                    <span className="font-bold text-gray-800">{name}</span>
                  </div>

                  {index < 2 && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
                      🔥급상승
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            추천 학습 혜택
          </h2>

          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                width: `${ads.length * 100}%`,
                transform: `translateX(-${currentAdIndex * (100 / ads.length)}%)`,
              }}
            >
              {ads.map((item) => (
                <article
                  key={item.title}
                  className="relative h-44 overflow-hidden"
                  style={{ width: `${100 / ads.length}%` }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/35" />

                  <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                    <p className="text-xs font-bold opacity-90">{item.brand}</p>
                    <p className="mt-1 text-lg font-extrabold">{item.title}</p>
                    <p className="mt-1 text-sm opacity-90">{item.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-3 flex justify-center gap-2">
            {ads.map((item, index) => (
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
        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                🎁 포인트 상점
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                보유 포인트로 혜택을 교환해요
              </p>
            </div>

            <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
              {profile?.point || 0}P
            </div>
          </div>

          <div className="space-y-2">
            {[
              { title: "아메리카노", point: 500, emoji: "☕" },
              { title: "배달 쿠폰", point: 30000, emoji: "🍔" },
              { title: "문화상품권", point: 10000, emoji: "🎁" },
            ].map((reward) => (
              <div
                key={reward.title}
                className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl">
                    {reward.emoji}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {reward.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {reward.point}P 필요
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    handleExchangeReward(reward.title, reward.point)
                  }
                  disabled={(profile?.point || 0) < reward.point}
                  className={`rounded-xl px-3 py-2 text-xs font-bold ${
                    (profile?.point || 0) >= reward.point
                      ? "bg-violet-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  교환
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                교환 내역
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                최근 신청한 혜택을 확인해요
              </p>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {rewardExchanges.length}건
            </span>
          </div>

          <div className="space-y-2">
            {rewardExchanges.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                아직 교환 내역이 없습니다.
              </div>
            ) : (
              rewardExchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {exchange.reward_title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(exchange.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-violet-600">
                      {exchange.status}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      -{exchange.point_amount}P
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}
