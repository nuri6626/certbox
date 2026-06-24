"use client";


import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getCertificates } from "../../lib/certificates";
import {
  completeGoal,
  createGoal,
  getCompletedGoals,
  getGoals,
  type Goal,
} from "../../lib/goals";
import { supabase } from "../../lib/supabase";
import type { Certificate } from "../../types/certificate";

function GoalsPageContent() {
  const searchParams = useSearchParams();
  const recommendedTitle = searchParams.get("title");

  const [userId, setUserId] = useState<string | null>(null);
  const [goalTitle, setGoalTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [activeGoals, setActiveGoals] = useState<Goal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<Goal[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [verifyingGoalId, setVerifyingGoalId] = useState<string | null>(null);

  useEffect(() => {
    if (recommendedTitle) {
      setGoalTitle(recommendedTitle);
    }
  }, [recommendedTitle]);

  useEffect(() => {
    const loadGoals = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUserId = session?.user?.id ?? null;
      setUserId(currentUserId);

      if (!currentUserId) return;

      const goals = await getGoals(currentUserId);
      const completed = await getCompletedGoals(currentUserId);
      const certificateData = await getCertificates(currentUserId);

      setActiveGoals(goals);
      setCompletedGoals(completed);
      setCertificates(certificateData);
    };

    loadGoals();
  }, []);

  const reloadGoals = async () => {
    if (!userId) return;

    const goals = await getGoals(userId);
    const completed = await getCompletedGoals(userId);
    const certificateData = await getCertificates(userId);

    setActiveGoals(goals);
    setCompletedGoals(completed);
    setCertificates(certificateData);
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim()) {
      alert("목표 자격증명을 입력해주세요.");
      return;
    }

    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate) {
      const selectedDate = new Date(targetDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        alert("목표 날짜는 오늘 이후 날짜로 설정해주세요.");
        return;
      }
    }

    try {
      setIsSaving(true);

      await createGoal({
        userId,
        title: goalTitle,
        targetDate,
      });

      await reloadGoals();

      setGoalTitle("");
      setTargetDate("");
    } catch (error) {
      console.error(error);
      alert("목표 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };
  

  const normalizeText = (value: string) => {
    return value.replace(/\s/g, "").toLowerCase();
  };

  const findMatchedCertificate = (goalTitle: string) => {
    const normalizedGoalTitle = normalizeText(goalTitle);

    return certificates.find((certificate) => {
      const normalizedCertificateTitle = normalizeText(certificate.title);

      return (
        normalizedCertificateTitle.includes(normalizedGoalTitle) ||
        normalizedGoalTitle.includes(normalizedCertificateTitle)
      );
    });
  };

  const addGoalRewardToProfile = async (goal: Goal) => {
    if (!userId) return;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("xp, point")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("profile select error:", profileError);
      throw profileError;
    }

    const currentXp = profileData?.xp ?? 0;
    const currentPoint = profileData?.point ?? 0;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        xp: currentXp + goal.reward_xp,
        point: currentPoint + goal.reward_point,
      })
      .eq("id", userId);

    if (updateError) {
      console.error("profile reward update error:", updateError);
      throw updateError;
    }
  };

  const handleVerifyGoal = async (goal: Goal) => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    const matchedCertificate = findMatchedCertificate(goal.title);

    if (!matchedCertificate) {
      alert(
        "등록된 자격증 중 이 목표와 일치하는 자격증을 찾지 못했어요.\n자격증을 먼저 등록한 뒤 다시 인증해주세요.",
      );
      return;
    }

    if (!matchedCertificate.issueDate) {
      alert("자격증 발급일이 없어 인증할 수 없어요.");
      return;
    }

    const goalCreatedDate = new Date(goal.created_at);
    const certificateIssueDate = new Date(matchedCertificate.issueDate);

    goalCreatedDate.setHours(0, 0, 0, 0);
    certificateIssueDate.setHours(0, 0, 0, 0);

    if (certificateIssueDate < goalCreatedDate) {
      alert(
        "목표를 설정하기 전에 취득한 자격증은 인증에 사용할 수 없어요.\n목표 생성 이후 취득한 자격증만 보상 지급 대상입니다.",
      );
      return;
    }

    try {
      setVerifyingGoalId(goal.id);

      await completeGoal(goal.id, matchedCertificate.id);
      await addGoalRewardToProfile(goal);
      await reloadGoals();

      alert(
        `${matchedCertificate.title} 자격증으로 목표 인증이 완료되었어요!\n${goal.reward_xp}XP와 ${goal.reward_point}P가 지급되었습니다.`,
      );
    } catch (error) {
      console.error(error);
      alert("목표 인증 중 오류가 발생했습니다.");
    } finally {
      setVerifyingGoalId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">목표 관리</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            자격증 목표 추가
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            준비하고 싶은 자격증을 목표로 등록하고, 취득 후 인증하면 보상을 받을
            수 있어요.
          </p>
        </header>

        {recommendedTitle && (
          <section className="mb-5 rounded-[32px] border border-white bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                ✦
              </div>

              <div>
                <p className="text-sm font-bold text-violet-500">
                  AI 추천 목표
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                  {recommendedTitle}
                </h2>
              </div>
            </div>

            <p className="text-sm leading-6 text-gray-600">
              AI 추천 페이지에서 선택한 자격증이 자동으로 입력되었어요.
            </p>
          </section>
        )}

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700">
                목표 자격증명
              </label>
              <input
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="예: SQLD"
                className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-violet-400"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                목표 날짜
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:border-violet-400"
              />
            </div>

            <button
              onClick={handleSaveGoal}
              disabled={isSaving}
              className="w-full rounded-2xl bg-gray-900 px-4 py-4 text-sm font-bold text-white disabled:opacity-50"
            >
              {isSaving ? "저장 중..." : "목표 저장하기"}
            </button>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">진행 중</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                내 목표
              </h2>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
              {activeGoals.length}개
            </span>
          </div>

          {activeGoals.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center">
              <p className="text-sm font-semibold text-gray-500">
                아직 진행 중인 목표가 없어요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <div key={goal.id} className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 className="text-base font-extrabold text-gray-900">
                      {goal.title}
                    </h3>

                    <span className="shrink-0 rounded-full bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600">
                      진행중
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-400">
                    목표일: {goal.target_date || "미정"}
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-violet-500">
                      진행률 {goal.progress}%
                    </p>
                    <p className="text-xs font-bold text-gray-400">
                      보상 {goal.reward_xp}XP · {goal.reward_point}P
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-xs font-bold text-gray-400">인증 조건</p>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      목표 생성 이후 취득한 동일 자격증을 등록하면 목표를 인증할
                      수 있어요.
                    </p>
                  </div>

                  <button
                    onClick={() => handleVerifyGoal(goal)}
                    disabled={verifyingGoalId === goal.id}
                    className="mt-3 w-full rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {verifyingGoalId === goal.id
                      ? "인증 중..."
                      : "등록한 자격증으로 인증하기"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">완료</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                완료한 목표
              </h2>
            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {completedGoals.length}개
            </span>
          </div>

          {completedGoals.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center">
              <p className="text-sm font-semibold text-gray-500">
                아직 완료한 목표가 없어요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedGoals.map((goal) => (
                <div key={goal.id} className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-extrabold text-gray-900">
                      {goal.title}
                    </h3>

                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-1 text-[10px] font-bold text-green-600">
                      완료
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-bold text-gray-400">
                    지급 보상 {goal.reward_xp}XP · {goal.reward_point}P
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <BottomTabBar activeTab="home" />
    </main>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={null}>
      <GoalsPageContent />
    </Suspense>
  );
}
