import type { Certificate } from "../../types/certificate";

type CertificateCardProps = {
  cert: Certificate;
  getExpiryText: (expiryDate: string) => string;
};

export default function CertificateCard({
  cert,
  getExpiryText,
}: CertificateCardProps) {
  return (
    <article
      onClick={() => {
        window.location.href = `/certificates/${cert.id}`;
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

      {(cert.score || cert.grade) && (
        <p className="mt-2 text-sm font-bold text-gray-900">
          {[cert.score, cert.grade].filter(Boolean).join(" / ")}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <p className="text-sm text-gray-500">
          발급일 {cert.issueDate}
        </p>
        <p className="text-sm font-bold">
          {getExpiryText(cert.expiryDate)}
        </p>
      </div>
    </article>
  );
}