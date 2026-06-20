import { supabase } from "./supabase";

export type CommunityPost = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string | null;

  exam_name: string | null;
  study_period: string | null;
  attempt_count: number | null;
  study_method: string | null;

  likes: number;
  comments: number;
  created_at: string;

  author_name: string | null;
  author_emoji: string | null;
  author_level: string | null;
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

  authorName = "커리어스 유저",
  authorEmoji = "🔥",
  authorLevel = "😵 접수만 함",
}: {
  userId: string;
  category: string;
  title: string;
  content: string;
  examName?: string;
  studyPeriod?: string;
  attemptCount?: string;
  studyMethod?: string;

  authorName?: string;
  authorEmoji?: string;
  authorLevel?: string;
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
      attempt_count: attemptCount ? Number(attemptCount) : null,
      study_method: studyMethod || null,

      author_name: authorName,
      author_emoji: authorEmoji,
      author_level: authorLevel,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as CommunityPost;
};

export const updatePostLikes = async (postId: string, likes: number) => {
  const { data, error } = await supabase
    .from("community_posts")
    .update({ likes })
    .eq("id", postId)
    .select("*")
    .single();

  if (error) throw error;

  return data as CommunityPost;
};

export type CommunityComment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string | null;
  author_emoji: string | null;
  content: string;
  created_at: string;
};

export const getComments = async (postId: string) => {
  const { data, error } = await supabase
    .from("community_comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data as CommunityComment[];
};

export const createComment = async ({
  postId,
  userId,
  authorName,
  authorEmoji,
  content,
}: {
  postId: string;
  userId: string;
  authorName: string;
  authorEmoji: string;
  content: string;
}) => {
  const { data, error } = await supabase
    .from("community_comments")
    .insert({
      post_id: postId,
      user_id: userId,
      author_name: authorName,
      author_emoji: authorEmoji,
      content,
    })
    .select("*")
    .single();

  if (error) throw error;

  return data as CommunityComment;
};

export const updatePostComments = async (postId: string, comments: number) => {
  const { data, error } = await supabase
    .from("community_posts")
    .update({ comments })
    .eq("id", postId)
    .select("*")
    .single();

  if (error) throw error;

  return data as CommunityPost;
};

export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from("community_posts")
    .delete()
    .eq("id", postId);

  if (error) throw error;
};

export const deleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from("community_comments")
    .delete()
    .eq("id", commentId);

  if (error) throw error;
};

export const updatePost = async ({
  postId,
  title,
  content,
}: {
  postId: string;
  title: string;
  content: string;
}) => {
  const { data, error } = await supabase
    .from("community_posts")
    .update({ title, content })
    .eq("id", postId)
    .select("*")
    .single();

  if (error) throw error;

  return data as CommunityPost;
};

export const getMyPostLike = async (postId: string, userId: string) => {
  const { data, error } = await supabase
    .from("community_likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

export const createPostLike = async (postId: string, userId: string) => {
  const { error } = await supabase.from("community_likes").insert({
    post_id: postId,
    user_id: userId,
  });

  if (error) throw error;
};

export const deletePostLike = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from("community_likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);

  if (error) throw error;
};

export const getMyPosts = async (userId: string) => {
  const { data, error } = await supabase
    .from("community_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as CommunityPost[];
};

export type MyComment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string | null;
  author_emoji: string | null;
  content: string;
  created_at: string;
  community_posts: {
    id: string;
    title: string;
    category: string;
  } | null;
};

export const getMyComments = async (userId: string) => {
  const { data, error } = await supabase
    .from("community_comments")
    .select(
      `
      *,
      community_posts (
        id,
        title,
        category
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as MyComment[];
};
