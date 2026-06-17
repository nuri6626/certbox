"use client";

import { createAttendance, hasAttendedToday } from "../../lib/attendance";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { supabase } from "../../lib/supabase";
import {
  addXp,
  getProfile,
  getLevelTitle,
  getNextLevelXp,
  updateProfileDisplay,
  type Profile,
} from "../../lib/profiles";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAttendedToday, setIsAttendedToday] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editEmoji, setEditEmoji] = useState("🔥");
  const [showEmojiOptions, setShowEmojiOptions] = useState(false);

  useEffect(() => {
    const init = async () => {
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
        const attended = await hasAttendedToday(currentUser.id);
setIsAttendedToday(attended);
      }
    };

    init();
  }, []);
  const handleAttendance = async () => {
  if (!user || !profile) return;

  if (isAttendedToday) {
    alert("오늘은 이미 출석했어요.");
    return;
  }

  try {
    await createAttendance(user.id);

    const updatedProfile = await addXp(user.id, profile.xp, 1);
    setProfile(updatedProfile);
    setIsAttendedToday(true);

    alert("출석 완료! +1 XP를 획득했어요.");
  } catch (error) {
    console.error(error);
    alert("출석체크 실패");
  }
};

const emojiOptions = [
  "🔥", "☕", "📚", "🏅", "🚀", "👑", "📝", "💼",
  "🎯", "✅", "💪", "🧠", "🦾", "🐣", "😎", "🤓",
  "🫠", "💀", "⚡", "🌈", "🍀", "⭐", "💎", "🧩",
  "📖", "🖊️", "🎓", "🏆", "📌", "🗂️", "🧭", "🛠️",
];

const handleSaveProfile = async () => {
  if (!user) return;

  if (!editNickname.trim()) {
    alert("닉네임을 입력해주세요.");
    return;
  }

  try {
    const updatedProfile = await updateProfileDisplay(
      user.id,
      editNickname,
      editEmoji
    );

    setProfile(updatedProfile);
    setIsEditingProfile(false);
    setShowEmojiOptions(false);

    alert("프로필이 저장되었습니다.");
  } catch (error) {
    console.error(error);
    alert("프로필 저장 실패");
  }
};

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const point = profile?.point ?? 0;
  const streak = profile?.streak ?? 0;

  const nextLevelXp = getNextLevelXp(level);
  const currentLevelBaseXp = (level - 1) * 100;
  const currentProgressXp = xp - currentLevelBaseXp;
  const requiredXp = nextLevelXp - currentLevelBaseXp;
  const progressPercent = Math.min(
    100,
    Math.round((currentProgressXp / requiredXp) * 100)
  );

  const displayName =
    profile?.nickname ||
    user?.email?.split("@")[0] ||
    "커리어스 유저";

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
              {displayName.slice(0, 1)}
            </div>

            <div>
              <p className="text-lg font-bold text-gray-900">
                {displayName}
              </p>
              <p className="mt-1 text-sm font-semibold text-violet-600">
                Lv.{level} {getLevelTitle(level)}
              </p>
              <button
  onClick={() => {
    setEditNickname(displayName);
    setEditEmoji(profile?.avatar_emoji || "🔥");
    setIsEditingProfile(true);
  }}
  className="mt-2 text-xs font-bold text-gray-400"
>
  프로필 편집
</button>
            </div>
          </div>

          <div className="mt-5 h-3 rounded-full bg-gray-100">
            <div
              className="h-3 rounded-full bg-violet-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            다음 레벨까지 {Math.max(0, requiredXp - currentProgressXp)} XP 남았어요
          </p>
          <button
  onClick={handleAttendance}
  className={`mt-4 w-full rounded-2xl py-3 text-sm font-bold ${
    isAttendedToday
      ? "bg-gray-100 text-gray-400"
      : "bg-gray-900 text-white"
  }`}
>
  {isAttendedToday ? "오늘 출석 완료" : "오늘 출석하기 +1 XP"}
</button>
                </section>

        {isEditingProfile && (
          <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-900">
              프로필 편집
            </h3>

            <input
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              placeholder="닉네임 입력"
              className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
            />

            <button
              onClick={() =>
                setShowEmojiOptions(!showEmojiOptions)
              }
              className="mb-3 rounded-2xl bg-gray-100 px-4 py-2 text-sm font-bold"
            >
              대표 이모지 {editEmoji}
            </button>

            {showEmojiOptions && (
              <div className="mb-4 flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setEditEmoji(emoji)}
                    className={`rounded-xl px-3 py-2 text-xl ${
                      editEmoji === emoji
                        ? "bg-violet-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              className="w-full rounded-2xl bg-violet-600 py-3 font-bold text-white"
            >
              저장하기
            </button>
          </section>
        )}

        <section className="mb-5 grid grid-cols-3 gap-3">
          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{xp}</p>
            <p className="mt-1 text-xs text-gray-500">XP</p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{point}</p>
            <p className="mt-1 text-xs text-gray-500">포인트</p>
          </div>

          <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{streak}일</p>
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