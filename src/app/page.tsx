"use client";

import { supabase } from "../lib/supabase";
import { useEffect, useState } from "react";

type Certificate = {
  id: string | number;
  title: string;
  issuer: string;
  holderName: string;
  issueDate: string;
  expiryDate: string;
  category: string;
  certificateNumber: string;
  imageUrl?: string;
};

const mockCertificates: Certificate[] = [
  {
    id: 1,
    title: "정보처리기사",
    issuer: "한국산업인력공단",
    holderName: "홍길동",
    issueDate: "2025-04-12",
    expiryDate: "",
    category: "국가자격증",
    certificateNumber: "",
  },
  {
    id: 2,
    title: "AI 창업교육 수료증",
    issuer: "울산창조경제혁신센터",
    holderName: "이누리",
    issueDate: "2026-05-01",
    expiryDate: "2027-05-01",
    category: "수료증",
    certificateNumber: "CERT-2026-001",
  },
];

const mockOcrResult = {
  title: "AI 창업교육 수료증",
  issuer: "울산창조경제혁신센터",
  holderName: "이누리",
  issueDate: "2026-05-01",
  expiryDate: "2027-05-01",
  certificateNumber: "CERT-2026-001",
  category: "수료증",
};

const categoryOptions = ["자격증", "수료증", "이수증", "상장", "민간자격", "기타"];

