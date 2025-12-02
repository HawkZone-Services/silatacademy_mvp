import apiClient from "@/shared/api/apiClient";

const certificateService = {
  listAdmin: () => apiClient.get("/certificates/admin/all"),
  myCertificates: () => apiClient.get("/certificates/my"),
  getMyCertificates: () => apiClient.get("/certificates/my"),
  create: (body) =>
    apiClient.post(`/certificates/manual/${body.userId}`, body),

  issueLesson: (lessonId, studentId) =>
    apiClient.post(`/certificates/lesson/${lessonId}/${studentId}`),

  issueModule: (moduleId, studentId) =>
    apiClient.post(`/certificates/module/${moduleId}/${studentId}`),

  issueProgram: (programId, studentId) =>
    apiClient.post(`/certificates/program/${programId}/${studentId}`),

  issuePerformance: (studentId) =>
    apiClient.post(`/certificates/performance/${studentId}`),

  issueManual: (studentId) =>
    apiClient.post(`/certificates/manual/${studentId}`),

  issueExamOverride: (examId, studentId) =>
    apiClient.post(`/certificates/exam/override/${examId}/${studentId}`),
};

export default certificateService;
