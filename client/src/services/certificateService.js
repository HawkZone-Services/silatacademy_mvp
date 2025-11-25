import apiClient from "@/lib/apiClient";

const certificateService = {
  getMyCertificates: () => apiClient.get("/certificates/my"),
  downloadPDF: (examId, studentId) =>
    apiClient.get(`/certificates/pdf/${examId}/${studentId}`),
  adminDownloadPDF: (examId, studentId) =>
    apiClient.get(`/certificates/admin/pdf/${examId}/${studentId}`),
  checkCertificate: (examId, studentId) =>
    apiClient.get(`/certificates/check/${examId}/${studentId}`),
  generateCertificate: (body) =>
    apiClient.post("/certificates/generate", { body }),
};

export default certificateService;
