import { useQuery } from "@tanstack/react-query";
import certificateService from "@/features/certificates/api/certificateService";
import { CertificateCard } from "../components/CertificateCard";

export default function MyCertificatesPage() {
  const { data, isLoading } = useQuery(["my-certificates"], () =>
    certificateService.myCertificates()
  );
  const certs = data?.data?.certificates || data?.certificates || data?.data || [];

  if (isLoading) return <div className="p-6">Loading certificates...</div>;

  return (
    <div className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">My Certificates</h1>
      {!certs.length ? (
        <p className="text-sm text-muted-foreground">No certificates yet.</p>
      ) : (
        <div className="grid gap-3">
          {certs.map((c: any) => (
            <CertificateCard key={c._id} certificate={c} />
          ))}
        </div>
      )}
    </div>
  );
}
