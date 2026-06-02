import { supabase } from "./supabase";
import type { Exam } from "../types/exam";

export const getExams = async (userId: string): Promise<Exam[]> => {
  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("user_id", userId)
    .order("exam_date", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    applyStart: item.apply_start || "",
    applyEnd: item.apply_end || "",
    examDate: item.exam_date || "",
    resultDate: item.result_date || "",
    memo: item.memo || "",
  }));
};

export const createExam = async ({
  userId,
  name,
  applyStart,
  applyEnd,
  examDate,
  resultDate,
  memo,
}: {
  userId: string;
  name: string;
  applyStart: string;
  applyEnd: string;
  examDate: string;
  resultDate: string;
  memo: string;
}) => {
  const { error } = await supabase.from("exams").insert({
    user_id: userId,
    name,
    apply_start: applyStart || null,
    apply_end: applyEnd || null,
    exam_date: examDate || null,
    result_date: resultDate || null,
    memo,
  });

  if (error) {
    throw error;
  }
};