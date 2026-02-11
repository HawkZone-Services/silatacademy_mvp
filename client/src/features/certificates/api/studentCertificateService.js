import apiClient from "@/shared/api/apiClient";

const studentCertificateService = {
  getMyCertificates: () => apiClient.get("/certificates/my"),

  downloadPdf: (examId, studentId) =>
    apiClient.get(`/certificates/pdf/${examId}/${studentId}`),
};

export default studentCertificateService;
