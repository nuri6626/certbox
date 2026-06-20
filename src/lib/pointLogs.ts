import { supabase } from "./supabase";

export type PointLog = {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
};

export const createPointLog = async ({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: string;
}) => {
  const { error } = await supabase.from("point_logs").insert({
    user_id: userId,
    amount,
    reason,
  });

  if (error) throw error;
};

export const getMyPointLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from("point_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return data as PointLog[];
};
