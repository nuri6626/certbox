import { supabase } from "./supabase";

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  target_date: string | null;
  progress: number;
  reward_xp: number;
  reward_point: number;
  is_completed: boolean;
  created_at: string;
  verified_at: string | null;
  verified_certificate_id: string | null;
};

export const getGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_completed", false)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Goal[];
};

export const getCompletedGoals = async (userId: string) => {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("is_completed", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as Goal[];
};
export const createGoal = async ({
  userId,
  title,
  targetDate,
}: {
  userId: string;
  title: string;
  targetDate: string;
}) => {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      title,
      target_date: targetDate || null,
      progress: 0,
      reward_xp: 50,
      reward_point: 20,
      is_completed: false,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as Goal;
};

export const updateGoalProgress = async (
  goalId: string,
  nextProgress: number,
) => {
  const { data, error } = await supabase
    .from("goals")
    .update({
      progress: nextProgress,
    })
    .eq("id", goalId)
    .select("*")
    .single();

  if (error) throw error;

  return data as Goal;
};

export const completeGoal = async (
  goalId: string,
  certificateId?: string | number,
) => {
  const { data, error } = await supabase
    .from("goals")
    .update({
      progress: 100,
      is_completed: true,
      verified_at: new Date().toISOString(),
      verified_certificate_id: certificateId ? String(certificateId) : null,
    })
    .eq("id", goalId)
    .select("*")
    .single();

  if (error) throw error;

  return data as Goal;
};
