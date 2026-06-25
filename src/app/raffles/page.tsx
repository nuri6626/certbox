"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { getMyRaffleEntries, type RaffleEntry } from "../../lib/raffle";
import { supabase } from "../../lib/supabase";

export default function RafflesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<RaffleEntry[]>([]);

  useEffect(() => {
    const loadEntries = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) return;

      const entryData = await getMyRaffleEntries(currentUser.id);
      setEntries(entryData);
    };

    loadEntries();
  }, []);

  const summary = useMemo(() => {
    const map = new Map<
      string,
      {
        title: string;
        emoji: string;
        count: number;
        usedPoint: number;
      }
    >();

    entries.forEach((entry) => {
      const event = entry.event;
      if (!event) return;

      const prev = map.get(event.id);

      if (prev) {
        map.set(event.id, {
          ...prev,
          count: prev.count + 1,
          usedPoint: prev.usedPoint + entry.used_point,
        });
      } else {
        map.set(event.id, {
          title: event.title,
          emoji: event.image_emoji,
          count: 1,
          usedPoint: entry.used_point,
        });
      }
    });

    return Array.from(map.values());
  }, [entries]);

  const totalUsedPoint = entries.reduce(
    (sum, entry) => sum + entry.used_point,
    0,
  );

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">커리어 드로우</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            내 응모 내역
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            이번 달 내가 어떤 혜택에 응모했는지 확인할 수 있어요.
          </p>
        </header>

        <section className="mb-5 rounded-[28px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-400">당첨 발표</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                이번 달 드로우 결과를 확인해보세요
              </h2>
            </div>

            <button
              onClick={() => (window.location.href = "/raffles/winners")}
              className="shrink-0 rounded-full bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600"
            >
              보기
            </button>
          </div>
        </section>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              🎟️
            </div>

            <div>
              <p className="text-sm font-bold text-violet-500">
                전체 응모 현황
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                총 {entries.length}회 응모
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold text-gray-400">사용 포인트</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {totalUsedPoint}P
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-bold text-gray-400">응모 상품</p>
              <p className="mt-1 text-lg font-extrabold text-gray-900">
                {summary.length}개
              </p>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900">
            상품별 응모 요약
          </h2>

          {summary.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-center">
              <p className="text-sm font-semibold text-gray-500">
                아직 응모 내역이 없어요.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {summary.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl">
                      {item.emoji}
                    </div>

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {item.count}회 응모
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-violet-600">
                    {item.usedPoint}P
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900">
            최근 응모 기록
          </h2>

          {entries.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-center">
              <p className="text-sm font-semibold text-gray-500">
                최근 응모 기록이 없습니다.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-900">
                      {entry.event?.image_emoji} {entry.event?.title}
                    </p>

                    <p className="text-xs font-bold text-violet-600">
                      -{entry.used_point}P
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}
