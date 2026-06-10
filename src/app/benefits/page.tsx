"use client";

"use client";

import { useEffect, useState } from "react";
import BottomTabBar from "../../components/home/BottomTabBar";

const challenges = [
  {
    title: "SQLD 챌린지",
    desc: "시험일까지 공부 루틴을 완주해보세요",
    reward: "+100 XP · +1,000P",
    progress: 68,
  },
  {
    title: "토익 800 챌린지",
    desc: "목표 점수 달성 시 리워드 지급",
    reward: "+150 XP · +3,000P",
    progress: 42,
  },
];

const rankings = ["SQLD", "ADsP", "정보처리기사", "컴활 1급", "빅데이터분석기사"];

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

export default function BenefitsPage() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) =>
        prev === ads.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
              혜택
            </h1>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-500 shadow-sm">
            0P
          </div>
        </header>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-500">시험 응시료 혜택</p>
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
          <h2 className="mb-3 text-lg font-bold text-gray-900">
            자격증 챌린지
          </h2>

          <div className="space-y-3">
            {challenges.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white p-5 shadow-sm">
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
            <p className="text-xs font-bold opacity-90">
              {item.brand}
            </p>
            <p className="mt-1 text-lg font-extrabold">
              {item.title}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {item.desc}
            </p>
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
      </section>

      <BottomTabBar activeTab="benefits" />
    </main>
  );
}