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

export type RaffleEntry = {
  id: string;
  event_id: string;
  user_id: string;
  used_point: number;
  created_at: string;
  event?: RaffleEvent;
};

export type RaffleWinner = {
  id: string;
  event_id: string;
  user_id: string | null;
  winner_name: string;
  prize_title: string;
  created_at: string;
  event?: RaffleEvent;
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

export const getRaffleEventById = async (eventId: string) => {
  const { data, error } = await supabase
    .from("raffle_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) throw error;

  return data as RaffleEvent;
};

export const getMyRaffleEntries = async (userId: string) => {
  const { data, error } = await supabase
    .from("raffle_entries")
    .select(
      `
      *,
      event:raffle_events (*)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as RaffleEntry[];
};

export const getMyRaffleEntriesByEventId = async ({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}) => {
  const { data, error } = await supabase
    .from("raffle_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as RaffleEntry[];
};

export const createRaffleEntry = async ({
  eventId,
  userId,
  usedPoint,
}: {
  eventId: string;
  userId: string;
  usedPoint: number;
}) => {
  const { data, error } = await supabase
    .from("raffle_entries")
    .insert({
      event_id: eventId,
      user_id: userId,
      used_point: usedPoint,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as RaffleEntry;
};

export const increaseRaffleParticipantCount = async ({
  eventId,
  nextParticipantCount,
}: {
  eventId: string;
  nextParticipantCount: number;
}) => {
  const { data, error } = await supabase
    .from("raffle_events")
    .update({
      participant_count: nextParticipantCount,
    })
    .eq("id", eventId)
    .select("*")
    .single();

  if (error) throw error;

  return data as RaffleEvent;
};

export const getRaffleWinners = async () => {
  const { data, error } = await supabase
    .from("raffle_winners")
    .select(
      `
      *,
      event:raffle_events (*)
    `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as RaffleWinner[];
};
