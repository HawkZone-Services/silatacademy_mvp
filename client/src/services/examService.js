import apiClient from "@/lib/apiClient";

const examService = {
  // Student-facing
  getExam: (id) => apiClient.get(`/exams/${id}`),
  getMyAttempts: () => apiClient.get("/exams/my-attempts"),
  getAvailableExams: (beltLevel) =>
    apiClient.get(`/exams/available/${beltLevel}`),
  getRegistrationStatus: (examId) =>
    apiClient.get(`/exams/registration/status/${examId}`),
  registerForExam: (body) => apiClient.post("/exams/register", { body }),
  startAttempt: (body) => apiClient.post("/exams/attempt/start", { body }),
  submitAttempt: (body) => apiClient.post("/exams/attempt/submit", { body }),

  // Admin-facing
  getAllExams: () => apiClient.get("/exams"),
  getAdminRegistrations: (examId) =>
    apiClient.get(`/exams/admin/registrations/${examId}`),
  getAdminSubmissions: (examId) =>
    apiClient.get(`/exams/admin/submissions/${examId}`),
  approveRegistration: (regId) =>
    apiClient.patch(`/exams/admin/registration/${regId}/approve`),
  rejectRegistration: (regId) =>
    apiClient.patch(`/exams/admin/registration/${regId}/reject`),
  createExamAdmin: (body) => apiClient.post("/exams/admin", { body }),
  publishExam: (examId) =>
    apiClient.patch(`/exams/admin/${examId}/publish`),
  updateExam: (examId, body) =>
    apiClient.patch(`/exams/admin/${examId}`, { body }),
  savePracticalScore: (body) =>
    apiClient.post("/exams/admin/practical/score", { body }),
  finalizeExam: (body) => apiClient.post("/exams/admin/finalize", { body }),
  gradeManual: (id, body) =>
    apiClient.post(`/exams/admin/${id}/grade`, { body }),
};

export default examService;
