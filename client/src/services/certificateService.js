import apiClient from "@/lib/apiClient";

const certificateService = {
  getMyCertificates: () => apiClient.get("/certificates/my"),
  downloadPDF: (examId, studentId) =>
    apiClient.get(`/certificates/pdf/${examId}/${studentId}`),
  checkCertificate: (examId, studentId) =>
    apiClient.get(`/certificates/check/${examId}/${studentId}`),
  generateCertificate: (body) =>
    apiClient.post("/certificates/generate", { body }),
  getCurriculumPDF: (belt) => apiClient.get(`/curriculum/${belt}/pdf`),
};

export default certificateService;
