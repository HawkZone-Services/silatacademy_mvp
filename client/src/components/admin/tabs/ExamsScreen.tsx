// ======= FULLY FIXED ExamScreen.jsx =======

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

  /* ============================
        FETCHERS
  ============================ */

  const fetchExams = async () => {
    try {
      const res = await examService.getAllExams();
      const list = res?.data?.exams || [];

      setExams(list);
      console.log("Fetched Exams:", list);

      if (!selectedExam && list.length > 0) {
        setSelectedExam(list[0]._id);
      }
    } catch (err) {
      console.error("Fetch Exams Error:", err);
    }
  };

  const fetchRegistrations = async () => {
    if (!selectedExam) return setRegistrations([]);

    try {
      const res = await examService.getAdminRegistrations(selectedExam);
      const list = res?.data?.data?.registrations || [];
      setRegistrations(list);
    } catch (err) {
      console.error("Fetch Registrations Error:", err);
      setRegistrations([]);
    }
  };

  const fetchSubmissions = async () => {
    if (!selectedExam) return setSubmissions([]);

    try {
      const res = await examService.getAdminSubmissions(selectedExam);
      const list = res?.data?.data?.submissions || [];
      setSubmissions(list);
    } catch (err) {
      console.error("Fetch Submissions Error:", err);
      setSubmissions([]);
    }
  };

  /* ============================
        ACTIONS
  ============================ */

  const approveFn = async (id) => {
    await examService.approveRegistration(id);
    fetchRegistrations();
  };

  const rejectFn = async (id) => {
    await examService.rejectRegistration(id);
    fetchRegistrations();
  };

  const publishExamAdmin = async (id) => {
    try {
      await examService.publishExam(id);
      fetchExams();
    } catch (err) {
      console.error("Publish Exam Error:", err);
    }
  };

  /* ============================
        EFFECTS
  ============================ */

  useEffect(() => {
    fetchExams();
  }, [token]);

  useEffect(() => {
    fetchRegistrations();
    fetchSubmissions();
    setSelectedStudent("");
  }, [selectedExam]);

  /* ============================
        RENDER
  ============================ */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Exams</h2>
          <p className="text-sm text-muted-foreground">
            Manage exams, registrations, submissions, and certificates.
          </p>
        </div>
        <CreateExamDialog onCreated={fetchExams} />
      </div>

      {/* EXAMS TABLE */}
      <div className="overflow-x-auto border rounded-lg border-border/50">
        <table className="w-full text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-3 py-2 text-sm font-semibold">Exam Title</th>
              <th className="px-3 py-2 text-sm font-semibold">Belt Level</th>
              <th className="px-3 py-2 text-sm font-semibold">Exam Date</th>
              <th className="px-3 py-2 text-sm font-semibold">Registrations</th>
              <th className="px-3 py-2 text-sm font-semibold">Submissions</th>
              <th className="px-3 py-2 text-sm font-semibold">Status</th>
              <th className="px-3 py-2 text-sm font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {exams.map((exam) => {
              const isOpen = openExamId === exam._id;

              const regCount = registrations.filter(
                (r) => String(r.exam?._id) === String(exam._id)
              ).length;

              const subCount = submissions.filter(
                (s) => String(s.exam?._id) === String(exam._id)
              ).length;

              const examDate =
                exam.schedule?.startsAt ||
                exam.schedule?.date ||
                exam.createdAt ||
                "";

              const formattedDate = examDate
                ? new Date(examDate).toLocaleDateString()
                : "-";

              return (
                <tr
                  key={exam._id}
                  className="border-t border-border/50 text-sm"
                >
                  <td className="px-3 py-2">{exam.title}</td>
                  <td className="px-3 py-2 capitalize">{exam.beltLevel}</td>
                  <td className="px-3 py-2">{formattedDate}</td>
                  <td className="px-3 py-2">{regCount}</td>
                  <td className="px-3 py-2">{subCount}</td>
                  <td className="px-3 py-2 capitalize">
                    {exam.status || "draft"}
                  </td>

                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOpenExamId(isOpen ? "" : exam._id);
                          if (!isOpen) setSelectedExam(exam._id);
                        }}
                      >
                        {isOpen ? "Collapse" : "Expand"}
                      </Button>

                      {exam.status !== "published" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => publishExamAdmin(exam._id)}
                        >
                          Publish
                        </Button>
                      )}

                      <Button size="sm" variant="destructive" disabled>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* EXAM DETAILS */}
      <Accordion
        type="single"
        collapsible
        value={openExamId}
        onValueChange={(val) => {
          setOpenExamId(val);
          if (val) setSelectedExam(val);
        }}
        className="space-y-3"
      >
        {exams.map((exam) => {
          const examRegs = registrations.filter(
            (r) => String(r.exam?._id) === String(exam._id)
          );

          const examSubs = submissions.filter(
            (s) => String(s.exam?._id) === String(exam._id)
          );

          const finalizedSubs = examSubs.filter((s) => s.finalPassed);
          const pendingSubs = examSubs.filter((s) => !s.finalPassed);

          const selectedSubmission = pendingSubs.find((s) => {
            const studentId =
              typeof s.student === "object" ? s.student?._id : s.student;
            return (
              String(studentId) === String(selectedStudent) &&
              String(exam._id) === String(selectedExam)
            );
          });

          return (
            <AccordionItem key={exam._id} value={exam._id} className="border">
              <AccordionTrigger className="px-4 py-2">
                <div>
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {exam.beltLevel} • {exam.status}
                  </p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 py-4 space-y-6">
                {/* REGISTRATIONS */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Exam Registrations
                    </h3>

                    <Select
                      value={selectedExam}
                      onValueChange={(val) => {
                        setSelectedExam(val);
                        setOpenExamId(val);
                        setSelectedStudent("");
                      }}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue placeholder="Select Exam" />
                      </SelectTrigger>

                      <SelectContent>
                        {exams.map((e) => (
                          <SelectItem key={e._id} value={e._id}>
                            {e.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <RegistrationList
                    list={examRegs}
                    onApprove={approveFn}
                    onReject={rejectFn}
                  />
                </section>

                {/* SUBMISSIONS */}
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold">Exam Submissions</h3>

                  <SubmissionsList
                    list={pendingSubs}
                    onSelect={(studentId, examId) => {
                      setSelectedStudent(studentId);
                      setSelectedExam(examId);
                      setOpenExamId(examId);
                    }}
                  />
                </section>

                {/* PRACTICAL & FINALIZE */}
                {selectedSubmission && (
                  <section className="space-y-3">
                    <h3 className="text-lg font-semibold">
                      Practical Evaluation
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      <PracticalScoreDialog
                        studentId={selectedStudent}
                        examId={selectedExam}
                        finalPassed={selectedSubmission.finalPassed}
                        practicalRecorded={selectedSubmission.practicalRecorded}
                        onSaved={fetchSubmissions}
                      />

                      <FinalizeResultButton
                        studentId={selectedStudent}
                        examId={selectedExam}
                        finalPassed={selectedSubmission.finalPassed}
                        onFinalized={fetchSubmissions}
                      />

                      <CertificateGenerator
                        studentId={selectedStudent}
                        examId={selectedExam}
                        finalPassed={selectedSubmission.finalPassed}
                      />
                    </div>
                  </section>
                )}

                {/* FINAL CERTIFICATES */}
                {finalizedSubs.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-lg font-semibold">
                      Finalized Certificates
                    </h3>

                    <div className="overflow-x-auto border rounded-lg border-border/50">
                      <table className="w-full text-left">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-sm font-semibold">
                              Student
                            </th>
                            <th className="px-3 py-2 text-sm font-semibold">
                              Belt Level
                            </th>
                            <th className="px-3 py-2 text-sm font-semibold">
                              Date
                            </th>
                            <th className="px-3 py-2 text-sm font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {finalizedSubs.map((s) => {
                            const studentName = s.student?.name || "Student";
                            const belt = s.exam?.beltLevel || "-";

                            const issueDate = s.finalizedAt
                              ? new Date(s.finalizedAt).toLocaleDateString()
                              : "-";

                            const examId =
                              typeof s.exam === "object" ? s.exam?._id : s.exam;

                            const studentId =
                              typeof s.student === "object"
                                ? s.student?._id
                                : s.student;

                            const handlePrint = () => {
                              window.open(
                                `${API_BASE_URL}/certificates/admin/pdf/${examId}/${studentId}`,
                                "_blank"
                              );
                            };

                            return (
                              <tr
                                key={s._id}
                                className="border-t border-border/50 text-sm"
                              >
                                <td className="px-3 py-2">{studentName}</td>
                                <td className="px-3 py-2 capitalize">{belt}</td>
                                <td className="px-3 py-2">{issueDate}</td>
                                <td className="px-3 py-2">
                                  <button
                                    onClick={handlePrint}
                                    className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
                                  >
                                    Print Certificate
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
