"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

const categoryOptions = [
  "자격증",
  "수료증",
  "이수증",
  "상장",
  "어학성적",
  "민간자격",
  "기타",
];

export default function CertificateDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    issuer: "",
    holderName: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
    category: "기타",
    score: "",
    grade: "",
  });

  const loadCertificate = async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    setCertificate(data);

    setEditForm({
      title: data.title || "",
      issuer: data.issuer || "",
      holderName: data.holder_name || "",
      issueDate: data.issue_date || "",
      expiryDate: data.expiry_date || "",
      certificateNumber: data.certificate_number || "",
      category: data.category || "기타",
      score: data.score || "",
      grade: data.grade || "",
    });

    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const handleUpdate = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const { error } = await supabase
      .from("certificates")
      .update({
        title: editForm.title,
        issuer: editForm.issuer,
        holder_name: editForm.holderName,
        issue_date: editForm.issueDate || null,
        expiry_date: editForm.expiryDate || null,
        certificate_number: editForm.certificateNumber,
        category: editForm.category || "기타",
        score: editForm.score || "",
        grade: editForm.grade || "",
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert(`수정 실패: ${error.message}`);
      return;
    }

    alert("수정이 완료되었습니다.");
    setIsEditing(false);
    await loadCertificate();
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("이 인증서를 삭제할까요?");
    if (!isConfirmed) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert(`삭제 실패: ${error.message}`);
      return;
    }

    alert("삭제되었습니다.");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] p-6">
        <p>불러오는 중...</p>
      </main>
    );
  }

  if (!certificate) {
    return (
      <main className="min-h-screen bg-[#F6F7F9] p-6">
        <p>인증서를 찾을 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 text-gray-900">
      <section className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-2xl font-bold">인증서 상세보기</h1>
          </div>

          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
          >
            홈으로
          </Link>
        </header>

        {certificate.image_url && (
          <img
            src={certificate.image_url}
            alt={certificate.title}
            className="mb-5 w-full rounded-3xl bg-white object-cover shadow-sm"
          />
        )}

        {!isEditing ? (
          <>
            <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
              <div>
                <p className="text-sm text-gray-500">문서유형</p>
                <p className="mt-1 font-medium">
                  {certificate.category || "기타"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">자격증명</p>
                <p className="mt-1 text-lg font-bold">{certificate.title}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">발급기관</p>
                <p className="mt-1 font-medium">{certificate.issuer}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">이름</p>
                <p className="mt-1 font-medium">{certificate.holder_name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">발급일</p>
                <p className="mt-1 font-medium">{certificate.issue_date}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">만료일</p>
                <p className="mt-1 font-medium">
                  {certificate.expiry_date || "만료 없음"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">발급번호</p>
                <p className="mt-1 font-medium">
                  {certificate.certificate_number || "-"}
                </p>
              </div>

              {certificate.score && (
                <div>
                  <p className="text-sm text-gray-500">점수</p>
                  <p className="mt-1 font-medium">{certificate.score}</p>
                </div>
              )}

              {certificate.grade && (
                <div>
                  <p className="text-sm text-gray-500">등급</p>
                  <p className="mt-1 font-medium">{certificate.grade}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full rounded-3xl bg-gray-900 py-4 text-base font-bold text-white shadow-md"
            >
              수정하기
            </button>

            <button
              onClick={handleDelete}
              className="mt-3 w-full rounded-3xl bg-red-500 py-4 text-base font-bold text-white shadow-md"
            >
              삭제하기
            </button>
          </>
        ) : (
          <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
            <div>
              <label className="text-sm font-semibold text-gray-600">
                문서유형
              </label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                자격증명
              </label>
              <input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                발급기관
              </label>
              <input
                value={editForm.issuer}
                onChange={(e) =>
                  setEditForm({ ...editForm, issuer: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                이름
              </label>
              <input
                value={editForm.holderName}
                onChange={(e) =>
                  setEditForm({ ...editForm, holderName: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                발급일
              </label>
              <input
                type="date"
                value={editForm.issueDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, issueDate: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                만료일
              </label>
              <input
                type="date"
                value={editForm.expiryDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, expiryDate: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                발급번호
              </label>
              <input
                value={editForm.certificateNumber}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    certificateNumber: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                점수
              </label>
              <input
                value={editForm.score}
                onChange={(e) =>
                  setEditForm({ ...editForm, score: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                등급
              </label>
              <input
                value={editForm.grade}
                onChange={(e) =>
                  setEditForm({ ...editForm, grade: e.target.value })
                }
                className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
              />
            </div>

            <button
              onClick={handleUpdate}
              className="w-full rounded-3xl bg-gray-900 py-4 text-base font-bold text-white shadow-md"
            >
              수정 저장하기
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="w-full rounded-3xl bg-gray-100 py-4 text-base font-bold text-gray-700"
            >
              취소
            </button>
          </div>
        )}
      </section>
    </main>
  );
}