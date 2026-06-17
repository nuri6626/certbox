import { supabase } from "./supabase";

export const getTodayString = () => {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

export const hasAttendedToday = async (userId: string) => {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("attendance_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("attended_date", today)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
};

export const createAttendance = async (userId: string) => {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("attendance_logs")
    .insert({
      user_id: userId,
      attended_date: today,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data;
};