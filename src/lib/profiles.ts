import { supabase } from "./supabase";

export type Profile = {
  id: string;
  email: string | null;
  nickname: string | null;
  avatar_emoji: string | null;
  xp: number;
  level: number;
  point: number;
  streak: number;
};

export const getLevelTitle = (level: number) => {
  if (level >= 50) return "👑 인간 국가기술자격증";
  if (level >= 40) return "🚀 스펙 괴물";
  if (level >= 30) return "🏅 자격증 중독자";
  if (level >= 20) return "✅ 합격 맛집";
  if (level >= 15) return "🔥 벼락치기 장인";
  if (level >= 10) return "☕ 스터디카페 VIP";
  if (level >= 5) return "📚 기출 수집가";
  return "😵 접수만 함";
};

export const calculateLevel = (xp: number) => {
  return Math.floor(xp / 100) + 1;
};

export const getNextLevelXp = (level: number) => {
  return level * 100;
};

export const getProfile = async (userId: string, email?: string | null) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    return data as Profile;
  }

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  const newProfile = {
    id: userId,
    email: email ?? null,
    nickname: email?.split("@")[0] ?? "커리어스 유저",
    avatar_emoji: "🔥",
    xp: 0,
    level: 1,
    point: 0,
    streak: 0,
  };

  const { data: created, error: createError } = await supabase
    .from("profiles")
    .insert(newProfile)
    .select("*")
    .single();

  if (createError) {
    throw createError;
  }

  return created as Profile;
};

export const addXp = async (
  userId: string,
  currentXp: number,
  amount: number,
) => {
  const nextXp = currentXp + amount;
  const nextLevel = calculateLevel(nextXp);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      xp: nextXp,
      level: nextLevel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Profile;
};

export const addXpAndPoint = async (
  userId: string,
  currentXp: number,
  currentPoint: number,
  xpAmount: number,
  pointAmount: number,
) => {
  const nextXp = currentXp + xpAmount;
  const nextLevel = calculateLevel(nextXp);
  const nextPoint = currentPoint + pointAmount;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      xp: nextXp,
      level: nextLevel,
      point: nextPoint,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return data as Profile;
};

export const updateProfileDisplay = async (
  userId: string,
  nickname: string,
  avatarEmoji: string,
) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      nickname,
      avatar_emoji: avatarEmoji,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return data as Profile;
};

export const addAttendanceReward = async ({
  userId,
  currentXp,
  currentPoint,
  currentStreak,
  xpAmount,
  pointAmount,
}: {
  userId: string;
  currentXp: number;
  currentPoint: number;
  currentStreak: number;
  xpAmount: number;
  pointAmount: number;
}) => {
  const nextStreak = currentStreak + 1;

  let bonusXp = 0;
  let bonusPoint = 0;

  if (nextStreak === 30) {
    bonusXp = 50;
    bonusPoint = 10;
  } else if (nextStreak === 7) {
    bonusXp = 10;
    bonusPoint = 3;
  }

  const totalXpAmount = xpAmount + bonusXp;
  const totalPointAmount = pointAmount + bonusPoint;

  const nextXp = currentXp + totalXpAmount;
  const nextLevel = calculateLevel(nextXp);
  const nextPoint = currentPoint + totalPointAmount;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      xp: nextXp,
      level: nextLevel,
      point: nextPoint,
      streak: nextStreak,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return {
    profile: data as Profile,
    bonusXp,
    bonusPoint,
    totalXpAmount,
    totalPointAmount,
    nextStreak,
  };
};

export const getRankingProfiles = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, avatar_emoji, xp, level, point, streak")
    .order("xp", { ascending: false })
    .limit(5);

  if (error) throw error;

  return data as Profile[];
};

export const spendPoint = async (
  userId: string,
  currentPoint: number,
  amount: number,
) => {
  const nextPoint = Math.max(currentPoint - amount, 0);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      point: nextPoint,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return data as Profile;
};
