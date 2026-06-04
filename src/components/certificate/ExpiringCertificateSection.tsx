import type { Certificate } from "../../types/certificate";

type Props = {
  certificates: Certificate[];
  getExpiryText: (expiryDate: string) => string;
};

export default function ExpiringCertificateSection({
  certificates,
  getExpiryText,
}: Props) {
  if (certificates.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-bold">⚠ 곧 만료돼요</h2>

      <div className="space-y-3">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="rounded-3xl border border-orange-200 bg-orange-50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{cert.title}</p>
                <p className="text-sm text-gray-500">{cert.expiryDate}</p>
              </div>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">
                {getExpiryText(cert.expiryDate)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}