export default function Home() {
  const [screen, setScreen] =
    useState<"home" | "upload" | "result" | "detail">("home");
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [form, setForm] = useState(mockOcrResult);
  const [certificates, setCertificates] =
    useState<Certificate[]>(mockCertificates);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    issuer: "",
    holderName: "",
    issueDate: "",
    expiryDate: "",
    certificateNumber: "",
    category: "기타",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const loadCertificates = async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("불러오기 실패:", error);
      return;
    }

    const mappedData: Certificate[] = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      issuer: item.issuer || "",
      holderName: item.holder_name || "",
      issueDate: item.issue_date || "",
      expiryDate: item.expiry_date || "",
      category: item.category || "기타",
      certificateNumber: item.certificate_number || "",
      imageUrl: item.image_url || "",
    }));

    setCertificates(mappedData);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleFile = (file: File | undefined) => {
    if (!file) return;

    setSelectedFile(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석 실패");
      }

      setForm({
        title: data.title || "",
        issuer: data.issuer || "",
        holderName: data.holderName || "",
        issueDate: data.issueDate || "",
        expiryDate: data.expiryDate || "",
        certificateNumber: data.certificateNumber || "",
        category: data.category || "기타",
      });

      setScreen("result");
    } catch (error) {
      alert("AI 분석에 실패했습니다. 다시 시도해주세요.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    let imageUrl = "";

    if (selectedFile) {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `certificates/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("certificate-images")
        .upload(filePath, selectedFile);

      if (uploadError) {
        alert(`이미지 업로드 실패: ${uploadError.message}`);
        console.error(uploadError);
        return;
      }

      const { data } = supabase.storage
        .from("certificate-images")
        .getPublicUrl(filePath);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("certificates").insert({
      certificate_number: form.certificateNumber,
      title: form.title,
      issuer: form.issuer,
      holder_name: form.holderName,
      issue_date: form.issueDate || null,
      expiry_date: form.expiryDate || null,
      category: form.category || "기타",
      image_url: imageUrl,
    });

    if (error) {
      alert(`저장에 실패했습니다: ${error.message}`);
      console.error(error);
      return;
    }

    await loadCertificates();
    setPreview(null);
    setImageBase64(null);
    setSelectedFile(null);
    setScreen("home");
  };

  const handleDelete = async () => {
    if (!selectedCertificate) return;

    const isConfirmed = window.confirm("이 인증서를 삭제할까요?");
    if (!isConfirmed) return;

    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", selectedCertificate.id);

    if (error) {
      alert(`삭제에 실패했습니다: ${error.message}`);
      console.error(error);
      return;
    }

    setSelectedCertificate(null);
    await loadCertificates();
    setScreen("home");
  };

  const handleStartEdit = () => {
    if (!selectedCertificate) return;

    setEditForm({
      title: selectedCertificate.title,
      issuer: selectedCertificate.issuer,
      holderName: selectedCertificate.holderName,
      issueDate: selectedCertificate.issueDate,
      expiryDate: selectedCertificate.expiryDate,
      certificateNumber: selectedCertificate.certificateNumber,
      category: selectedCertificate.category || "기타",
    });

    setIsEditing(true);
  };

 const handleUpdate = async () => {
  if (!selectedCertificate) return;

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
    })
    .eq("id", selectedCertificate.id);

  if (error) {
    alert(`수정에 실패했습니다: ${error.message}`);
    console.error(error);
    return;
  }

  setSelectedCertificate({
    ...selectedCertificate,
    ...editForm,
    category: editForm.category || "기타",
  });

  alert("수정이 완료되었습니다.");

  setIsEditing(false);

  await loadCertificates();
};

  const getExpiryText = (expiryDate: string) => {
    if (!expiryDate) return "만료 없음";

    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "만료됨";
    return `D-${diffDays}`;
  };

  const categories = ["전체", ...categoryOptions];

  const filteredCertificates = certificates.filter((cert) => {
    const keyword = searchTerm.toLowerCase();

    const matchesSearch =
      cert.title.toLowerCase().includes(keyword) ||
      cert.issuer.toLowerCase().includes(keyword) ||
      cert.holderName.toLowerCase().includes(keyword) ||
      cert.certificateNumber.toLowerCase().includes(keyword);

    const matchesCategory =
      selectedCategory === "전체" || cert.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 text-gray-900">
      <section className="mx-auto max-w-md">
        {screen === "home" && (
          <>
            <header className="mb-6">
              <div>
                <p className="text-sm text-gray-500">CertBox</p>
                <h1 className="mt-1 text-center text-2xl font-bold tracking-tight">
                  내 자격증을 한곳에
                </h1>
              </div>

              <div className="mt-4">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="자격증명, 기관, 이름, 번호 검색"
                  className="w-full rounded-3xl bg-white px-5 py-4 text-base shadow-sm outline-none placeholder:text-gray-400"
                />
              </div>
            </header>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedCategory === category
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 shadow-sm"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <section className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">보관 중</p>
                <p className="mt-2 text-3xl font-bold">
                  {certificates.length}
                </p>
                <p className="mt-1 text-xs text-gray-400">개의 인증서</p>
              </div>

              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">만료 예정</p>
                <p className="mt-2 text-3xl font-bold">
                  {
                    certificates.filter(
                      (cert) =>
                        cert.expiryDate &&
                        getExpiryText(cert.expiryDate) !== "만료됨"
                    ).length
                  }
                </p>
                <p className="mt-1 text-xs text-gray-400">건 확인 필요</p>
              </div>
            </section>

            <button
              onClick={() => setScreen("upload")}
              className="mb-6 w-full rounded-3xl bg-gray-900 py-4 text-base font-bold text-white shadow-md"
            >
              + 자격증 / 수료증 추가하기
            </button>

            <section>
              <h2 className="mb-3 text-lg font-bold">내 보관함</h2>

              <div className="space-y-3">
                {filteredCertificates.length === 0 && (
                  <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
                    검색 결과가 없습니다.
                  </div>
                )}

                {filteredCertificates.map((cert) => (
                  <article
                    key={cert.id}
                    onClick={() => {
                      setSelectedCertificate(cert);
                      setIsEditing(false);
                      setScreen("detail");
                    }}
                    className="cursor-pointer rounded-3xl bg-white p-5 shadow-sm transition active:scale-[0.99]"
                  >
                    {cert.imageUrl && (
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="mb-4 h-32 w-full rounded-2xl bg-gray-100 object-cover"
                      />
                    )}

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                      {cert.category || "기타"}
                    </span>

                    <h3 className="mt-3 text-lg font-bold">{cert.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{cert.issuer}</p>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500">
                        발급일 {cert.issueDate}
                      </p>
                      <p className="text-sm font-bold">
                        {getExpiryText(cert.expiryDate)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {screen === "upload" && (
          <section>
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">CertBox</p>
                <h1 className="mt-1 text-2xl font-bold">인증서 업로드</h1>
              </div>

              <button
                onClick={() => {
                  setScreen("home");
                  setPreview(null);
                  setImageBase64(null);
                  setSelectedFile(null);
                }}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
              >
                닫기
              </button>
            </header>

            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              className={`flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed bg-white p-6 text-center shadow-sm transition ${
                isDragging ? "border-gray-900 bg-gray-50" : "border-gray-200"
              }`}
            >
              <input
  type="file"
  accept="image/*"
  capture="environment"
  className="hidden"
  onChange={(e) => handleFile(e.target.files?.[0])}
/>

              {preview ? (
                <div className="w-full">
                  <img
                    src={preview}
                    alt="업로드 미리보기"
                    className="mx-auto max-h-[320px] w-full rounded-3xl object-contain"
                  />
                  <p className="mt-4 text-sm font-medium text-gray-500">
                    이미지를 다시 선택하려면 여기를 눌러주세요
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-100 text-3xl">
                    +
                  </div>
                  <h2 className="text-xl font-bold">
                    자격증 또는 수료증을 올려주세요
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-gray-500">
                    이미지를 선택하거나 이 영역에 끌어다 놓으면
                    <br />
                    AI가 내용을 분석할 준비를 합니다.
                  </p>
                </>
              )}
            </label>

            <button
              onClick={handleAnalyze}
              disabled={!preview || isAnalyzing}
              className={`mt-6 w-full rounded-3xl py-4 text-base font-bold shadow-md transition ${
                preview && !isAnalyzing
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {isAnalyzing ? "AI가 분석 중입니다..." : "AI로 분석하기"}
            </button>
          </section>
        )}

        {screen === "result" && (
          <section>
            <header className="mb-6">
              <p className="text-sm text-gray-500">CertBox</p>
              <h1 className="mt-1 text-2xl font-bold">분석 결과 확인</h1>
              <p className="mt-2 text-sm text-gray-500">
                AI가 추출한 정보를 확인하고 필요한 부분을 수정해주세요.
              </p>
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
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  발급기관
                </label>
                <input
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  이름
                </label>
                <input
                  value={form.holderName}
                  onChange={(e) =>
                    setForm({ ...form, holderName: e.target.value })
                  }
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">
                  수료번호 / 상장번호
                </label>
                <input
                  value={form.certificateNumber}
                  onChange={(e) =>
                    setForm({ ...form, certificateNumber: e.target.value })
                  }
                  placeholder="예: 제2026-001호"
                  className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="mt-6 w-full rounded-3xl bg-gray-900 py-4 text-base font-bold text-white shadow-md"
            >
              저장하기
            </button>

            <button
              onClick={() => setScreen("upload")}
              className="mt-3 w-full rounded-3xl bg-white py-4 text-base font-bold text-gray-700 shadow-sm"
            >
              다시 업로드하기
            </button>
          </section>
        )}

        {screen === "detail" && selectedCertificate && (
          <section>
            <header className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">CertBox</p>
                <h1 className="mt-1 text-2xl font-bold">인증서 상세보기</h1>
              </div>

              <button
                onClick={() => {
                  setIsEditing(false);
                  setScreen("home");
                }}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
              >
                닫기
              </button>
            </header>

            {selectedCertificate.imageUrl && (
              <img
                src={selectedCertificate.imageUrl}
                alt={selectedCertificate.title}
                className="mb-5 w-full rounded-3xl bg-white object-cover shadow-sm"
              />
            )}

            {!isEditing ? (
              <>
                <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
                  <div>
                    <p className="text-sm text-gray-500">문서유형</p>
                    <p className="mt-1 font-medium">
                      {selectedCertificate.category || "기타"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">자격증명</p>
                    <p className="mt-1 text-lg font-bold">
                      {selectedCertificate.title}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">발급기관</p>
                    <p className="mt-1 font-medium">
                      {selectedCertificate.issuer}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">이름</p>
                    <p className="mt-1 font-medium">
                      {selectedCertificate.holderName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">발급일</p>
                    <p className="mt-1 font-medium">
                      {selectedCertificate.issueDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">만료일</p>
                    <p className="mt-1 font-medium">
                      {selectedCertificate.expiryDate || "만료 없음"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      수료번호 / 상장번호
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedCertificate.certificateNumber || "-"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleStartEdit}
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
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    수료번호 / 상장번호
                  </label>
                  <input
                    value={editForm.certificateNumber}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        certificateNumber: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-2xl bg-gray-50 px-4 py-3 text-base font-medium outline-none"
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
        )}
      </section>
    </main>
  );
}