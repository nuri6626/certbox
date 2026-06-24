import { supabase } from "./supabase";

export type RaffleEvent = {
  id: string;
  title: string;
  description: string;
  image_emoji: string;
  entry_point: number;
  winner_count: number;
  participant_count: number;
};

export const getRaffleEvents = async () => {
  const { data, error } = await supabase
    .from("raffle_events")
    .select("*")
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as RaffleEvent[];
};
