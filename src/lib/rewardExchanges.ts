import { supabase } from "./supabase";

export type RewardExchange = {
  id: string;
  user_id: string;
  reward_title: string;
  point_amount: number;
  status: string;
  created_at: string;
};

export const createRewardExchange = async ({
  userId,
  rewardTitle,
  pointAmount,
}: {
  userId: string;
  rewardTitle: string;
  pointAmount: number;
}) => {
  const { data, error } = await supabase
    .from("reward_exchanges")
    .insert({
      user_id: userId,
      reward_title: rewardTitle,
      point_amount: pointAmount,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as RewardExchange;
};

export const getMyRewardExchanges = async (userId: string) => {
  const { data, error } = await supabase
    .from("reward_exchanges")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as RewardExchange[];
};
