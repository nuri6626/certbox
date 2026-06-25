"use client";

import BottomTabBar from "../../../components/home/BottomTabBar";

export default function RaffleRulesPage() {
  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <button
          onClick={() => (window.location.href = "/benefits")}
          className="mb-5 rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-600 shadow-sm"
        >
          ← 혜택으로 돌아가기
        </button>

        <header className="mb-6">
          <p className="text-sm font-semibold text-violet-500">커리어 드로우</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            응모 안내
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            포인트 사용과 당첨 기준을 확인해보세요.
          </p>
        </header>

        <section className="mb-5 rounded-[32px] bg-gradient-to-r from-cyan-50 via-white to-violet-100 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
            🎟️
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900">
            포인트는 응모에 사용돼요
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            커리어스 포인트는 바로 교환되는 현금성 포인트가 아니라, 드로우
            이벤트에 응모하기 위한 커리어 리워드 포인트입니다.
          </p>
        </section>

        <section className="space-y-3">
          {[
            {
              title: "1. 응모 시 포인트 차감",
              desc: "드로우에 응모하면 해당 이벤트에 표시된 포인트가 차감됩니다.",
              emoji: "💸",
            },
            {
              title: "2. 목표 인증 보상 중심",
              desc: "자격증 단순 등록보다 목표를 세우고 실제 취득·인증했을 때 더 많은 포인트가 지급됩니다.",
              emoji: "🎯",
            },
            {
              title: "3. 응모 횟수 기록",
              desc: "응모한 내역은 내 응모 현황에서 확인할 수 있습니다.",
              emoji: "📋",
            },
            {
              title: "4. 당첨 발표",
              desc: "드로우 종료 후 당첨자는 당첨 발표 페이지에서 확인할 수 있습니다.",
              emoji: "🏆",
            },
            {
              title: "5. 커리어 혜택 확대 예정",
              desc: "향후 자소서 첨삭, 현직자 멘토링, 헤드헌터 상담 등 커리어 혜택으로 확대될 예정입니다.",
              emoji: "🚀",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-50 to-violet-100 text-xl">
                  {item.emoji}
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-gray-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-500">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <button
          onClick={() => (window.location.href = "/benefits")}
          className="mt-6 w-full rounded-2xl bg-gray-900 py-4 text-sm font-bold text-white"
        >
          드로우 보러가기
        </button>
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}
