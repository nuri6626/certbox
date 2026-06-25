"use client";

import { useEffect, useState } from "react";
import BottomTabBar from "../../../components/home/BottomTabBar";
import { getRaffleWinners, type RaffleWinner } from "../../../lib/raffle";

export default function RaffleWinnersPage() {
  const [winners, setWinners] = useState<RaffleWinner[]>([]);

  useEffect(() => {
    const loadWinners = async () => {
      const winnerData = await getRaffleWinners();
      setWinners(winnerData);
    };

    loadWinners();
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">
            커리어 드로우
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            당첨 발표
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            이번 달 커리어 드로우 당첨 결과를 확인해보세요.
          </p>
        </header>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              🏆
            </div>

            <div>
              <p className="text-sm font-bold text-violet-500">
                이번 달 발표
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-gray-900">
                총 {winners.length}명 당첨
              </h2>
            </div>
          </div>

          <p className="text-sm leading-6 text-gray-600">
            당첨자는 운영 정책에 따라 개별 안내될 예정입니다.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400">당첨자 목록</p>
              <h2 className="mt-1 text-lg font-extrabold text-gray-900">
                커리어 드로우 결과
              </h2>
            </div>

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
              {winners.length}건
            </span>
          </div>

          {winners.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 p-5 text-center">
              <div className="text-3xl">🎁</div>
              <p className="mt-2 text-sm font-bold text-gray-500">
                아직 발표된 당첨자가 없어요.
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                드로우가 종료되면 이곳에서 결과를 확인할 수 있어요.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {winners.map((winner) => (
                <div
                  key={winner.id}
                  className="rounded-3xl bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                      {winner.event?.image_emoji || "🎁"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900">
                        {winner.prize_title}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        당첨자: {winner.winner_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(winner.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-600">
                      당첨
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <button
          onClick={() => (window.location.href = "/benefits")}
          className="mt-5 w-full rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white"
        >
          드로우 응모하러 가기
        </button>
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}