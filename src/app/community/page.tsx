"use client";

import { awardCommunityXp } from "../../lib/communityRewards";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BottomTabBar from "../../components/home/BottomTabBar";
import { supabase } from "../../lib/supabase";
import { getProfile, getLevelTitle, type Profile } from "../../lib/profiles";
import {
  createComment,
  createPost,
  createPostLike,
  deleteComment,
  deletePost,
  deletePostLike,
  getComments,
  getMyPostLike,
  getPosts,
  updatePost,
  updatePostComments,
  updatePostLikes,
  type CommunityComment,
  type CommunityPost,
} from "../../lib/community";

const categories = [
  "전체",
  "합격후기",
  "질문답변",
  "공부인증",
  "시험정보",
  "스터디",
  "취업",
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "합격후기":
      return "🏆";
    case "질문답변":
      return "❓";
    case "공부인증":
      return "🔥";
    case "시험정보":
      return "📌";
    case "스터디":
      return "👥";
    case "취업":
      return "💼";
    default:
      return "💬";
  }
};

const getCategoryStyle = (category: string) => {
  switch (category) {
    case "합격후기":
      return "bg-emerald-100 text-emerald-700";
    case "질문답변":
      return "bg-blue-100 text-blue-700";
    case "공부인증":
      return "bg-orange-100 text-orange-700";
    case "시험정보":
      return "bg-indigo-100 text-indigo-700";
    case "스터디":
      return "bg-pink-100 text-pink-700";
    case "취업":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-violet-100 text-violet-700";
  }
};

