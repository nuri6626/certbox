import { supabase } from "./supabase";

export type CommunityPost = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string | null;
  exam_name: string | null;
  study_period: string | null;
  attempt_count: string | null;
  study_method: string | null;
  likes: number;
  comments: number;
  created_at: string;
};

export const getPosts = async () => {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as CommunityPost[];
};

export const createPost = async ({
  userId,
  category,
  title,
  content,
  examName = "",
  studyPeriod = "",
  attemptCount = "",
  studyMethod = "",
}: {
  userId: string;
  category: string;
  title: string;
  content: string;
  examName?: string;
  studyPeriod?: string;
  attemptCount?: string;
  studyMethod?: string;
}) => {
  const { data, error } = await supabase
    .from("community_posts")
    .insert({
      user_id: userId,
      category,
      title,
      content,
      exam_name: examName || null,
      study_period: studyPeriod || null,
      attempt_count: attemptCount || null,
      study_method: studyMethod || null,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as CommunityPost;
};