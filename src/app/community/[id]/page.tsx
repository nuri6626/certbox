"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BottomTabBar from "../../../components/home/BottomTabBar";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../../../lib/supabase";
import { getProfile, type Profile } from "../../../lib/profiles";
import {
  createComment,
  createPostLike,
  deletePostLike,
  getComments,
  getMyPostLike,
  getPosts,
  updatePostLikes,
  type CommunityComment,
  type CommunityPost,
} from "../../../lib/community";

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const postId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const loadDetail = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getProfile(currentUser.id, currentUser.email);
        setProfile(profileData);

        const myLike = await getMyPostLike(postId, currentUser.id);
        setIsLiked(!!myLike);
      }

      const posts = await getPosts();
      const selectedPost = posts.find((item) => item.id === postId) ?? null;
      setPost(selectedPost);

      const commentData = await getComments(postId);
      setComments(commentData);
    };

    loadDetail();
  }, [postId]);

  const handleLike = async () => {
    if (!user || !post) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const currentLikes = post.likes || 0;
      let nextLikes = currentLikes;

      if (isLiked) {
        await deletePostLike(post.id, user.id);
        nextLikes = Math.max(currentLikes - 1, 0);
        setIsLiked(false);
      } else {
        await createPostLike(post.id, user.id);
        nextLikes = currentLikes + 1;
        setIsLiked(true);
      }

      const updatedPost = await updatePostLikes(post.id, nextLikes);
      setPost(updatedPost);
    } catch (error) {
      console.error(error);
      alert("좋아요 처리 실패");
    }
  };

  const handleCreateComment = async () => {
    if (!user || !post) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!commentContent.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    try {
      const newComment = await createComment({
        postId: post.id,
        userId: user.id,
        authorName:
          profile?.nickname || user.email?.split("@")[0] || "커리어스 유저",
        authorEmoji: profile?.avatar_emoji || "🔥",
        content: commentContent,
      });

      setComments((prev) => [...prev, newComment]);
      setCommentContent("");
    } catch (error) {
      console.error(error);
      alert("댓글 등록 실패");
    }
  };

  if (!post) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 pb-32">
        <section className="mx-auto max-w-md">
          <button
            onClick={() => router.back()}
            className="mb-5 text-sm font-bold text-gray-400"
          >
            ← 뒤로가기
          </button>

          <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            게시글을 불러오는 중입니다.
          </div>
        </section>

        <BottomTabBar activeTab="community" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 pb-32">
      <section className="mx-auto max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-5 text-sm font-bold text-gray-400"
        >
          ← 뒤로가기
        </button>

        <article className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="mb-4">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-600">
              {post.category}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900">
            {post.title}
          </h1>

          {(post.exam_name ||
            post.study_period ||
            post.attempt_count ||
            post.study_method) && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {post.exam_name && (
                <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                  시험명: {post.exam_name}
                </div>
              )}

              {post.study_period && (
                <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                  공부기간: {post.study_period}
                </div>
              )}

              {post.attempt_count && (
                <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                  응시횟수: {post.attempt_count}회
                </div>
              )}

              {post.study_method && (
                <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                  학습방법: {post.study_method}
                </div>
              )}
            </div>
          )}

          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {post.content}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-bold text-gray-800">
                {post.author_emoji || "🔥"}{" "}
                {post.author_name || "커리어스 유저"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-violet-500">
                {post.author_level || "😵 접수만 함"}
              </p>
            </div>

            <button
              onClick={handleLike}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                isLiked
                  ? "bg-rose-50 text-rose-500"
                  : "bg-gray-50 text-gray-400"
              }`}
            >
              ❤️ {post.likes || 0}
            </button>
          </div>
        </article>

        <section className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-extrabold text-gray-900">
            댓글 {comments.length}개
          </h2>

          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-gray-400">
                아직 댓글이 없습니다.
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm font-bold text-gray-800">
                    {comment.author_emoji || "🔥"}{" "}
                    {comment.author_name || "커리어스 유저"}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              className="flex-1 rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
            />

            <button
              onClick={handleCreateComment}
              className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-bold text-white"
            >
              등록
            </button>
          </div>
        </section>
      </section>

      <BottomTabBar activeTab="community" />
    </main>
  );
}
