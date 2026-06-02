"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function CertificateDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      setLoading(false);
    };

    if (id) {
      loadCertificate();
    }
  }, [id]);

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
    <main className="min-h-screen bg-[#F6F7F9] px-5 py-6">
      <section className="mx-auto max-w-md">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">커리어스</p>
            <h1 className="mt-1 text-2xl font-bold">
              인증서 상세보기
            </h1>
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

        <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">문서유형</p>
            <p className="mt-1 font-medium">
              {certificate.category || "기타"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">자격증명</p>
            <p className="mt-1 text-lg font-bold">
              {certificate.title}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">발급기관</p>
            <p className="mt-1 font-medium">
              {certificate.issuer}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">이름</p>
            <p className="mt-1 font-medium">
              {certificate.holder_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">발급일</p>
            <p className="mt-1 font-medium">
              {certificate.issue_date}
            </p>
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
              <p className="mt-1 font-medium">
                {certificate.score}
              </p>
            </div>
          )}

          {certificate.grade && (
            <div>
              <p className="text-sm text-gray-500">등급</p>
              <p className="mt-1 font-medium">
                {certificate.grade}
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}