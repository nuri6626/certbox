"use client";

import { useState } from "react";
import BottomTabBar from "../../components/home/BottomTabBar";

const categories = [
  "전체",
  "합격후기",
  "질문답변",
  "공부인증",
  "시험정보",
  "스터디",
  "취업",
];

const posts = [
  {
    id: 1,
    category: "합격후기",
    title: "SQLD 비전공자 2주 합격 후기",
    level: "Lv.12 실전러",
    likes: 32,
    comments: 12,
    time: "2시간 전",
  },
  {
    id: 2,
    category: "질문답변",
    title: "ADsP 노베이스 독학 가능할까요?",
    level: "Lv.5 수험생",
    likes: 8,
    comments: 15,
    time: "4시간 전",
  },
  {
    id: 3,
    category: "공부인증",
    title: "오늘 SQLD 기출 3회독 완료",
    level: "Lv.9 실전러",
    likes: 24,
    comments: 6,
    time: "6시간 전",
  },
  {
    id: 4,
    category: "시험정보",
    title: "2026 정보처리기사 일정 정리",
    level: "Lv.15 전문가",
    likes: 48,
    comments: 19,
    time: "1일 전",
  },
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredPosts =
    selectedCategory === "전체"
      ? posts
      : posts.filter(
          (post) => post.category === selectedCategory
        );

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            커뮤니티
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            자격증 정보와 합격 노하우를 공유하세요
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(category)
              }
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                selectedCategory === category
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-500"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl bg-white p-5 shadow-sm"
            >
              <div className="mb-2">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-600">
                  {post.category}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900">
                {post.title}
              </h3>

              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>{post.level}</span>

                <div className="flex items-center gap-3">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>{post.time}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <button className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg">
          +
        </button>
      </section>

      <BottomTabBar activeTab="community" />
    </main>
  );
}