export default function CommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortType, setSortType] = useState<"latest" | "popular">("latest");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentContent, setCommentContent] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [postCategory, setPostCategory] = useState("합격후기");
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");

  const [examName, setExamName] = useState("");
  const [studyPeriod, setStudyPeriod] = useState("");
  const [attemptCount, setAttemptCount] = useState("");
  const [studyMethod, setStudyMethod] = useState("");

  const showExamName = [
    "합격후기",
    "질문답변",
    "공부인증",
    "시험정보",
    "스터디",
    "취업",
  ].includes(postCategory);

  const showStudyPeriod = ["합격후기", "공부인증", "스터디"].includes(
    postCategory,
  );

  const showAttemptCount = ["합격후기"].includes(postCategory);

  const showStudyMethod = ["합격후기", "공부인증", "스터디", "취업"].includes(
    postCategory,
  );

  useEffect(() => {
    const loadCommunity = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const profileData = await getProfile(currentUser.id, currentUser.email);
        setProfile(profileData);
      }

      const postData = await getPosts();
      setPosts(postData);
    };

    loadCommunity();
  }, []);

  const resetWriteForm = () => {
    setPostTitle("");
    setPostContent("");
    setExamName("");
    setStudyPeriod("");
    setAttemptCount("");
    setStudyMethod("");
    setPostCategory("합격후기");
  };

  const handleCreatePost = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!postTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!postContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      const newPost = await createPost({
        userId: user.id,
        category: postCategory,
        title: postTitle,
        content: postContent,
        examName: showExamName ? examName : "",
        studyPeriod: showStudyPeriod ? studyPeriod : "",
        attemptCount: showAttemptCount ? attemptCount : "",
        studyMethod: showStudyMethod ? studyMethod : "",
        authorName: displayName,
        authorEmoji: displayEmoji,
        authorLevel: displayLevel,
      });

      setPosts((prev) => [newPost, ...prev]);
      resetWriteForm();
      setIsWriteOpen(false);

      const rewardXp = postCategory === "합격후기" ? 30 : 10;

      try {
        await awardCommunityXp({
          userId: user.id,
          xp: rewardXp,
        });

        alert(`🎉 게시글 등록 완료! +${rewardXp} XP 획득`);
      } catch (error) {
        console.error(error);
        alert("게시글은 등록되었지만 XP 지급에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("게시글 등록 실패");
    }
  };

  const handleLikePost = async (post: CommunityPost) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const myLike = await getMyPostLike(post.id, user.id);
      const currentLikes = post.likes || 0;

      let nextLikes = currentLikes;

      if (myLike) {
        await deletePostLike(post.id, user.id);
        nextLikes = Math.max(currentLikes - 1, 0);
      } else {
        await createPostLike(post.id, user.id);
        nextLikes = currentLikes + 1;
      }

      const updatedPost = await updatePostLikes(post.id, nextLikes);

      setPosts((prev) =>
        prev.map((item) => (item.id === updatedPost.id ? updatedPost : item)),
      );

      try {
        await awardCommunityXp({
          userId: user.id,
          xp: 3,
        });
      } catch (error) {
        console.error(error);
      }

      if (selectedPost?.id === updatedPost.id) {
        setSelectedPost(updatedPost);
      }
    } catch (error) {
      console.error(error);
      alert("좋아요 처리 실패");
    }
  };

  const handleCreateComment = async () => {
    if (!selectedPost || !user) return;

    if (!commentContent.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    try {
      const newComment = await createComment({
        postId: selectedPost.id,
        userId: user.id,
        authorName: displayName,
        authorEmoji: displayEmoji,
        content: commentContent,
      });

      setComments((prev) => [...prev, newComment]);
      setCommentContent("");

      const updatedPost = await updatePostComments(
        selectedPost.id,
        (selectedPost.comments || 0) + 1,
      );

      setSelectedPost(updatedPost);

      setPosts((prev) =>
        prev.map((item) => (item.id === updatedPost.id ? updatedPost : item)),
      );
    } catch (error) {
      console.error(error);
      alert("댓글 등록 실패");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedPost) return;

    const confirmed = confirm("댓글을 삭제하시겠습니까?");
    if (!confirmed) return;

    try {
      await deleteComment(commentId);

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));

      const updatedPost = await updatePostComments(
        selectedPost.id,
        Math.max((selectedPost.comments || 0) - 1, 0),
      );

      setSelectedPost(updatedPost);

      setPosts((prev) =>
        prev.map((item) => (item.id === updatedPost.id ? updatedPost : item)),
      );
    } catch (error) {
      console.error(error);
      alert("댓글 삭제 실패");
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    const confirmed = confirm("게시글을 삭제하시겠습니까?");

    if (!confirmed) return;

    try {
      await deletePost(selectedPost.id);

      setPosts((prev) => prev.filter((post) => post.id !== selectedPost.id));

      setSelectedPost(null);

      alert("게시글이 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      alert("게시글 삭제 실패");
    }
  };

  const handleStartEditPost = () => {
    if (!selectedPost) return;

    setEditTitle(selectedPost.title);
    setEditContent(selectedPost.content || "");
    setIsEditingPost(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;

    if (!editTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!editContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      const updatedPost = await updatePost({
        postId: selectedPost.id,
        title: editTitle,
        content: editContent,
      });

      setSelectedPost(updatedPost);
      setIsEditingPost(false);

      setPosts((prev) =>
        prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)),
      );

      alert("게시글이 수정되었습니다.");
    } catch (error) {
      console.error(error);
      alert("게시글 수정 실패");
    }
  };

  const popularPosts = [...posts]
    .filter((post) => (post.likes || 0) > 0)
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 3);

  const filteredPosts = (
    selectedCategory === "전체"
      ? posts
      : posts.filter((post) => post.category === selectedCategory)
  )
    .filter((post) => {
      const keyword = searchKeyword.trim().toLowerCase();
      if (!keyword) return true;

      const searchableText = [
        post.title,
        post.content,
        post.exam_name,
        post.study_period,
        post.study_method,
        post.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    })
    .sort((a, b) => {
      if (sortType === "popular") {
        return (b.likes || 0) - (a.likes || 0);
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  const totalPostCount = posts.length;
  const passReviewCount = posts.filter(
    (post) => post.category === "합격후기",
  ).length;
  const questionCount = posts.filter(
    (post) => post.category === "질문답변",
  ).length;
  const popularPostCount = posts.filter((post) => (post.likes || 0) > 0).length;

  const displayName =
    profile?.nickname || user?.email?.split("@")[0] || "커리어스 유저";

  const displayEmoji = profile?.avatar_emoji || "🔥";
  const displayLevel = profile ? getLevelTitle(profile.level) : "😵 접수만 함";

  return (
    <main className="min-h-screen bg-[#F6F7F9] pb-32">
      <section className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">커뮤니티</h1>
          <p className="mt-2 text-sm text-gray-500">
            자격증 정보와 합격 노하우를 공유하세요
          </p>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                selectedCategory === category
                  ? category === "전체"
                    ? "bg-gray-900 text-white"
                    : getCategoryStyle(category)
                  : "bg-white text-gray-500"
              }`}
            >
              {category === "전체"
                ? "전체"
                : `${getCategoryIcon(category)} ${category}`}
            </button>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
            <p className="text-lg font-extrabold text-gray-900">
              {totalPostCount}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-gray-400">
              전체글
            </p>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-3 text-center shadow-sm">
            <p className="text-lg font-extrabold text-emerald-700">
              {passReviewCount}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-emerald-500">
              후기
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-3 text-center shadow-sm">
            <p className="text-lg font-extrabold text-blue-700">
              {questionCount}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-blue-500">질문</p>
          </div>

          <div className="rounded-2xl bg-orange-50 p-3 text-center shadow-sm">
            <p className="text-lg font-extrabold text-orange-700">
              {popularPostCount}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-orange-500">
              인기
            </p>
          </div>
        </div>

        {popularPosts.length > 0 && (
          <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-gray-900">
                🔥 인기글
              </h2>
              <span className="text-xs text-gray-400">좋아요 순</span>
            </div>

            <div className="space-y-2">
              {popularPosts.map((post, index) => (
                <button
                  key={post.id}
                  onClick={async () => {
                    setSelectedPost(post);

                    try {
                      const data = await getComments(post.id);
                      setComments(data);
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl bg-gray-50 px-3 py-3 text-left"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {post.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {getCategoryIcon(post.category)} {post.category} · ❤️{" "}
                      {post.likes || 0}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="mb-4 w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none"
        />

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setSortType("latest")}
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              sortType === "latest"
                ? "bg-violet-600 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            최신순
          </button>

          <button
            onClick={() => setSortType("popular")}
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              sortType === "popular"
                ? "bg-violet-600 text-white"
                : "bg-white text-gray-500"
            }`}
          >
            인기순
          </button>
        </div>

        <div className="space-y-3">
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              {searchKeyword
                ? "검색 결과가 없습니다."
                : "아직 게시글이 없습니다."}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                onClick={async () => {
                  setSelectedPost(post);

                  try {
                    const data = await getComments(post.id);
                    setComments(data);
                  } catch (error) {
                    console.error(error);
                  }
                }}
                className="cursor-pointer rounded-3xl bg-white p-5 shadow-sm active:scale-[0.99]"
              >
                <div className="mb-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryStyle(
                      post.category,
                    )}`}
                  >
                    {getCategoryIcon(post.category)} {post.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">
                  {post.title}
                </h3>

                {post.content && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {post.content}
                  </p>
                )}

                {(post.exam_name ||
                  post.study_period ||
                  post.attempt_count ||
                  post.study_method) && (
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
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

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-bold text-gray-800">
                      {post.author_emoji || "🔥"}{" "}
                      {post.author_name || "커리어스 유저"}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-violet-500">
                      {post.author_level || "😵 접수만 함"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikePost(post);
                      }}
                      className="font-semibold text-gray-400"
                    >
                      ❤️ {post.likes || 0}
                    </button>
                    <span>💬 {post.comments}</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {isWriteOpen && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 px-5">
            <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">글쓰기</h2>

                <button
                  onClick={() => setIsWriteOpen(false)}
                  className="text-sm font-bold text-gray-400"
                >
                  닫기
                </button>
              </div>

              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              >
                {categories
                  .filter((category) => category !== "전체")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>

              <input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                className="mb-3 w-full rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              />

              {(showExamName ||
                showStudyPeriod ||
                showAttemptCount ||
                showStudyMethod) && (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {showExamName && (
                    <input
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      placeholder="시험명"
                      className="rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
                    />
                  )}

                  {showStudyPeriod && (
                    <input
                      value={studyPeriod}
                      onChange={(e) => setStudyPeriod(e.target.value)}
                      placeholder="공부기간"
                      className="rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
                    />
                  )}

                  {showAttemptCount && (
                    <input
                      value={attemptCount}
                      onChange={(e) => setAttemptCount(e.target.value)}
                      placeholder="응시횟수"
                      inputMode="numeric"
                      className="rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
                    />
                  )}

                  {showStudyMethod && (
                    <input
                      value={studyMethod}
                      onChange={(e) => setStudyMethod(e.target.value)}
                      placeholder="학습방법"
                      className="rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
                    />
                  )}
                </div>
              )}

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="내용을 입력하세요"
                rows={5}
                className="mb-4 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
              />
              <button
                onClick={handleCreatePost}
                className="sticky bottom-0 mt-2 w-full rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white"
              >
                등록하기
              </button>
            </div>
          </div>
        )}

        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5">
            <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-600">
                  {selectedPost.category}
                </span>

                <div className="flex gap-2">
                  {selectedPost.user_id === user?.id && (
                    <>
                      {isEditingPost ? (
                        <button
                          onClick={handleUpdatePost}
                          className="text-sm font-bold text-green-600"
                        >
                          저장
                        </button>
                      ) : (
                        <button
                          onClick={handleStartEditPost}
                          className="text-sm font-bold text-violet-600"
                        >
                          수정
                        </button>
                      )}

                      <button
                        onClick={handleDeletePost}
                        className="text-sm font-bold text-red-500"
                      >
                        삭제
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setSelectedPost(null);
                      setIsEditingPost(false);
                    }}
                    className="text-sm font-bold text-gray-400"
                  >
                    닫기
                  </button>
                </div>
              </div>

              {isEditingPost ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-2xl bg-gray-50 px-4 py-3 text-lg font-bold outline-none"
                />
              ) : (
                <h2 className="text-xl font-extrabold text-gray-900">
                  {selectedPost.title}
                </h2>
              )}

              {(selectedPost.exam_name ||
                selectedPost.study_period ||
                selectedPost.attempt_count ||
                selectedPost.study_method) && (
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  {selectedPost.exam_name && (
                    <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                      시험명: {selectedPost.exam_name}
                    </div>
                  )}

                  {selectedPost.study_period && (
                    <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                      공부기간: {selectedPost.study_period}
                    </div>
                  )}

                  {selectedPost.attempt_count && (
                    <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                      응시횟수: {selectedPost.attempt_count}회
                    </div>
                  )}

                  {selectedPost.study_method && (
                    <div className="rounded-2xl bg-gray-50 px-3 py-2 text-gray-600">
                      학습방법: {selectedPost.study_method}
                    </div>
                  )}
                </div>
              )}

              {isEditingPost ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="mt-5 w-full resize-none rounded-2xl bg-gray-50 px-4 py-3 text-sm outline-none"
                />
              ) : (
                <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {selectedPost.content}
                </p>
              )}

              <div className="mt-6 border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  댓글 {comments.length}개
                </h3>

                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl bg-gray-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-800">
                          {comment.author_emoji} {comment.author_name}
                        </p>

                        {comment.user_id === user?.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-xs font-bold text-red-400"
                          >
                            삭제
                          </button>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-gray-600">
                        {comment.content}
                      </p>
                    </div>
                  ))}
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
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsWriteOpen(true)}
          className="mt-4 w-full rounded-2xl bg-violet-600 py-4 text-sm font-bold text-white"
        >
          ✍️ 글쓰기
        </button>
      </section>

      <BottomTabBar activeTab="community" />
    </main>
  );
}
