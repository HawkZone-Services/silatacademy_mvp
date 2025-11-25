import apiClient from "@/lib/apiClient";

const programService = {
  getPrograms: () => apiClient.get("/programs"),
  getProgramById: (id) => apiClient.get(`/programs/${id}`),
};

export default programService;
