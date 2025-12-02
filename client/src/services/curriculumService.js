import apiClient from "@/shared/api/apiClient";

const curriculumService = {
  getByBelt: (belt) => apiClient.get(`/curriculum/${belt}`),
  getPdf: (belt) => apiClient.get(`/curriculum/${belt}/pdf`),
};

export default curriculumService;
