import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Award, PlusCircle } from "lucide-react";

import certificateService from "@/services/certificateService";
import playerService from "@/services/playerService";

// === Dialogs ===
import IssueLessonDialog from "./IssueLessonDialog";
import IssueModuleDialog from "./IssueModuleDialog";
import IssueProgramDialog from "./IssueProgramDialog";
import IssueManualDialog from "./IssueManualDialog";
import IssuePerformanceDialog from "./IssuePerformanceDialog";
import IssueExamOverrideDialog from "./IssueExamOverrideDialog";

export default function CertificateCenterUnified() {
  /* ================================================================
      STATE
  ================================================================= */
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [players, setPlayers] = useState([]);

  // Dialogs
  const [openLesson, setOpenLesson] = useState(false);
  const [openModule, setOpenModule] = useState(false);
  const [openProgram, setOpenProgram] = useState(false);
  const [openManual, setOpenManual] = useState(false);
  const [openPerformance, setOpenPerformance] = useState(false);
  const [openExamOverride, setOpenExamOverride] = useState(false);

  /* ================================================================
      FETCH ALL CERTIFICATES + PLAYERS
  ================================================================= */
  const fetchAll = async () => {
    setLoading(true);

    try {
      const [certRes, playersRes] = await Promise.all([
        certificateService.listAdmin(),
        playerService.getAllPlayers(),
      ]);

      // certificates
      const certList =
        certRes?.data?.data?.certificates ||
        certRes?.data?.certificates ||
        certRes?.data ||
        [];

      setCertificates(Array.isArray(certList) ? certList : []);

      // players
      const playersList =
        playersRes?.data?.players ||
        playersRes?.data?.data?.players ||
        playersRes?.data ||
        [];

      setPlayers(Array.isArray(playersList) ? playersList : []);
    } catch (err) {
      console.error("Unified CertificateCenter fetch error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================================================================
      DOWNLOAD PDF
  ================================================================= */
  const downloadCert = (cert) => {
    if (!cert.examId || !cert.user) {
      alert("Missing exam or user reference");
      return;
    }

    window.open(
      certificateService.downloadPdf(cert.examId, cert.user._id),
      "_blank"
    );
  };

  /* ================================================================
      UI
  ================================================================= */
  return (
    <div className="min-h-screen p-8 bg-background">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Award className="h-7 w-7 text-secondary" />
        Certificate Center (Unified)
      </h1>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="issue">Issue Certificates</TabsTrigger>
        </TabsList>

        {/* ============================================================
            TAB: ALL CERTIFICATES
        ============================================================ */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
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
                      className="p-4 bg-accent/10 rounded-lg border flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.description}
                        </p>

                        <Badge className="mt-2 capitalize">
                          {cert.type || "custom"}
                        </Badge>

                        {cert.user && (
                          <p className="text-xs mt-1 text-muted-foreground">
                            Student: {cert.user.name} — {cert.user.email}
                          </p>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCert(cert)}
                      >
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================
            TAB: ISSUE CERTIFICATES
        ============================================================ */}
        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Issue Certificates</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Select a certificate type to issue:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => setOpenLesson(true)}>
                  Lesson Certificate
                </Button>

                <Button onClick={() => setOpenModule(true)}>
                  Module Certificate
                </Button>

                <Button onClick={() => setOpenProgram(true)}>
                  Program Certificate
                </Button>

                <Button onClick={() => setOpenPerformance(true)}>
                  Performance Certificate
                </Button>

                <Button onClick={() => setOpenManual(true)}>
                  Manual Certificate
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setOpenExamOverride(true)}
                >
                  Exam Override
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ============================================================
          DIALOGS
      ============================================================ */}
      <IssueLessonDialog
        open={openLesson}
        setOpen={setOpenLesson}
        onIssued={fetchAll}
      />
      <IssueModuleDialog
        open={openModule}
        setOpen={setOpenModule}
        onIssued={fetchAll}
      />
      <IssueProgramDialog
        open={openProgram}
        setOpen={setOpenProgram}
        onIssued={fetchAll}
      />
      <IssueManualDialog
        open={openManual}
        setOpen={setOpenManual}
        onIssued={fetchAll}
      />
      <IssuePerformanceDialog
        open={openPerformance}
        setOpen={setOpenPerformance}
        onIssued={fetchAll}
      />
      <IssueExamOverrideDialog
        open={openExamOverride}
        setOpen={setOpenExamOverride}
        onIssued={fetchAll}
      />
    </div>
  );
}
