"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../../components/home/BottomTabBar";
import { getProfile, spendPoint, type Profile } from "../../../lib/profiles";
import {
  createRaffleEntry,
  getMyRaffleEntriesByEventId,
  getRaffleEventById,
  increaseRaffleParticipantCount,
  type RaffleEntry,
  type RaffleEvent,
} from "../../../lib/raffle";
import { supabase } from "../../../lib/supabase";

export default function RaffleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [event, setEvent] = useState<RaffleEvent | null>(null);
  const [myEntries, setMyEntries] = useState<RaffleEntry[]>([]);
  const [isEntering, setIsEntering] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const loadPage = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      const eventData = await getRaffleEventById(params.id);
      setEvent(eventData);

      if (!currentUser) return;

      const profileData = await getProfile(currentUser.id, currentUser.email);
      setProfile(profileData);

      const entryData = await getMyRaffleEntriesByEventId({
        userId: currentUser.id,
        eventId: params.id,
      });
      setMyEntries(entryData);
    };

    loadPage();
  }, [params.id]);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 2200);
  };

  const reloadEntries = async () => {
    if (!user || !event) return;

    const entryData = await getMyRaffleEntriesByEventId({
      userId: user.id,
      eventId: event.id,
    });

    setMyEntries(entryData);

    const refreshedEvent = await getRaffleEventById(event.id);
    setEvent(refreshedEvent);
  };

  const handleEnterRaffle = async () => {
    if (!user || !profile || !event) {
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
      setIsEntering(true);

      const updatedProfile = await spendPoint(
        user.id,
        currentPoint,
        event.entry_point,
      );

      setProfile(updatedProfile);

      await createRaffleEntry({
        eventId: event.id,
        userId: user.id,
        usedPoint: event.entry_point,
      });

      await increaseRaffleParticipantCount({
        eventId: event.id,
        nextParticipantCount: event.participant_count + 1,
      });

      await reloadEntries();

      showToast("🎉 응모가 완료되었습니다!");
    } catch (error) {
      console.error(error);
      showToast("응모 처리 중 오류가 발생했습니다.");
    } finally {
      setIsEntering(false);
    }
  };

  const totalUsedPoint = myEntries.reduce(
    (sum, entry) => sum + entry.used_point,
    0,
  );

  const myEntryCount = myEntries.length;

  const estimatedChance =
    event && event.participant_count > 0
      ? Math.min(Math.round((myEntryCount / event.participant_count) * 100), 99)
      : 0;

  const chanceLabel =
    estimatedChance >= 50
      ? "높음"
      : estimatedChance >= 20
        ? "보통"
        : myEntryCount > 0
          ? "낮음"
          : "응모 전";

  if (!event) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] pb-32">
        <section className="mx-auto max-w-md px-5 pt-10">
          <p className="text-center text-sm font-bold text-gray-400">
            드로우 정보를 불러오는 중입니다.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#F6F7F9] pb-32">
      {toastMessage && (
        <div className="fixed left-1/2 top-5 z-[200] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-4 text-center text-sm font-bold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

      <section className="mx-auto max-w-md px-5 pt-6">
        <button
          onClick={() => (window.location.href = "/benefits")}
          className="mb-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm"
        >
          ← 혜택으로 돌아가기
        </button>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-4xl shadow-sm">
              {event.image_emoji}
            </div>

            <div>
              <p className="text-sm font-bold text-violet-500">커리어 드로우</p>
              <h1 className="mt-1 text-2xl font-extrabold text-gray-900">
                {event.title}
              </h1>
            </div>
          </div>

          <p className="text-sm leading-6 text-gray-600">{event.description}</p>
        </section>

        <section className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-bold text-gray-400">응모 포인트</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">
              {event.entry_point}P
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-bold text-gray-400">참여자</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">
              {event.participant_count}명
            </p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-bold text-gray-400">당첨</p>
            <p className="mt-1 text-lg font-extrabold text-gray-900">
              {event.winner_count}명
            </p>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">내 응모</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                {myEntries.length}회 응모
              </h2>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
              {totalUsedPoint}P 사용
            </span>
          </div>

          {myEntries.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center">
              <div className="text-3xl">🎟️</div>
              <p className="mt-2 text-sm font-bold text-gray-500">
                아직 이 드로우에 응모하지 않았어요.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {myEntries.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <p className="text-sm font-bold text-gray-900">응모 완료</p>

                  <div className="text-right">
                    <p className="text-xs font-bold text-violet-600">
                      -{entry.used_point}P
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">예상 당첨 지표</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                내 응모 영향도 {estimatedChance}%
              </h2>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
              {chanceLabel}
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400"
              style={{ width: `${estimatedChance}%` }}
            />
          </div>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            현재 참여자 수와 내 응모 횟수를 기준으로 계산한 참고 지표예요. 실제
            당첨 결과는 드로우 종료 후 운영 정책에 따라 확정됩니다.
          </p>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-bold text-gray-400">응모 안내</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">
            <li>• 응모 시 보유 포인트가 차감됩니다.</li>
            <li>• 응모 횟수가 많을수록 당첨 가능성이 높아질 수 있어요.</li>
            <li>• 당첨자는 드로우 종료 후 별도 안내됩니다.</li>
            <li>
              • 커리어 관련 혜택은 향후 멘토링·자소서·헤드헌터 상담으로 확대될
              예정입니다.
            </li>
          </ul>
        </section>

        <button
          onClick={handleEnterRaffle}
          disabled={isEntering || (profile?.point || 0) < event.entry_point}
          className={`w-full rounded-2xl px-4 py-4 text-sm font-bold ${
            (profile?.point || 0) >= event.entry_point
              ? "bg-gray-900 text-white"
              : "bg-gray-200 text-gray-400"
          }`}
        >
          {isEntering
            ? "응모 중..."
            : (profile?.point || 0) >= event.entry_point
              ? `${event.entry_point}P로 응모하기`
              : "포인트 부족"}
        </button>
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}
