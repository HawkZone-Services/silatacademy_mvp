// src/features/student/dashboard/components/CertificatesTab.tsx

import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { TabsContent } from "@/shared/ui/tabs";
import { CertificateItem } from "../types";

interface Props {
  certificates: CertificateItem[];
}

export default function CertificatesTab({ certificates }: Props) {
  const navigate = useNavigate();

  return (
    <TabsContent value="certificates" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
          <CardDescription>
            Official certificates for completed exams, programs, and special
            achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
          {certificates.length === 0 && (
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any certificates yet.
            </p>
          )}

          {certificates.map((cert) => (
            <div
              key={cert._id}
              className="p-3 rounded-lg border border-border/50 bg-accent/10 flex items-center justify-between"
            >
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {cert.title || "Certificate"}
                  {cert.type && (
                    <Badge variant="outline" className="text-xs">
                      {cert.type}
                    </Badge>
                  )}
                  {cert.beltLevel && (
                    <Badge variant="outline" className="capitalize text-xs">
                      {cert.beltLevel}
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued at:{" "}
                  {cert.issuedAt
                    ? new Date(cert.issuedAt).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/certificate/${cert._id}`)}
              >
                View / Download
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
