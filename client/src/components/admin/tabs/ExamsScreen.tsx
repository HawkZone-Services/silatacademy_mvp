// ======= FULLY FIXED ExamScreen.jsx (Option 3) =======

import React, { useEffect, useState } from "react";
import { CreateExamDialog } from "../test/CreateExamDialog";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RegistrationList } from "../test/RegistrationList";
import { SubmissionsList } from "../test/SubmissionsList";
import { PracticalScoreDialog } from "../test/PracticalScoreDialog";
import { FinalizeResultButton } from "../test/FinalizeResultButton";
import { CertificateGenerator } from "../test/CertificateGenerator";

import examService from "@/services/examService";
import { API_BASE_URL } from "@/lib/apiClient";

const ExamScreen = ({ token }) => {
  const [exams, setExams] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [openExamId, setOpenExamId] = useState("");

  /* =========================
        FETCHERS
  ========================= */

  const fetchExams = async () => {
    const res = await examService.getAllExams();
    setExams(res?.data?.exams || []);
  };

  const fetchRegistrations = async (examId) => {
    if (!examId) return;
    const res = await examService.getAdminRegistrations(examId);
    setRegistrations(res?.data?.registrations || []);
  };

  const fetchSubmissions = async (examId) => {
    if (!examId) return;
    const res = await examService.getAdminSubmissions(examId);
    setSubmissions(res?.data?.submissions || []);
  };

  /* =========================
        ACTIONS
  ========================= */

  const approveFn = async (id) => {
    await examService.approveRegistration(id);
    fetchRegistrations(selectedExam);
  };

  const rejectFn = async (id) => {
    await examService.rejectRegistration(id);
    fetchRegistrations(selectedExam);
  };

  const publishExamAdmin = async (id) => {
    await examService.publishExam(id);
    fetchExams();
  };

  /* =========================
        EFFECTS
  ========================= */

  useEffect(() => {
    fetchExams();
  }, [token]);

  useEffect(() => {
    if (selectedExam) {
      fetchRegistrations(selectedExam);
      fetchSubmissions(selectedExam);
      setSelectedStudent("");
    }
  }, [selectedExam]);

  /* =========================
        RENDER
  ========================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Exams</h2>
          <p className="text-sm text-muted-foreground">
            Full administrative control (Option 3).
          </p>
        </div>
        <CreateExamDialog onCreated={fetchExams} />
      </div>

      {/* EXAMS TABLE */}
      <div className="border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Belt</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((exam) => (
              <tr key={exam._id} className="border-t">
                <td className="p-2">{exam.title}</td>
                <td className="p-2 capitalize">{exam.beltLevel}</td>
                <td className="p-2 capitalize">{exam.status}</td>
                <td className="p-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setOpenExamId(openExamId === exam._id ? "" : exam._id);
                      setSelectedExam(exam._id);
                    }}
                  >
                    {openExamId === exam._id ? "Close" : "Manage"}
                  </Button>

                  {exam.status !== "published" && (
                    <Button
                      size="sm"
                      onClick={() => publishExamAdmin(exam._id)}
                    >
                      Publish
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAILS */}
      <Accordion
        type="single"
        collapsible
        value={openExamId}
        onValueChange={setOpenExamId}
      >
        {exams.map((exam) => {
          if (exam._id !== openExamId) return null;

          const examRegs = registrations.filter(
            (r) => String(r.exam?._id) === exam._id
          );

          const examSubs = submissions.filter(
            (s) => String(s.exam?._id) === exam._id
          );

          const pendingSubs = examSubs.filter((s) => !s.finalPassed);

          const selectedSubmission = pendingSubs.find(
            (s) => String(s.student?._id) === String(selectedStudent)
          );

          return (
            <AccordionItem key={exam._id} value={exam._id}>
              <AccordionTrigger>
                {exam.title} – {exam.beltLevel}
              </AccordionTrigger>

              <AccordionContent className="space-y-6 p-4">
                {/* REGISTRATIONS */}
                <section>
                  <h3 className="font-semibold mb-2">Registrations</h3>
                  <RegistrationList
                    list={examRegs}
                    onApprove={approveFn}
                    onReject={rejectFn}
                  />
                </section>

                {/* THEORY SUBMISSIONS */}
                <section>
                  <h3 className="font-semibold mb-2">Theory Submissions</h3>
                  <SubmissionsList
                    list={pendingSubs}
                    onSelect={(studentId) => setSelectedStudent(studentId)}
                  />
                </section>

                {/* PRACTICAL + FINALIZE */}
                {selectedSubmission && selectedSubmission.theoryPassed && (
                  <section className="space-y-3">
                    <PracticalScoreDialog
                      studentId={selectedStudent}
                      examId={selectedExam}
                      practicalRecorded={selectedSubmission.practicalRecorded}
                      finalPassed={selectedSubmission.finalPassed}
                      onSaved={() => fetchSubmissions(selectedExam)}
                    />

                    <FinalizeResultButton
                      studentId={selectedStudent}
                      examId={selectedExam}
                      finalPassed={selectedSubmission.finalPassed}
                      practicalRecorded={selectedSubmission.practicalRecorded}
                      onFinalized={() => fetchSubmissions(selectedExam)}
                    />
                  </section>
                )}

                {/* FINAL CERTIFICATES */}
                {examSubs.filter((s) => s.finalPassed).length > 0 && (
                  <section>
                    <h3 className="font-semibold">Final Results</h3>
                    {examSubs
                      .filter((s) => s.finalPassed)
                      .map((s) => (
                        <Button
                          key={s._id}
                          onClick={() =>
                            window.open(
                              `${API_BASE_URL}/certificates/admin/pdf/${exam._id}/${s.student._id}`
                            )
                          }
                        >
                          Print Certificate – {s.student.name}
                        </Button>
                      ))}
                  </section>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default ExamScreen;
