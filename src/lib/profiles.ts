import { supabase } from "./supabase";

export type Profile = {
  id: string;
  email: string | null;
  nickname: string | null;
  xp: number;
  level: number;
  point: number;
  streak: number;
};

export const getLevelTitle = (level: number) => {
  if (level >= 50) return "커리어의 신";
  if (level >= 30) return "커리어 마스터";
  if (level >= 20) return "전문가";
  if (level >= 10) return "실전러";
  if (level >= 5) return "수험생";
  return "신입생";
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

export const addXp = async (userId: string, currentXp: number, amount: number) => {
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
  pointAmount: number
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

