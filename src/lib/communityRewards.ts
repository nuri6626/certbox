import { supabase } from "./supabase";

const getLevelByXp = (xp: number) => {
  if (xp >= 3000) return 7;
  if (xp >= 2000) return 6;
  if (xp >= 1200) return 5;
  if (xp >= 700) return 4;
  if (xp >= 300) return 3;
  if (xp >= 100) return 2;
  return 1;
};

export const awardCommunityXp = async ({
  userId,
  xp,
}: {
  userId: string;
  xp: number;
}) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("xp, point, level")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const currentXp = profile?.xp || 0;
  const currentPoints = profile?.point || 0;

  const nextXp = currentXp + xp;
  const nextPoints = currentPoints + xp;
  const nextLevel = getLevelByXp(nextXp);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      xp: nextXp,
      points: nextPoints,
      level: nextLevel,
    })
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return data;
};

export const getNextLevelXp = (level: number) => {
  switch (level) {
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 700;
    case 4:
      return 1200;
    case 5:
      return 2000;
    case 6:
      return 3000;
    default:
      return 5000;
  }
};
