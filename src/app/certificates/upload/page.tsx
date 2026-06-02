"use client";

import { useState } from "react";
import Link from "next/link";

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

      sessionStorage.setItem(
        "certificate_analysis",
        JSON.stringify({
          ...data,
          imageBase64,
          fileName: selectedFile?.name || "",
        })
      );

      window.location.href = "/certificates/result";
    } catch (error) {
      alert("AI 분석에 실패했습니다. 다시 시도해주세요.");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6 text-gray-900">
      <section className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-2xl font-bold">인증서 업로드</h1>
          </div>

          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm"
          >
            닫기
          </Link>
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
            id="camera-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          <input
            id="gallery-upload"
            type="file"
            accept="image/*"
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

              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <label
                  htmlFor="camera-upload"
                  className="rounded-2xl bg-gray-900 px-4 py-3 text-sm font-bold text-white"
                >
                  카메라로 촬영
                </label>

                <label
                  htmlFor="gallery-upload"
                  className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
                >
                  사진첩에서 선택
                </label>
              </div>
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
    </main>
  );
}