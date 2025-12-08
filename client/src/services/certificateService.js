import apiClient from "@/shared/api/apiClient";

const certificateService = {
  /* ================================
     STUDENT
  ================================== */
  myCertificates: () => apiClient.get("/certificates/my"),
  getMyCertificates: () => apiClient.get("/certificates/my"),

  /* ================================
     ADMIN — GET ALL
  ================================== */
  listAdmin: () => apiClient.get("/certificates/admin/all"),

  /* ================================
     ADMIN — ISSUANCE (LESSON / MODULE / PROGRAM)
  ================================== */
  issueLesson: (lessonId, studentId) =>
    apiClient.post(`/certificates/lesson/${lessonId}/${studentId}`),

  issueModule: (moduleId, studentId) =>
    apiClient.post(`/certificates/module/${moduleId}/${studentId}`),

  issueProgram: (programId, studentId) =>
    apiClient.post(`/certificates/program/${programId}/${studentId}`),

  /* ================================
     ADMIN — PERFORMANCE, ATTENDANCE, MANUAL
  ================================== */
  issuePerformance: (studentId) =>
    apiClient.post(`/certificates/performance/${studentId}`),

  issueAttendance: (lessonId, studentId) =>
    apiClient.post(`/certificates/attendance/${lessonId}/${studentId}`),

  issueManual: (studentId) =>
    apiClient.post(`/certificates/manual/${studentId}`),

  /* ================================
     ADMIN — EXAM CERTIFICATES
  ================================== */
  // Normal official exam certificate
  issueExamCertificate: (examId, studentId) =>
    apiClient.post(`/certificates/exam/${examId}/${studentId}`),

  // Override (manual issue even if failed)
  issueExamOverride: (examId, studentId) =>
    apiClient.post(`/certificates/exam/override/${examId}/${studentId}`),

  /* ================================
     EXAM — CHECK EXISTS
  ================================== */
  // Used by CertificateGenerator
  checkCertificate: (examId, studentId) =>
    apiClient.get(`/certificates/pdf/${examId}/${studentId}`, {
      validateStatus: () => true, // allow 404 without throwing
    }),

  /* ================================
     EXAM — GENERATE CERTIFICATE (ADMIN)
     (called after finalization if no certificate exists)
  ================================== */
  generateCertificate: (body) =>
    apiClient.post(`/certificates/exam/${body.examId}/${body.studentId}`, {}),

  /* ================================
     PDF DOWNLOAD (ADMIN)
  ================================== */

  getCertificateData: (examId, studentId) =>
    apiClient.get(`/certificates/data/${examId}/${studentId}`),
};

export default certificateService;
