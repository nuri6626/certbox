"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { supabase } from "../../lib/supabase";
import { getProfile, getLevelTitle, type Profile } from "../../lib/profiles";
import {
  createPost,
  getPosts,
  type CommunityPost,
} from "../../lib/community";

const categories = [
  "전체",
  "합격후기",
  "질문답변",
  "공부인증",
  "시험정보",
  "스터디",
  "취업",
];

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [postCategory, setPostCategory] = useState("합격후기");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [examName, setExamName] = useState("");
  const [studyPeriod, setStudyPeriod] = useState("");
  const [attemptCount, setAttemptCount] = useState("");
  const [studyMethod, setStudyMethod] = useState("");

  useEffect(() => {
    const loadCommunity = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getProfile(
          currentUser.id,
          currentUser.email
        );
        setProfile(profileData);
      }

      const postData = await getPosts();
      setPosts(postData);
    };

    loadCommunity();
  }, []);

  const handleCreatePost = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!postTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    try {
      const newPost = await createPost({
  userId: user.id,
  category: postCategory,
  title: postTitle,
  content: postContent,
  examName,
  studyPeriod,
  attemptCount,
  studyMethod,
});

      setPosts((prev) => [newPost, ...prev]);
      setPostTitle("");
      setPostContent("");
      setExamName("");
      setStudyPeriod("");
      setAttemptCount("");
      setStudyMethod("");
      setPostCategory("합격후기");
      setIsWriteOpen(false);

      alert("게시글이 등록되었습니다.");
    } catch (error) {
      console.error(error);
      alert("게시글 등록 실패");
    }
  };

  const filteredPosts =
    selectedCategory === "전체"
      ? posts
      : posts.filter((post) => post.category === selectedCategory);

  const displayName =
    profile?.nickname || user?.email?.split("@")[0] || "커리어스 유저";

  const displayEmoji = profile?.avatar_emoji || "🔥";
  const displayLevel = profile ? getLevelTitle(profile.level) : "😵 접수만 함";

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">커뮤니티</h1>
          <p className="mt-2 text-sm text-gray-500">
            자격증 정보와 합격 노하우를 공유하세요
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
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
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              아직 게시글이 없습니다.
            </div>
          ) : (
            filteredPosts.map((post) => (
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

                {post.content && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {post.content}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-gray-800">
                      {displayEmoji} {displayName}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-violet-500">
                      {displayLevel}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {isWriteOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-5">
            <div className="w-full max-w-md rounded-t-[32px] bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">글쓰기</h2>

                <button
                  onClick={() => setIsWriteOpen(false)}
                  className="text-sm font-bold text-gray-400"
                >
                  닫기
                </button>
              </div>

              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              >
                {categories
                  .filter((category) => category !== "전체")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>

              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              />

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={5}
                className="mb-4 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              />

              <button
                onClick={handleCreatePost}
                className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white"
              >
                등록하기
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsWriteOpen(true)}
          className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-2xl text-white shadow-lg"
        >
          +
        </button>
      </section>

      <BottomTabBar activeTab="community" />
    </main>
  );
}