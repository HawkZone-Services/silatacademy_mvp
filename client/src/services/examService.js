// src/services/examService.ts

import apiClient from "@/shared/api/apiClient";

const examService = {
  /* ==============================
        STUDENT
  =============================== */

  getExam: (id) => apiClient.get(`/exams/${id}`),

  getMyAttempts: () => apiClient.get("/exams/my-attempts"),

  getAvailableExams: (beltLevel) =>
    apiClient.get(
      beltLevel ? `/exams/available/${beltLevel}` : `/exams/available`
    ),

  getRegistrationStatus: (examId) =>
    apiClient.get(`/exams/registration/status/${examId}`),

  registerForExam: (body) => apiClient.post(`/exams/register`, body),

  startAttempt: (examIdOrBody) => {
    const payload =
      typeof examIdOrBody === "string"
        ? { examId: examIdOrBody }
        : examIdOrBody;

    return apiClient.post(`/exams/attempt/start`, payload);
  },

  submitAttempt: (body) => apiClient.post(`/exams/attempt/submit`, body),

  /* ==============================
        ADMIN + INSTRUCTOR
  =============================== */

  // GET all exams (admin can see drafts too)
  getAllExams: () => apiClient.get(`/exams`),

  getAdminRegistrations: (examId) =>
    apiClient.get(`/exams/admin/registrations/${examId}`),

  getAdminSubmissions: (examId) =>
    apiClient.get(`/exams/admin/submissions/${examId}`),

  approveRegistration: (regId) =>
    apiClient.patch(`/exams/admin/registration/${regId}/approve`),

  rejectRegistration: (regId) =>
    apiClient.patch(`/exams/admin/registration/${regId}/reject`),

  // Create exam
  createExamAdmin: (body) => apiClient.post(`/exams/admin`, body),

  // Publish exam
  publishExam: (examId) => apiClient.patch(`/exams/admin/${examId}/publish`),

  // Update exam
  updateExam: (examId, body) => apiClient.patch(`/exams/admin/${examId}`, body),

  // Practical score
  savePracticalScore: (body) =>
    apiClient.post(`/exams/admin/practical/score`, body),

  // Finalize exam result
  finalizeExam: (body) => apiClient.post(`/exams/admin/finalize`, body),

  // Manual grading
  gradeManual: (attemptId, body) =>
    apiClient.post(`/exams/admin/${attemptId}/grade`, body),
};

export default examService;
