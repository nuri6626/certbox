"use client";

import BottomTabBar from "../../components/home/BottomTabBar";

export default function MyPage() {
  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6">
          <p className="text-sm text-gray-500">커리어스</p>
          <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
            마이페이지
          </h1>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-2xl font-bold text-violet-600">
              누
            </div>

            <div>
              <p className="text-lg font-bold text-gray-900">이누리</p>
              <p className="mt-1 text-sm font-semibold text-violet-600">
                Lv.12 실전러
              </p>
            </div>
          </div>

          <div className="mt-5 h-3 rounded-full bg-gray-100">
            <div className="h-3 w-[62%] rounded-full bg-violet-500" />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            다음 레벨까지 380 XP 남았어요
          </p>
        </section>

        <section className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">1,240</p>
            <p className="mt-1 text-xs text-gray-500">XP</p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">7</p>
            <p className="mt-1 text-xs text-gray-500">보유 인증서</p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">5일</p>
            <p className="mt-1 text-xs text-gray-500">연속 출석</p>
          </div>
        </section>

        <section className="space-y-3">
          {["내 목표 관리", "획득 배지", "포인트 내역", "알림 설정", "로그아웃"].map(
            (item) => (
              <button
                key={item}
                className="flex w-full items-center justify-between rounded-3xl bg-white p-5 text-left shadow-sm"
              >
                <span className="font-bold text-gray-900">{item}</span>
                <span className="text-gray-300">〉</span>
              </button>
            )
          )}
        </section>
      </section>

      <BottomTabBar activeTab="mypage" />
    </main>
  );
}