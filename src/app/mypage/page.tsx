"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { createAttendance, hasAttendedToday } from "../../lib/attendance";
import {
  addAttendanceReward,
  getLevelTitle,
  getNextLevelXp,
  getProfile,
  getRankingProfiles,
  updateProfileDisplay,
  type Profile,
} from "../../lib/profiles";
import {
  createPointLog,
  getMyPointLogs,
  type PointLog,
} from "../../lib/pointLogs";
import {
  getMyComments,
  getMyPosts,
  type CommunityPost,
  type MyComment,
} from "../../lib/community";
import { supabase } from "../../lib/supabase";

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [rankingProfiles, setRankingProfiles] = useState<Profile[]>([]);

  const [isAttendedToday, setIsAttendedToday] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editEmoji, setEditEmoji] = useState("🔥");
  const [showEmojiOptions, setShowEmojiOptions] = useState(false);

  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [showMyPosts, setShowMyPosts] = useState(false);

  const [myComments, setMyComments] = useState<MyComment[]>([]);
  const [showMyComments, setShowMyComments] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const [pointLogs, setPointLogs] = useState<PointLog[]>([]);
  const [showPointLogs, setShowPointLogs] = useState(false);

  const emojiOptions = [
    "🔥",
    "☕",
    "📚",
    "🏅",
    "🚀",
    "👑",
    "📝",
    "💼",
    "🎯",
    "✅",
    "💪",
    "🧠",
    "🦾",
    "🐣",
    "😎",
    "🤓",
    "🫠",
    "💀",
    "⚡",
    "🌈",
    "🍀",
    "⭐",
    "💎",
    "🧩",
    "📖",
    "🖊️",
    "🎓",
    "🏆",
    "📌",
    "🗂️",
    "🧭",
    "🛠️",
  ];

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getProfile(currentUser.id, currentUser.email);
        setProfile(profileData);

        const attended = await hasAttendedToday(currentUser.id);
        setIsAttendedToday(attended);

        const postData = await getMyPosts(currentUser.id);
        setMyPosts(postData);

        const commentData = await getMyComments(currentUser.id);
        setMyComments(commentData);

        const rankingData = await getRankingProfiles();
        setRankingProfiles(rankingData);

        const pointLogData = await getMyPointLogs(currentUser.id);
        setPointLogs(pointLogData);
      }
    };

    init();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 2200);
  };

  const handleAttendance = async () => {
    if (!user || !profile) return;

    if (isAttendedToday) {
      alert("오늘은 이미 출석했어요.");
      return;
    }

    try {
      await createAttendance(user.id);

      const beforeLevel = profile.level;

      const beforeBadgeCount = getUnlockedBadgeCount({
        xpValue: profile.xp,
        streakValue: profile.streak,
        postCount: myPosts.length,
        commentCount: myComments.length,
      });

      const rewardResult = await addAttendanceReward({
        userId: user.id,
        currentXp: profile.xp,
        currentPoint: profile.point,
        currentStreak: profile.streak,
        xpAmount: 1,
        pointAmount: 1,
      });

      setProfile(rewardResult.profile);
      setIsAttendedToday(true);

      await createPointLog({
        userId: user.id,
        amount: rewardResult.totalPointAmount,
        reason:
          rewardResult.bonusPoint > 0
            ? `${rewardResult.nextStreak}일 연속 출석 보너스`
            : "출석 체크",
      });

      const updatedPointLogs = await getMyPointLogs(user.id);
      setPointLogs(updatedPointLogs);

      const afterLevel = rewardResult.profile.level;

      const afterBadgeCount = getUnlockedBadgeCount({
        xpValue: rewardResult.profile.xp,
        streakValue: rewardResult.profile.streak,
        postCount: myPosts.length,
        commentCount: myComments.length,
      });

      if (afterLevel > beforeLevel) {
        showToast(
          `🎉 LEVEL UP! Lv.${beforeLevel} → Lv.${afterLevel} ${getLevelTitle(
            afterLevel,
          )}`,
        );
      } else if (afterBadgeCount > beforeBadgeCount) {
        showToast("🎖️ 신규 배지를 획득했어요!");
      } else if (rewardResult.bonusXp > 0) {
        showToast(
          `🎁 연속 출석 보너스! +${rewardResult.totalXpAmount} XP / +${rewardResult.totalPointAmount}P`,
        );
      } else {
        showToast("✅ 출석 완료! +1 XP / +1P");
      }
    } catch (error) {
      console.error(error);
      alert("출석체크 실패");
    }
  };

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
        editEmoji,
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
    Math.round((currentProgressXp / requiredXp) * 100),
  );

  const displayName =
    profile?.nickname || user?.email?.split("@")[0] || "커리어스 유저";

  const getStreakMessage = (streakCount: number) => {
    if (streakCount >= 30) return "👑 한 달 출석 마스터";
    if (streakCount >= 14) return "🔥 2주 연속 루틴 성공";
    if (streakCount >= 7) return "🏆 일주일 출석 달성";
    if (streakCount >= 3) return "💪 3일 연속 출석 중";
    if (streakCount >= 1) return "🌱 출석 루틴 시작";
    return "아직 출석 기록이 없어요";
  };

  const getUnlockedBadgeCount = ({
    xpValue,
    streakValue,
    postCount,
    commentCount,
  }: {
    xpValue: number;
    streakValue: number;
    postCount: number;
    commentCount: number;
  }) => {
    const badgeConditions = [
      xpValue >= 10,
      streakValue >= 3,
      streakValue >= 7,
      postCount >= 1,
      commentCount >= 1,
      xpValue >= 500,
    ];

    return badgeConditions.filter(Boolean).length;
  };

  const badges = [
    {
      emoji: "🌱",
      title: "첫걸음",
      description: "XP 10 이상 달성",
      unlocked: xp >= 10,
    },
    {
      emoji: "🔥",
      title: "루틴러",
      description: "연속 출석 3일 이상",
      unlocked: streak >= 3,
    },
    {
      emoji: "🏆",
      title: "일주일러",
      description: "연속 출석 7일 이상",
      unlocked: streak >= 7,
    },
    {
      emoji: "✍️",
      title: "글쓰기러",
      description: "게시글 1개 이상 작성",
      unlocked: myPosts.length >= 1,
    },
    {
      emoji: "💬",
      title: "소통러",
      description: "댓글 1개 이상 작성",
      unlocked: myComments.length >= 1,
    },
    {
      emoji: "👑",
      title: "고수의 길",
      description: "XP 500 이상 달성",
      unlocked: xp >= 500,
    },
  ];

  return (
    <main className="relative min-h-screen bg-[#F6F7F9] pb-32">
      {toastMessage && (
        <div className="fixed left-1/2 top-5 z-[200] w-[90%] max-w-sm -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-4 text-center text-sm font-bold text-white shadow-xl">
          {toastMessage}
        </div>
      )}

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
              {profile?.avatar_emoji || "🔥"}
            </div>

            <div>
              <p className="text-lg font-bold text-gray-900">{displayName}</p>
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
            다음 레벨까지 {Math.max(0, requiredXp - currentProgressXp)} XP
            남았어요
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

          <div className="mt-4 rounded-2xl bg-violet-50 p-4">
            <p className="text-sm font-bold text-violet-700">
              {getStreakMessage(streak)}
            </p>
            <p className="mt-1 text-xs text-violet-500">
              연속 출석이 쌓일수록 더 많은 보상을 받을 수 있어요.
            </p>
          </div>
        </section>

        {isEditingProfile && (
          <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold text-gray-900">프로필 편집</h3>

            <input
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              placeholder="닉네임 입력"
              className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
            />

            <button
              onClick={() => setShowEmojiOptions(!showEmojiOptions)}
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
                      editEmoji === emoji ? "bg-violet-100" : "bg-gray-100"
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

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-extrabold text-gray-900">
            🏆 XP 랭킹 TOP 5
          </h3>

          <div className="space-y-3">
            {rankingProfiles.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                아직 랭킹 데이터가 없습니다.
              </div>
            ) : (
              rankingProfiles.map((rankingProfile, index) => {
                const isMe = rankingProfile.id === user?.id;

                return (
                  <div
                    key={rankingProfile.id}
                    className={`flex items-center gap-3 rounded-2xl p-3 ${
                      isMe ? "bg-violet-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-extrabold text-gray-600">
                      {index + 1}
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl">
                      {rankingProfile.avatar_emoji || "🔥"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-gray-900">
                        {rankingProfile.nickname ||
                          rankingProfile.email?.split("@")[0] ||
                          "커리어스 유저"}
                        {isMe && (
                          <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
                            나
                          </span>
                        )}
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-gray-400">
                        Lv.{rankingProfile.level || 1}{" "}
                        {getLevelTitle(rankingProfile.level || 1)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-extrabold text-violet-600">
                        {rankingProfile.xp || 0}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">XP</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                🎖️ 획득 배지
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                활동할수록 새로운 배지가 열려요
              </p>
            </div>

            <span className="text-xs font-bold text-violet-600">
              {badges.filter((badge) => badge.unlocked).length}/{badges.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className={`rounded-2xl p-4 ${
                  badge.unlocked ? "bg-violet-50" : "bg-gray-50 opacity-50"
                }`}
              >
                <div className="text-2xl">
                  {badge.unlocked ? badge.emoji : "🔒"}
                </div>
                <p
                  className={`mt-2 text-sm font-extrabold ${
                    badge.unlocked ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {badge.title}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {badge.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <button
            onClick={() => setShowPointLogs(!showPointLogs)}
            className="flex w-full items-center justify-between"
          >
            <div>
              <p className="text-left text-base font-extrabold text-gray-900">
                포인트 내역
              </p>
              <p className="mt-1 text-left text-xs text-gray-500">
                최근 {pointLogs.length}개 활동
              </p>
            </div>

            <span className="text-gray-300">{showPointLogs ? "⌃" : "〉"}</span>
          </button>

          {showPointLogs && (
            <div className="mt-4 space-y-2">
              {pointLogs.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                  아직 포인트 내역이 없습니다.
                </div>
              ) : (
                pointLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {log.reason}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <p className="text-sm font-extrabold text-violet-600">
                      +{log.amount}P
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <button
            onClick={() => setShowMyPosts(!showMyPosts)}
            className="flex w-full items-center justify-between"
          >
            <div>
              <p className="text-left text-base font-extrabold text-gray-900">
                내가 쓴 글
              </p>
              <p className="mt-1 text-left text-xs text-gray-500">
                총 {myPosts.length}개 작성
              </p>
            </div>

            <span className="text-gray-300">{showMyPosts ? "⌃" : "〉"}</span>
          </button>

          {showMyPosts && (
            <div className="mt-4 space-y-2">
              {myPosts.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                  아직 작성한 글이 없습니다.
                </div>
              ) : (
                myPosts.map((post) => (
                  <div key={post.id} className="rounded-2xl bg-gray-50 p-4">
                    <p className="font-bold text-gray-900">{post.title}</p>

                    {post.content && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {post.content}
                      </p>
                    )}

                    <div className="mt-3 flex gap-3 text-xs text-gray-400">
                      <span>❤️ {post.likes || 0}</span>
                      <span>💬 {post.comments || 0}</span>
                      <span>
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className="mb-5 rounded-3xl bg-white p-5 shadow-sm">
          <button
            onClick={() => setShowMyComments(!showMyComments)}
            className="flex w-full items-center justify-between"
          >
            <div>
              <p className="text-left text-base font-extrabold text-gray-900">
                내가 쓴 댓글
              </p>
              <p className="mt-1 text-left text-xs text-gray-500">
                총 {myComments.length}개 작성
              </p>
            </div>

            <span className="text-gray-300">{showMyComments ? "⌃" : "〉"}</span>
          </button>

          {showMyComments && (
            <div className="mt-4 space-y-2">
              {myComments.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                  아직 작성한 댓글이 없습니다.
                </div>
              ) : (
                myComments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-sm font-bold text-gray-900">
                      {comment.community_posts?.title || "삭제된 게시글"}
                    </p>

                    <p className="mt-2 text-sm text-gray-600">
                      {comment.content}
                    </p>

                    <p className="mt-3 text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        <section className="space-y-3">
          {["내 목표 관리", "알림 설정", "로그아웃"].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between rounded-3xl bg-white p-5 text-left shadow-sm"
            >
              <span className="font-bold text-gray-900">{item}</span>
              <span className="text-gray-300">〉</span>
            </button>
          ))}
        </section>
      </section>

      <BottomTabBar activeTab="mypage" />
    </main>
  );
}
