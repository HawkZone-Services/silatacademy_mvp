import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, Award, PlusCircle } from "lucide-react";

import certificateService from "@/services/certificateService";
import playerService from "@/services/playerService";

export default function CertificateCenter() {
  const [loading, setLoading] = useState(true);

  const [certificates, setCertificates] = useState([]);
  const [players, setPlayers] = useState([]);

  const [manualData, setManualData] = useState({
    userId: "",
    title: "",
    description: "",
    type: "custom",
  });

  // =========================================
  // FETCH ALL CERTIFICATES + PLAYERS
  // =========================================
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [certRes, playersRes] = await Promise.all([
        certificateService.listAdmin(),
        playerService.getAllPlayers(),
      ]);

      // --- certificates ---
      const certList = Array.isArray(certRes?.data?.certificates)
        ? certRes.data.certificates
        : Array.isArray(certRes?.data)
        ? certRes.data
        : [];
      setCertificates(certList);

      // --- players: ensure Array ---
      const playersPayload =
        playersRes?.data?.players ||
        playersRes?.data ||
        playersRes?.players ||
        playersRes;
      const playersArray = Array.isArray(playersPayload)
        ? playersPayload
        : [];

      setPlayers(playersArray);
    } catch (err) {
      console.error("CertificateCenter fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // =========================================
  // ISSUE MANUAL CERTIFICATE
  // =========================================
  const issueManual = async () => {
    if (!manualData.userId) return alert("Select a student");
    if (!manualData.title) return alert("Enter certificate title");

    const res = await certificateService.create({
      userId: manualData.userId,
      title: manualData.title,
      description: manualData.description,
      type: manualData.type,
    });

    if (!res.success) {
      alert(res.error?.message || res.message || "Failed to issue certificate");
      return;
    }

    setManualData({ userId: "", title: "", description: "", type: "custom" });
    fetchAll();
  };

  // =========================================
  // DOWNLOAD CERTIFICATE PDF
  // =========================================
  const downloadCert = async (cert) => {
    if (!cert.exam || !cert.student) {
      alert("This certificate is missing exam/student references");
      return;
    }

    window.open(`/certificates/pdf/${cert.exam}/${cert.student}`, "_blank");
  };

  return (
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Award className="h-7 w-7 text-secondary" />
        Certificate Center (Admin)
      </h1>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="manual">Manual Issue</TabsTrigger>
        </TabsList>

        {/* =========================================
            TAB: ALL CERTIFICATES
        ========================================== */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Issued Certificates</CardTitle>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p>Loading certificates...</p>
              ) : certificates.length === 0 ? (
                <p className="text-muted-foreground">No certificates found.</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {certificates.map((cert) => (
                    <div
                      key={cert._id}
                      className="p-4 bg-accent/10 rounded-lg border border-border/40 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.description}
                        </p>
                        <Badge className="mt-2 capitalize">
                          {cert.type || "custom"}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadCert(cert)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* =========================================
            TAB: MANUAL ISSUE
        ========================================== */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Issue Manual Certificate</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <select
                className="w-full p-2 border rounded"
                value={manualData.userId}
                onChange={(e) =>
                  setManualData({ ...manualData, userId: e.target.value })
                }
              >
                <option value="">Select Student</option>
                {players.map((p) => (
                  <option key={p._id} value={p.user?._id || p._id}>
                    {p.name || p.user?.name} — {p.user?.email}
                  </option>
                ))}
              </select>

              <Input
                placeholder="Certificate Title"
                value={manualData.title}
                onChange={(e) =>
                  setManualData({ ...manualData, title: e.target.value })
                }
              />

              <Input
                placeholder="Description (optional)"
                value={manualData.description}
                onChange={(e) =>
                  setManualData({
                    ...manualData,
                    description: e.target.value,
                  })
                }
              />

              <Button className="w-full" onClick={issueManual}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Issue Certificate
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
