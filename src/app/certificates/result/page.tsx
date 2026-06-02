"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function ResultPage() {
  const [form, setForm] = useState({
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

  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    const saved = sessionStorage.getItem("certificate_analysis");
    if (!saved) return;

    const data = JSON.parse(saved);

    setPreview(data.imageBase64 || "");
    setForm({
      title: data.title || "",
      issuer: data.issuer || "",
      holderName: data.holderName || "",
      issueDate: data.issueDate || "",
      expiryDate: data.expiryDate || "",
      certificateNumber: data.certificateNumber || "",
      category: data.category || "기타",
      score: data.score || "",
      grade: data.grade || "",
    });
  }, []);

  const handleSave = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user;

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const saved = sessionStorage.getItem("certificate_analysis");
    const analysisData = saved ? JSON.parse(saved) : null;

    let imageUrl = "";

    if (analysisData?.imageBase64) {
      const fileName = `${Date.now()}.png`;
      const filePath = `${user.id}/certificates/${fileName}`;

      const base64Data = analysisData.imageBase64.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: "image/png" });

      const { error: uploadError } = await supabase.storage
        .from("certificate-images")
        .upload(filePath, fileBlob);

      if (uploadError) {
        alert(`이미지 업로드 실패: ${uploadError.message}`);
        return;
      }

      const { data } = supabase.storage
        .from("certificate-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("certificates").insert({
      user_id: user.id,
      title: form.title,
      issuer: form.issuer,
      holder_name: form.holderName,
      issue_date: form.issueDate || null,
      expiry_date: form.expiryDate || null,
      certificate_number: form.certificateNumber,
      category: form.category || "기타",
      score: form.score || "",
      grade: form.grade || "",
      image_url: imageUrl,
      extra_data: {},
    });

    if (error) {
      alert(`저장 실패: ${error.message}`);
      return;
    }

    sessionStorage.removeItem("certificate_analysis");
    alert("저장되었습니다.");
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 text-gray-900">
      <section className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-2xl font-bold">분석 결과 확인</h1>
          </div>

          <Link
            href="/certificates/upload"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
          >
            뒤로
          </Link>
        </header>

        {preview && (
          <img
            src={preview}
            alt="분석 이미지"
            className="mb-5 max-h-56 w-full rounded-3xl bg-white object-contain p-3 shadow-sm"
          />
        )}

        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <div>
            <label className="text-sm font-semibold text-gray-600">
              문서유형
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
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
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">
              발급기관
            </label>
            <input
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">이름</label>
            <input
              value={form.holderName}
              onChange={(e) =>
                setForm({ ...form, holderName: e.target.value })
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
              value={form.issueDate}
              onChange={(e) =>
                setForm({ ...form, issueDate: e.target.value })
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
              value={form.expiryDate}
              onChange={(e) =>
                setForm({ ...form, expiryDate: e.target.value })
              }
              className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">
              발급번호
            </label>
            <input
              value={form.certificateNumber}
              onChange={(e) =>
                setForm({ ...form, certificateNumber: e.target.value })
              }
              className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">점수</label>
            <input
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-600">등급</label>
            <input
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 w-full rounded-3xl bg-gray-900 py-4 text-base font-bold text-white"
        >
          저장하기
        </button>
      </section>
    </main>
  );
}