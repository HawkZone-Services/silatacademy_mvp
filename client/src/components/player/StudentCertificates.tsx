import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Award } from "lucide-react";
import studentCertificateService from "@/services/studentCertificateService";

export default function StudentCertificates() {
  const [loading, setLoading] = useState(true);
  const [certs, setCerts] = useState([]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const res = await studentCertificateService.getMyCertificates();
      const data = await res.json();
      setCerts(data.certificates || []);
    } catch (err) {
      console.error("Certificates Fetch Error:", err);
      setCerts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const downloadCert = (c) => {
    if (!c.exam?._id || !c.student) return;
    window.open(
      `/api/v1/certificates/pdf/${c.exam._id}/${c.student}`,
      "_blank"
    );
  };

  if (loading) return <p>Loading certificates...</p>;

  // Grouping
  const grouped = certs.reduce((acc, c) => {
    acc[c.type] = acc[c.type] || [];
    acc[c.type].push(c);
    return acc;
  }, {});

  const typeTitle = {
    exam: "Exam Certificates",
    lesson: "Lesson Certificates",
    module: "Module Certificates",
    program: "Program Certificates",
    performance: "Performance Certificates",
    custom: "Manually Issued Certificates",
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <Award className="h-12 w-12 mx-auto text-secondary" />
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">
          All certificates you earned in training, lessons, programs, and exams.
        </p>
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-center text-muted-foreground">
          No certificates earned yet.
        </p>
      )}

      {/* Certificate Groups */}
      {Object.keys(grouped).map((type) => (
        <Card key={type} className="border border-border/40">
          <CardHeader>
            <CardTitle>{typeTitle[type] || type}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {grouped[type].map((cert) => (
              <div
                key={cert._id}
                className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-border/30"
              >
                <div>
                  <h3 className="font-semibold">{cert.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cert.description}
                  </p>
                  <Badge className="mt-2 capitalize">{cert.type}</Badge>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadCert(cert)}
                >
                  <Download className="h-4 w-4 mr-2" /> PDF
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
