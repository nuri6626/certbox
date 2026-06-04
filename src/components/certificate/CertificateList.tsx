import type { Certificate } from "../../types/certificate";
import CertificateCard from "./CertificateCard";

type Props = {
  certificates: Certificate[];
  getExpiryText: (expiryDate: string) => string;
};

export default function CertificateList({
  certificates,
  getExpiryText,
}: Props) {
  if (certificates.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
        검색 결과가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {certificates.map((cert) => (
        <CertificateCard
          key={cert.id}
          cert={cert}
          getExpiryText={getExpiryText}
        />
      ))}
    </div>
  );
}